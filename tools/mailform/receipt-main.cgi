&_GET;
&_COOKIE;
my $callback = $_GET{'callback'};
if ($callback ne 'fujisouContactReceipt') {
    print "Status: 400 Bad Request\nContent-Type: text/plain; charset=UTF-8\n\nInvalid callback";
    exit;
}
my $received = 0;
my $host = quotemeta($ENV{'HTTP_HOST'});
if ($_COOKIE{'SES'} =~ /\A[A-Za-z0-9_-]{22}\z/ && $ENV{'HTTP_REFERER'} =~ m{\Ahttps?://$host/}i) {
    my $file = $config{'data.dir'} . "json/$_COOKIE{'SES'}.cgi";
    if (-f $file && time - (stat($file))[9] <= 120) { $received = 1; unlink $file; }
}
print "Content-Type: text/javascript; charset=UTF-8\nCache-Control: no-store\nX-Content-Type-Options: nosniff\n\n";
print $callback . '(' . ($received ? 'true' : 'null') . ');';
exit;
