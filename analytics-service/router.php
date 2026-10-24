<?php
// Development only. The PHP built-in server does not read .htaccess.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (preg_match('~(?:^|/)(?:private|setup\.php|router\.php)(?:/|$)~i', $path) || str_contains($path, '..')) {
    http_response_code(404); exit;
}
return false;
