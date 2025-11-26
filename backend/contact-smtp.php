<?php
/**
 * Contact Form with SMTP Support using PHPMailer
 * 
 * Installation: composer require phpmailer/phpmailer
 * 
 * This version is recommended for production use
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Access-Control-Allow-Origin: *'); // Change to your domain in production
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

// Create PHPMailer instance
$mail = new PHPMailer(true);

try {
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';           // SMTP server (e.g., Gmail, SendGrid)
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your-email@gmail.com';     // Your SMTP username
    $mail->Password   = 'your-app-password';        // Your SMTP password or app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // Recipients
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress('your-email@example.com', 'Your Name'); // Your email address
    $mail->addReplyTo($from_email, $from_name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = "Contact Form: $subject";
    
    $mail->Body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #3f51b5; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
                .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #333; }
                .value { color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>New Contact Form Submission</h2>
                </div>
                <div class='content'>
                    <div class='field'>
                        <span class='label'>From:</span>
                        <span class='value'>$from_name</span>
                    </div>
                    <div class='field'>
                        <span class='label'>Email:</span>
                        <span class='value'>$from_email</span>
                    </div>
                    <div class='field'>
                        <span class='label'>Subject:</span>
                        <span class='value'>$subject</span>
                    </div>
                    <div class='field'>
                        <span class='label'>Message:</span>
                        <div class='value'>" . nl2br($message) . "</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    ";

    $mail->AltBody = "From: $from_name\nEmail: $from_email\n\nSubject: $subject\n\nMessage:\n$message";

    $mail->send();
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send message: ' . $mail->ErrorInfo]);
}
?>
