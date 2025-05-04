<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/connect.php';
require_once __DIR__ . '/../auth/auth_check.php';
use App\controllers\ListingsController;

try {
    $controller = new ListingsController($dbh);
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
         http_response_code(405);
         echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
         exit;
    }
    $controller->update();
} catch (\Throwable $e) {
    $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}