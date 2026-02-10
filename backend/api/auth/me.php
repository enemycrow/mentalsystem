<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = authenticate();
$db = getDbConnection();

$stmt = $db->prepare('SELECT id, name, email, created_at FROM users WHERE id = :id');
$stmt->execute([':id' => $user_id]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit();
}

$user['id'] = (int) $user['id'];

echo json_encode(['user' => $user]);
