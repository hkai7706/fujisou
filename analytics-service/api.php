<?php
declare(strict_types=1);
ini_set('display_errors', '0');
require __DIR__ . '/private/bootstrap.php';
try {
    $config = configuration();
    $selfOrigin = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? $selfOrigin;
    $allowed = array_unique(array_merge([$selfOrigin], $config['portal_origins'], array_column($config['sites'], 'origin')));
    if (!in_array($origin, $allowed, true)) reply(403, ['error'=>'Origin is not allowed.']);
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
    $action = $_GET['action'] ?? 'status';
    $methods = ['status'=>'GET','login'=>'POST','collect'=>'POST','summary'=>'GET','logout'=>'POST'];
    if (!isset($methods[$action])) reply(404,['error'=>'Unknown endpoint.']);
    if ($_SERVER['REQUEST_METHOD'] !== $methods[$action]) reply(405,['error'=>'Method not allowed.']);
    if ($action === 'status') reply(200,['service'=>'fujisou-analytics','version'=>1,'configured'=>true]);
    $db = database($config);
    $ipKey = hash_hmac('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ':' . gmdate('Y-m-d'), $config['secret']);
    if ($action === 'login') {
        rateLimit($db,'login:'.$ipKey,5,900);
        $data=body();
        $password=$data['password']??''; $name=$data['username']??'';
        if (!is_string($password)||strlen($password)>512||!is_string($name)||strlen($name)>100) reply(400,['error'=>'Invalid credentials.']);
        $valid=password_verify($password,$config['password_hash']);
        if (!$valid||!hash_equals($config['admin_name'],$name)) reply(401,['error'=>'Username or password is incorrect.']);
        $token=bin2hex(random_bytes(32)); $expires=time()+3600;
        $db->prepare('INSERT INTO admin_sessions(token_hash,expires) VALUES(?,?)')->execute([hash('sha256',$token),$expires]);
        $db->prepare('DELETE FROM limits WHERE bucket=?')->execute(['login:'.$ipKey]);
        $sites=[];foreach($config['sites'] as $id=>$site)$sites[]=['id'=>$id,'label'=>$site['label'],'baseUrl'=>$site['origin'].$site['base_path']];
        reply(200,['token'=>$token,'expiresAt'=>$expires,'sites'=>$sites]);
    }
    if ($action === 'collect') {
        if (preg_match('/bot|crawler|spider|headless|lighthouse|pagespeed/i',$_SERVER['HTTP_USER_AGENT']??'')) reply(200,['accepted'=>0]);
        rateLimit($db,'collect:'.$ipKey,180,60);
        $data=body();$site=$data['site']??'';
        if (!is_string($site)||!isset($config['sites'][$site])||$config['sites'][$site]['origin']!==$origin) reply(400,['error'=>'Invalid site.']);
        $events=$data['events']??null;
        if (!is_array($events)||count($events)<1||count($events)>20) reply(400,['error'=>'Send between 1 and 20 events.']);
        $catalogue=pages();$accepted=0;$now=time();
        $day=(new DateTimeImmutable('@'.$now))->setTimezone(new DateTimeZone('Asia/Tokyo'))->format('Y-m-d');
        $insert=$db->prepare('INSERT OR IGNORE INTO events(site,event_id,session_key,type,page,target,channel,placement,referrer,device,engaged,scroll,ts,day) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $db->beginTransaction();
        foreach($events as $event) {
            if (!is_array($event)) continue;
            $type=$event['type']??'';$page=route($event['page']??null,$catalogue);
            if (!in_array($type,['view','engagement','link','inquiry','success'],true)||$page===null) continue;
            if (!is_string($event['id']??null)||!preg_match('/^[a-zA-Z0-9_-]{8,64}$/D',$event['id'])) continue;
            if (!is_string($event['session']??null)||!preg_match('/^[a-zA-Z0-9_-]{16,64}$/D',$event['session'])) continue;
            $target='';$channel=in_array($event['channel']??'',['contact','line','phone','email','internal','external','download'],true)?$event['channel']:'';
            if($type==='link') {
                $candidate=$event['target']??'';
                if(!is_string($candidate))continue;
                if(in_array($candidate,['tel:','mailto:'],true))$target=$candidate;
                elseif(($known=route($candidate,$catalogue))!==null)$target=$known;
                elseif(preg_match('~^/catalogs/[a-z0-9-]+\.pdf$~D',$candidate))$target=$candidate;
                elseif(preg_match('~^https://[a-z0-9.-]+(?::[0-9]+)?$~iD',$candidate))$target=$candidate;
                else continue;
            }
            $referrer=$event['referrer']??'direct';
            if(!is_string($referrer)||!preg_match('~^(?:direct|https?://[a-z0-9.-]+(?::[0-9]+)?)$~iD',$referrer))$referrer='direct';
            $device=in_array($event['device']??'',['desktop','mobile','tablet'],true)?$event['device']:'desktop';
            $placement=in_array($event['placement']??'',['header','footer','mobile','content'],true)?$event['placement']:'content';
            $engaged=$type==='engagement'?max(0,min(60000,(int)($event['engaged']??0))):0;
            $scroll=max(0,min(100,(int)($event['scroll']??0)));
            $session=hash_hmac('sha256',$site.':'.$event['session'],$config['secret']);
            $insert->execute([$site,$event['id'],$session,$type,$page,$target,$channel,$placement,$referrer,$device,$engaged,$scroll,$now,$day]);
            $accepted+=$insert->rowCount();
        }
        $db->commit();
        if(random_int(1,50)===1){
            $retention=max(7,min(365,(int)($config['retention_days']??90)));
            $db->prepare('DELETE FROM events WHERE ts<?')->execute([$now-$retention*86400]);
            $db->prepare('DELETE FROM admin_sessions WHERE expires<?')->execute([$now]);
            $db->prepare('DELETE FROM limits WHERE expires<?')->execute([$now]);
        }
        reply(200,['accepted'=>$accepted]);
    }
    $hash=requireAdmin($db);
    if($action==='logout'){$db->prepare('DELETE FROM admin_sessions WHERE token_hash=?')->execute([$hash]);reply(200,['ok'=>true]);}
    rateLimit($db,'report:'.$hash,60,60);
    $site=$_GET['site']??'';
    if(!is_string($site)||!isset($config['sites'][$site]))reply(400,['error'=>'Choose a configured site.']);
    reply(200,summary($db,$config,pages(),$site,(string)($_GET['start']??''),(string)($_GET['end']??'')));
} catch(Throwable $error) {
    error_log('Analytics service error: '.get_class($error));
    reply(503,['error'=>'Analytics storage is temporarily unavailable.']);
}
