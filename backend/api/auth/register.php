<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name     = trim($input['name'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and password are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit();
}

$db = getDbConnection();

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);

if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already registered']);
    exit();
}

// Create user
$password_hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $db->prepare('INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password_hash)');
$stmt->execute([
    ':name'          => $name,
    ':email'         => $email,
    ':password_hash' => $password_hash,
]);

$user_id = (int) $db->lastInsertId();
$token = jwt_encode($user_id);

http_response_code(201);
echo json_encode([
    'token' => $token,
    'user'  => [
        'id'    => $user_id,
        'name'  => $name,
        'email' => $email,
    ],
]);
