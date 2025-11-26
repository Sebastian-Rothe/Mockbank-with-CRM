<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['from_name', 'from_email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required field: ' . $field]);
        exit();
    }
}

// Sanitize inputs
$from_name = htmlspecialchars(trim($data['from_name']));
$from_email = filter_var(trim($data['from_email']), FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars(trim($data['subject']));
$message = htmlspecialchars(trim($data['message']));

// Validate email
if (!filter_var($from_email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Your email address where you want to receive messages
$to_email = 'mail@sebastian-rothe.com'; // CHANGE THIS TO YOUR EMAIL

// Email subject
$email_subject = "Contact Form: $subject";

// Email body
$email_body = "You have received a new message from your website contact form.\n\n";
$email_body .= "Name: $from_name\n";
$email_body .= "Email: $from_email\n";
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n";

// Email headers
$headers = "From: $from_email\r\n";
$headers .= "Reply-To: $from_email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to_email, $email_subject, $email_body, $headers)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send message']);
}
?>
