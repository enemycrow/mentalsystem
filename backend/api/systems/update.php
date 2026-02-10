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

$objective_id = (int) ($input['objective_id'] ?? 0);
$purpose      = trim($input['purpose'] ?? '');

if ($objective_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'objective_id is required']);
    exit();
}

if (empty($purpose)) {
    http_response_code(400);
    echo json_encode(['error' => 'purpose is required']);
    exit();
}

// Verify ownership via objective
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

// Find existing system
$stmt = $db->prepare('SELECT id FROM systems WHERE objective_id = :objective_id');
$stmt->execute([':objective_id' => $objective_id]);
$system = $stmt->fetch();

try {
    $db->beginTransaction();

    if ($system) {
        $system_id = (int) $system['id'];

        // Delete old interactions and elements (interactions first due to FK)
        $stmt = $db->prepare('DELETE FROM system_interactions WHERE system_id = :system_id');
        $stmt->execute([':system_id' => $system_id]);

        $stmt = $db->prepare('DELETE FROM system_elements WHERE system_id = :system_id');
        $stmt->execute([':system_id' => $system_id]);

        // Update purpose
        $stmt = $db->prepare('UPDATE systems SET purpose = :purpose WHERE id = :id');
        $stmt->execute([':purpose' => $purpose, ':id' => $system_id]);
    } else {
        // Create new system
        $stmt = $db->prepare(
            'INSERT INTO systems (objective_id, purpose) VALUES (:objective_id, :purpose)'
        );
        $stmt->execute([
            ':objective_id' => $objective_id,
            ':purpose'      => $purpose,
        ]);
        $system_id = (int) $db->lastInsertId();
    }

    // Recreate elements
    $elements = $input['elements'] ?? [];
    $element_ids = [];

    foreach ($elements as $element) {
        $stmt = $db->prepare(
            'INSERT INTO system_elements (system_id, name, description)
             VALUES (:system_id, :name, :description)'
        );
        $stmt->execute([
            ':system_id'   => $system_id,
            ':name'        => $element['name'] ?? '',
            ':description' => $element['description'] ?? null,
        ]);
        $element_ids[] = (int) $db->lastInsertId();
    }

    // Recreate interactions
    $interactions = $input['interactions'] ?? [];
    foreach ($interactions as $interaction) {
        $from_index = (int) ($interaction['element_from_index'] ?? -1);
        $to_index   = (int) ($interaction['element_to_index'] ?? -1);

        if (!isset($element_ids[$from_index]) || !isset($element_ids[$to_index])) {
            throw new Exception('Invalid element index in interactions');
        }

        $stmt = $db->prepare(
            'INSERT INTO system_interactions (system_id, element_from_id, element_to_id, description)
             VALUES (:system_id, :from_id, :to_id, :description)'
        );
        $stmt->execute([
            ':system_id'   => $system_id,
            ':from_id'     => $element_ids[$from_index],
            ':to_id'       => $element_ids[$to_index],
            ':description' => $interaction['description'] ?? '',
        ]);
    }

    $db->commit();

    // Return updated system
    $stmt = $db->prepare(
        'SELECT id, purpose, created_at FROM systems WHERE id = :id'
    );
    $stmt->execute([':id' => $system_id]);
    $result = $stmt->fetch();
    $result['id'] = (int) $result['id'];

    // Fetch new elements
    $stmt = $db->prepare(
        'SELECT id, name, description FROM system_elements WHERE system_id = :system_id'
    );
    $stmt->execute([':system_id' => $system_id]);
    $result_elements = $stmt->fetchAll();
    foreach ($result_elements as &$el) {
        $el['id'] = (int) $el['id'];
    }
    unset($el);
    $result['elements'] = $result_elements;

    // Fetch new interactions
    $stmt = $db->prepare(
        'SELECT id, element_from_id, element_to_id, description
         FROM system_interactions
         WHERE system_id = :system_id'
    );
    $stmt->execute([':system_id' => $system_id]);
    $result_interactions = $stmt->fetchAll();
    foreach ($result_interactions as &$inter) {
        $inter['id']              = (int) $inter['id'];
        $inter['element_from_id'] = (int) $inter['element_from_id'];
        $inter['element_to_id']   = (int) $inter['element_to_id'];
    }
    unset($inter);
    $result['interactions'] = $result_interactions;

    echo json_encode(['system' => $result]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
