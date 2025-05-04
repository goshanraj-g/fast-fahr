<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/connect.php';
require_once __DIR__ . '/../auth/auth_check.php';
use App\controllers\ListingsController;

try {
    $controller = new ListingsController($dbh);

    $listingId = filter_input(INPUT_POST, 'listing_id', FILTER_VALIDATE_INT);

    if (!$listingId || $listingId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid or missing listing_id.']);
        exit;
    }

    $controller->delete($listingId);

} catch (\Throwable $e) {
    $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}