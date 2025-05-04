<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/connect.php';
require_once __DIR__ . '/../auth/auth_check.php';
use App\controllers\MessagesController;

try {
    $controller = new MessagesController($dbh);
    $controller->getMessages();
} catch (\Throwable $e) {
    $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}