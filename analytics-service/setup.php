<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$file = __DIR__ . '/private/config.php';
if (file_exists($file)) { fwrite(STDERR, "Configuration exists; edit it deliberately rather than resetting your data.\n"); exit(1); }
fwrite(STDOUT, "Choose an admin password (at least 14 characters; entered locally, not in chat): ");
$password = rtrim(fgets(STDIN), "\r\n");
if (strlen($password) < 14) { fwrite(STDERR, "Password is too short.\n"); exit(1); }
fwrite(STDOUT, "Confirm password: ");
if (!hash_equals($password, rtrim(fgets(STDIN), "\r\n"))) { fwrite(STDERR, "Passwords do not match.\n"); exit(1); }
$config = require __DIR__ . '/private/config.example.php';
$config['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
$config['secret'] = bin2hex(random_bytes(32));
unset($config['data_dir']);
// Resolve storage on the destination host, not the computer running setup.
$source = "<?php\n\$config = " . var_export($config, true) . ";\n\$config['data_dir'] = __DIR__ . '/data';\nreturn \$config;\n";
if (file_put_contents($file, $source, LOCK_EX) === false) { fwrite(STDERR, "Could not write configuration.\n"); exit(1); }
@chmod($file, 0600);
fwrite(STDOUT, "Created private/config.php. Upload it privately with the service and preserve it on updates.\n");
