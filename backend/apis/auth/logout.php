<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/connect.php';
use App\controllers\AuthController;

try {
    $controller = new AuthController($dbh);
    $controller->logout();
} catch (\Throwable $e) {
    $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => 'An internal server error occurred.']);
    exit;
}