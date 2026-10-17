# Additional server-side checks for the redesigned contact form.
# Do not echo submitted values into the response.
use Encode ();
my $site_error = '';
delete $_POST{'mfp_testmode'};
my %site_required = ('氏名' => 100, 'email' => 254, 'お問い合わせ内容' => 5000, 'お問い合わせ種別' => 50);
foreach my $key (keys %site_required) {
    my $value = $_POST{$key};
    my $decoded = eval { Encode::decode('UTF-8', $value, Encode::FB_CROAK()) };
    if ($@ || !defined($decoded) || $decoded !~ /\S/ || length($decoded) > $site_required{$key}) { $site_error = '入力内容をご確認ください。必須項目と文字数を確認して、もう一度お試しください。'; }
}
if ($_POST{'email'} !~ /\A[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+\@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}\z/ || $_POST{'email'} =~ /[\r\n\s]/) { $site_error = 'メールアドレスをご確認ください。'; }
if ($_POST{'お問い合わせ種別'} !~ /\A(?:家づくりのご相談|資料請求|見学のご相談|その他)\z/ || $_POST{'個人情報の取り扱いへの同意'} ne '同意する') { $site_error = 'お問い合わせ種別と個人情報の取り扱いへの同意をご確認ください。'; }
if ($_POST{'website_url'} ne '') { $site_error = '送信を受け付けられませんでした。'; }
foreach my $key ('電話番号', '住所') {
    my $value = $_POST{$key} || '';
    my $decoded = eval { Encode::decode('UTF-8', $value, Encode::FB_CROAK()) };
    my $limit = $key eq '住所' ? 300 : 40;
    if ($@ || length($decoded) > $limit) { $site_error = '電話番号またはご住所の文字数をご確認ください。'; }
}
my $site_origin = $ENV{'HTTP_ORIGIN'} || $ENV{'HTTP_REFERER'} || '';
my $site_host = quotemeta($ENV{'HTTP_HOST'});
if ($site_origin !~ m{\Ahttps?://$site_host(?:/|\z)}i) { $site_error = 'お問い合わせページを開き直してお試しください。'; }
foreach my $key ('第1希望日', '第2希望日') {
    my $value = $_POST{$key} || '';
    if ($value ne '') {
        my ($year, $month, $day) = $value =~ /\A(\d{4})-(\d{2})-(\d{2})\z/;
        my @days = (0,31,28,31,30,31,30,31,31,30,31,30,31);
        $days[2] = 29 if $year && ($year % 400 == 0 || ($year % 4 == 0 && $year % 100 != 0));
        if (!$year || $month < 1 || $month > 12 || $day < 1 || $day > $days[$month] || $value lt $_ENV{'mfp_day'}) { $site_error = '希望日は本日以降の有効な日付を選択してください。'; }
    }
}
if ($_POST{'参加人数'} ne '' && $_POST{'参加人数'} !~ /\A(?:[1-8]名|9名以上)\z/) { $site_error = '参加人数をご確認ください。'; }
foreach my $key ('第1希望時間', '第2希望時間') {
    if ($_POST{$key} ne '' && $_POST{$key} !~ /\A(?:午前（9:00〜12:00）|午後（13:00〜16:00）|夕方（16:00〜18:00）)\z/) { $site_error = '希望時間帯をご確認ください。'; }
}
if ($site_error eq '') {
    use Digest::MD5 ();
    use Fcntl qw(:flock);
    my $file = $config{'data.dir'} . 'site-rate-' . Digest::MD5::md5_hex($ENV{'REMOTE_ADDR'} || 'unknown') . '.cgi';
    if (open(my $rate, '+>>', $file)) {
        flock($rate, LOCK_EX);
        seek($rate, 0, 0);
        my ($start, $count) = split(/,/, scalar(<$rate>) || '0,0');
        my $now = time;
        if ($now - $start >= 600) { $start = $now; $count = 0; }
        if ($count >= 5) { $site_error = '短時間に複数の送信がありました。しばらく待ってから再度お試しください。'; }
        else { seek($rate, 0, 0); truncate($rate, 0); print $rate "$start," . ($count + 1); }
        close($rate);
    } else { $site_error = '現在送信を受け付けられません。入力内容を保存したまま、時間をおいて再度お試しください。'; }
}
if ($site_error ne '') {
    print "Status: 400 Bad Request\nContent-Type: text/html; charset=UTF-8\nCache-Control: no-store\n\n";
    print '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>入力内容をご確認ください｜フジ創アイノス</title><main><h1>送信は完了していません</h1><p>' . $site_error . '</p><p>ブラウザーで戻ると、入力内容を確認して再度送信できます。</p><button onclick="history.back()">入力画面へ戻る</button></main></html>';
    exit;
}
$config{'mailto'} = $_POST{'email'};
1;
