<?php
declare(strict_types=1);

function reply(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
function configuration(): array {
    $file = getenv('ANALYTICS_CONFIG') ?: __DIR__ . '/config.php';
    if (!is_file($file)) { header('Access-Control-Allow-Origin: *'); reply(503, ['error' => 'Analytics service has not been configured.']); }
    $config = require $file;
    if (!is_array($config) || strlen($config['secret'] ?? '') < 32 || empty($config['password_hash']) || empty($config['sites'])) {
        reply(503, ['error' => 'Analytics configuration is incomplete.']);
    }
    return $config;
}
function database(array $config): PDO {
    $directory = $config['data_dir'];
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Storage unavailable');
    $db = new PDO('sqlite:' . $directory . '/traffic.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $db->exec('PRAGMA busy_timeout=5000');
    $db->exec('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, site TEXT NOT NULL, event_id TEXT NOT NULL, session_key TEXT NOT NULL, type TEXT NOT NULL, page TEXT NOT NULL, target TEXT NOT NULL DEFAULT "", channel TEXT NOT NULL DEFAULT "", placement TEXT NOT NULL DEFAULT "content", referrer TEXT NOT NULL DEFAULT "direct", device TEXT NOT NULL DEFAULT "desktop", engaged INTEGER NOT NULL DEFAULT 0, scroll INTEGER NOT NULL DEFAULT 0, ts INTEGER NOT NULL, day TEXT NOT NULL, UNIQUE(site,event_id))');
    $db->exec('CREATE INDEX IF NOT EXISTS events_time ON events(site,ts)');
    $db->exec('CREATE INDEX IF NOT EXISTS events_session ON events(site,session_key,type,ts)');
    $db->exec('CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)');
    return $db;
}
function query(PDO $db, string $sql, array $values = []): array {
    $statement = $db->prepare($sql); $statement->execute($values); return $statement->fetchAll();
}
function rateLimit(PDO $db, string $bucket, int $maximum, int $seconds): void {
    $now = time();
    $db->beginTransaction();
    try {
        $db->prepare('INSERT INTO limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN ? ELSE expires END')->execute([$bucket,$now+$seconds,$now,$now,$now+$seconds]);
        $row = query($db, 'SELECT count FROM limits WHERE bucket=?', [$bucket])[0];
        $db->commit();
    } catch (Throwable $error) { if ($db->inTransaction()) $db->rollBack(); throw $error; }
    if ((int)$row['count'] > $maximum) reply(429, ['error' => 'Too many requests. Try again later.']);
}
function body(): array {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) reply(413, ['error' => 'Request too large.']);
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if (strlen($raw) > 16384) reply(413, ['error' => 'Request too large.']);
    try { $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); } catch (Throwable) { reply(400, ['error' => 'Invalid JSON.']); }
    if (!is_array($data)) reply(400, ['error' => 'Invalid request.']);
    return $data;
}
function requireAdmin(PDO $db): string {
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/D', $authorization, $match)) reply(401, ['error' => 'Sign in to view analytics.']);
    $hash = hash('sha256', $match[1]);
    if (!query($db, 'SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires>?', [$hash,time()])) reply(401, ['error' => 'Your session expired. Sign in again.']);
    return $hash;
}
function pages(): array {
    $file = getenv('ANALYTICS_PAGES') ?: __DIR__ . '/pages.json';
    if (!is_file($file)) reply(503, ['error' => 'Page catalogue is missing. Rebuild the analytics package.']);
    return json_decode(file_get_contents($file), true, 32, JSON_THROW_ON_ERROR);
}
function route(mixed $value, array $pages): ?string {
    if (!is_string($value) || strlen($value) > 1600) return null;
    $value = rawurldecode($value);
    $value = preg_replace('~/index\.html$~', '/', $value);
    return isset($pages[$value]) ? $value : null;
}
function summary(PDO $db, array $config, array $pages, string $site, string $start, string $end): array {
    $zone = new DateTimeZone('Asia/Tokyo');
    $a = DateTimeImmutable::createFromFormat('!Y-m-d', $start, $zone);
    $b = DateTimeImmutable::createFromFormat('!Y-m-d', $end, $zone);
    if (!$a || !$b || $a->format('Y-m-d') !== $start || $b->format('Y-m-d') !== $end || $a > $b || $a->diff($b)->days > 89 || $b > new DateTimeImmutable('today', $zone)) reply(400, ['error' => 'Choose a valid date range of up to 90 days, ending today or earlier.']);
    $from = $a->getTimestamp(); $until = $b->modify('+1 day')->getTimestamp(); $duration = $until-$from;
    $totals = function(int $from, int $until) use ($db,$site): array {
        $row = query($db, 'SELECT COUNT(DISTINCT CASE WHEN type="view" THEN session_key END) visits, SUM(CASE WHEN type="view" THEN 1 ELSE 0 END) views, SUM(CASE WHEN type="inquiry" THEN 1 ELSE 0 END) actions, COALESCE(SUM(engaged),0) engaged FROM events WHERE site=? AND ts>=? AND ts<?', [$site,$from,$until])[0];
        return array_map(fn($v)=>(int)$v,$row);
    };
    $values = [$site,$from,$until];
    $daily = query($db, 'SELECT day, COUNT(DISTINCT CASE WHEN type="view" THEN session_key END) visits, SUM(CASE WHEN type="view" THEN 1 ELSE 0 END) views, SUM(CASE WHEN type="inquiry" THEN 1 ELSE 0 END) actions FROM events WHERE site=? AND ts>=? AND ts<? GROUP BY day ORDER BY day', $values);
    $top = query($db, 'SELECT page, SUM(CASE WHEN type="view" THEN 1 ELSE 0 END) views, COUNT(DISTINCT CASE WHEN type="view" THEN session_key END) visits, SUM(engaged) engaged, MAX(scroll) scroll FROM events WHERE site=? AND ts>=? AND ts<? GROUP BY page ORDER BY views DESC LIMIT 20', $values);
    $influence = query($db, 'SELECT v.page, COUNT(*) visits, SUM(CASE WHEN c.last_action>=v.first_view THEN 1 ELSE 0 END) action_visits FROM (SELECT page,session_key,MIN(ts) first_view FROM events WHERE site=? AND ts>=? AND ts<? AND type="view" GROUP BY page,session_key) v LEFT JOIN (SELECT session_key,MAX(ts) last_action FROM events WHERE site=? AND ts>=? AND ts<? AND type="inquiry" GROUP BY session_key) c ON v.session_key=c.session_key GROUP BY v.page ORDER BY action_visits DESC, visits DESC LIMIT 20', array_merge($values,$values));
    foreach ($top as &$row) $row['title'] = $pages[$row['page']]['title'] ?? $row['page']; unset($row);
    foreach ($influence as &$row) $row['title'] = $pages[$row['page']]['title'] ?? $row['page']; unset($row);
    return ['site'=>$site,'period'=>['start'=>$start,'end'=>$end,'timezone'=>'Asia/Tokyo'],'totals'=>$totals($from,$until),'previous'=>$totals($from-$duration,$from),'daily'=>$daily,'pages'=>$top,'influence'=>$influence,
        'links'=>query($db,'SELECT page,target,channel,placement,COUNT(*) clicks FROM events WHERE site=? AND ts>=? AND ts<? AND type="link" GROUP BY page,target,channel,placement ORDER BY clicks DESC LIMIT 30',$values),
        'sources'=>query($db,'SELECT referrer,COUNT(DISTINCT session_key) visits FROM events WHERE site=? AND ts>=? AND ts<? AND type="view" GROUP BY referrer ORDER BY visits DESC LIMIT 12',$values),
        'devices'=>query($db,'SELECT device,COUNT(DISTINCT session_key) visits FROM events WHERE site=? AND ts>=? AND ts<? AND type="view" GROUP BY device ORDER BY visits DESC',$values)];
}
