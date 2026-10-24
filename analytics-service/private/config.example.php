<?php
// Copy to config.php using setup.php. Never commit/upload another site's secrets.
return [
    'admin_name' => 'admin',
    'password_hash' => '',
    'secret' => '',
    'data_dir' => __DIR__ . '/data',
    'portal_origins' => ['https://hkai7706.github.io', 'https://www.fujisou-ainos.com'],
    'sites' => [
        'preview' => ['label' => 'GitHub preview', 'origin' => 'https://hkai7706.github.io', 'base_path' => '/fujisou/'],
        'production' => ['label' => 'Production', 'origin' => 'https://www.fujisou-ainos.com', 'base_path' => '/'],
    ],
    'retention_days' => 90,
];
