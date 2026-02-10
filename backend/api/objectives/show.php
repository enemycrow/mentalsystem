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

$objective_id = (int) ($_GET['id'] ?? 0);
if ($objective_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Objective id is required']);
    exit();
}

// Fetch objective and verify ownership
$stmt = $db->prepare(
    'SELECT id, user_id, title, description, status, created_at
     FROM objectives
     WHERE id = :id'
);
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

$objective['id'] = (int) $objective['id'];
unset($objective['user_id']);

// Fetch reflection
$stmt = $db->prepare(
    'SELECT id, question_1, question_2, question_3, created_at
     FROM reflections
     WHERE objective_id = :objective_id'
);
$stmt->execute([':objective_id' => $objective_id]);
$reflection = $stmt->fetch();
if ($reflection) {
    $reflection['id'] = (int) $reflection['id'];
}

// Fetch system
$stmt = $db->prepare(
    'SELECT id, purpose, created_at
     FROM systems
     WHERE objective_id = :objective_id'
);
$stmt->execute([':objective_id' => $objective_id]);
$system = $stmt->fetch();

if ($system) {
    $system['id'] = (int) $system['id'];
    $system_id = $system['id'];

    // Fetch elements
    $stmt = $db->prepare(
        'SELECT id, name, description
         FROM system_elements
         WHERE system_id = :system_id'
    );
    $stmt->execute([':system_id' => $system_id]);
    $elements = $stmt->fetchAll();
    foreach ($elements as &$el) {
        $el['id'] = (int) $el['id'];
    }
    unset($el);
    $system['elements'] = $elements;

    // Fetch interactions
    $stmt = $db->prepare(
        'SELECT id, element_from_id, element_to_id, description
         FROM system_interactions
         WHERE system_id = :system_id'
    );
    $stmt->execute([':system_id' => $system_id]);
    $interactions = $stmt->fetchAll();
    foreach ($interactions as &$inter) {
        $inter['id']              = (int) $inter['id'];
        $inter['element_from_id'] = (int) $inter['element_from_id'];
        $inter['element_to_id']   = (int) $inter['element_to_id'];
    }
    unset($inter);
    $system['interactions'] = $interactions;
}

echo json_encode([
    'objective'  => $objective,
    'reflection' => $reflection ?: null,
    'system'     => $system ?: null,
]);
