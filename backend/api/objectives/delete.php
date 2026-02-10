<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = authenticate();
$db = getDbConnection();

$objective_id = (int) ($_GET['id'] ?? 0);
if ($objective_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Objective id is required']);
    exit();
}

// Verify ownership
$stmt = $db->prepare('SELECT id, user_id FROM objectives WHERE id = :id');
$stmt->execute([':id' => $objective_id]);
$objective = $stmt->fetch();

if (!$objective) {
    http_response_code(404);
    echo json_encode(['error' => 'Objective not found']);
    exit();
}

if ((int) $objective['user_id'] !== $user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$stmt = $db->prepare('DELETE FROM objectives WHERE id = :id');
$stmt->execute([':id' => $objective_id]);

echo json_encode(['message' => 'Objective deleted successfully']);
