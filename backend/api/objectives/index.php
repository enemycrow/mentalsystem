<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user_id = authenticate();
$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------------------
// GET - List all objectives for the authenticated user
// ---------------------------------------------------------------------------
if ($method === 'GET') {
    $stmt = $db->prepare(
        'SELECT id, title, description, status, created_at
         FROM objectives
         WHERE user_id = :user_id
         ORDER BY created_at DESC'
    );
    $stmt->execute([':user_id' => $user_id]);
    $objectives = $stmt->fetchAll();

    // Cast id to int
    foreach ($objectives as &$obj) {
        $obj['id'] = (int) $obj['id'];
    }
    unset($obj);

    echo json_encode(['objectives' => $objectives]);
    exit();
}

// ---------------------------------------------------------------------------
// POST - Create a new objective with reflection, system, elements, interactions
// ---------------------------------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['error' => 'Title is required']);
        exit();
    }

    $reflection  = $input['reflection'] ?? null;
    $system      = $input['system'] ?? null;

    try {
        $db->beginTransaction();

        // 1. Create objective
        $stmt = $db->prepare(
            'INSERT INTO objectives (user_id, title, description) VALUES (:user_id, :title, :description)'
        );
        $stmt->execute([
            ':user_id'     => $user_id,
            ':title'       => $title,
            ':description' => $description,
        ]);
        $objective_id = (int) $db->lastInsertId();

        // 2. Create reflection (if provided)
        if ($reflection) {
            $stmt = $db->prepare(
                'INSERT INTO reflections (objective_id, question_1, question_2, question_3)
                 VALUES (:objective_id, :q1, :q2, :q3)'
            );
            $stmt->execute([
                ':objective_id' => $objective_id,
                ':q1'           => $reflection['question_1'] ?? null,
                ':q2'           => $reflection['question_2'] ?? null,
                ':q3'           => $reflection['question_3'] ?? null,
            ]);
        }

        // 3. Create system with elements and interactions (if provided)
        $system_id = null;
        $element_ids = [];

        if ($system && !empty($system['purpose'])) {
            $stmt = $db->prepare(
                'INSERT INTO systems (objective_id, purpose) VALUES (:objective_id, :purpose)'
            );
            $stmt->execute([
                ':objective_id' => $objective_id,
                ':purpose'      => $system['purpose'],
            ]);
            $system_id = (int) $db->lastInsertId();

            // 3a. Create elements
            $elements = $system['elements'] ?? [];
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

            // 3b. Create interactions (resolve indices to actual element IDs)
            $interactions = $system['interactions'] ?? [];
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
        }

        $db->commit();

        http_response_code(201);
        echo json_encode([
            'objective' => [
                'id'          => $objective_id,
                'title'       => $title,
                'description' => $description,
                'status'      => 'active',
            ],
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// ---------------------------------------------------------------------------
// Unsupported method
// ---------------------------------------------------------------------------
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
