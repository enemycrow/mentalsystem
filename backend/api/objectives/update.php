<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = authenticate();
$db = getDbConnection();

$input = json_decode(file_get_contents('php://input'), true);

$objective_id = (int) ($input['id'] ?? 0);
if ($objective_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Objective id is required']);
    exit();
}

// Verify ownership
$stmt = $db->prepare('SELECT id, user_id, title, description, status FROM objectives WHERE id = :id');
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

// Build dynamic update
$fields = [];
$params = [':id' => $objective_id];

if (isset($input['title'])) {
    $title = trim($input['title']);
    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['error' => 'Title cannot be empty']);
        exit();
    }
    $fields[] = 'title = :title';
    $params[':title'] = $title;
}

if (isset($input['description'])) {
    $fields[] = 'description = :description';
    $params[':description'] = trim($input['description']);
}

if (isset($input['status'])) {
    $allowed = ['active', 'completed', 'archived'];
    if (!in_array($input['status'], $allowed, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Status must be one of: active, completed, archived']);
        exit();
    }
    $fields[] = 'status = :status';
    $params[':status'] = $input['status'];
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit();
}

$sql = 'UPDATE objectives SET ' . implode(', ', $fields) . ' WHERE id = :id';
$stmt = $db->prepare($sql);
$stmt->execute($params);

// Return updated objective
$stmt = $db->prepare(
    'SELECT id, title, description, status, created_at FROM objectives WHERE id = :id'
);
$stmt->execute([':id' => $objective_id]);
$updated = $stmt->fetch();
$updated['id'] = (int) $updated['id'];

echo json_encode(['objective' => $updated]);
