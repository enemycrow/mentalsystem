<?php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'mentalsystem_default_secret_change_in_production');

/**
 * Base64url encode (URL-safe base64 without padding).
 */
function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64url decode.
 */
function base64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Create a JWT token for the given user ID.
 */
function jwt_encode(int $user_id): string
{
    $header = base64url_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ]));

    $payload = base64url_encode(json_encode([
        'sub' => $user_id,
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24 * 7) // 7 days
    ]));

    $signature = base64url_encode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    return "$header.$payload.$signature";
}

/**
 * Decode and verify a JWT token. Returns the payload as an associative array
 * or null if the token is invalid or expired.
 */
function jwt_decode(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;

    // Verify signature
    $expected_signature = base64url_encode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    if (!hash_equals($expected_signature, $signature)) {
        return null;
    }

    $data = json_decode(base64url_decode($payload), true);
    if ($data === null) {
        return null;
    }

    // Check expiration
    if (isset($data['exp']) && $data['exp'] < time()) {
        return null;
    }

    return $data;
}

/**
 * Authenticate the current request by reading the Authorization Bearer token.
 * Returns the user_id on success, or sends a 401 response and exits on failure.
 */
function authenticate(): int
{
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    // Also check Apache-specific header
    if (empty($auth_header) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth_header = $headers['Authorization'] ?? '';
    }

    if (empty($auth_header) || !preg_match('/^Bearer\s+(.+)$/i', $auth_header, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization token required']);
        exit();
    }

    $token = $matches[1];
    $payload = jwt_decode($token);

    if ($payload === null || !isset($payload['sub'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }

    return (int) $payload['sub'];
}
