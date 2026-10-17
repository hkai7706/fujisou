if (!$_RESULT{'error'} && $_COOKIE{'SES'} =~ /\A[A-Za-z0-9_-]{22}\z/) {
    &_SAVE($config{'data.dir'} . "json/$_COOKIE{'SES'}.cgi", '1');
}
1;
