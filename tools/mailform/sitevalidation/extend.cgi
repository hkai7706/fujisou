# Run before Mailform Pro reads the request body.
if ($ENV{'REQUEST_METHOD'} eq 'POST' && ($ENV{'CONTENT_LENGTH'} !~ /^\d+$/ || $ENV{'CONTENT_LENGTH'} > 32768)) {
    print "Status: 413 Payload Too Large\nContent-Type: text/html; charset=UTF-8\nCache-Control: no-store\n\n";
    print '<!doctype html><html lang="ja"><meta charset="utf-8"><title>入力内容をご確認ください</title><p>入力内容が長すぎます。ブラウザーで戻り、内容を短くして再度お試しください。</p></html>';
    exit;
}
1;
