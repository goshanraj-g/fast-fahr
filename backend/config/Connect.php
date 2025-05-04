<?php

if (session_status() === PHP_SESSION_NONE) {

    $session_lifetime = 86400;

    session_set_cookie_params([
        'lifetime' => $session_lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

try {
    // Below is what our typical db conncetion would look like, but in a production setting, make sure to use .env to hide info
    $dbh = new PDO(
        "mysql:host=localhost;dbname=fastfahr", // Feel free to use .env to hide db name for proper production setting
        "root", // Feel free to use .env to hide db username for proper production setting
        ""  // Feel free to use .env to hide db password for proper production setting
    );
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("ERROR: Couldn't connect. {$e->getMessage()}");
}
