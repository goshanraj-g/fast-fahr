<?php
namespace App\controllers;

use App\models\UserModel;
use App\models\PasswordResetModel;
use PDO;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class AuthController extends BaseController
{
    private UserModel $userModel;
    private PasswordResetModel $passwordResetModel;

    /**
    * @param PDO $dbConnection
    */
    public function __construct(PDO $dbConnection)
    {
        parent::__construct($dbConnection, false);
        $this->userModel = new UserModel($this->dbh);
        $this->passwordResetModel = new PasswordResetModel($this->dbh);
    }

    /**
    * Handles user login. POST request.
    */
    public function login(): void
    {
        $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
        $password = $_POST["password"] ?? null;

        if (!$email || empty($password)) {
            $this->errorResponse('Please enter a valid email and password', 400);
        }

        $user = $this->userModel->getUserByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            if (session_status() !== PHP_SESSION_ACTIVE) {
                 $this->errorResponse('Session initialization failed.', 500);
            }
            session_regenerate_id();

            $_SESSION['user_id'] = (int)$user['user_id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_username'] = $user['username'];
            $_SESSION['user_profile_picture'] = $user['profile_picture'];
            $_SESSION['logged_in'] = true;

            $this->successResponse([
                'user' => [
                    'id' => (int)$user['user_id'],
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'profile_picture' => $user['profile_picture'] ?? null
                ]
            ], 'Login successful! Redirecting...');
        } else {
            $this->errorResponse('Invalid email or password.', 401);
        }
    }

    /**
    * Handles user registration. POST request.
    */
    public function register(): void
    {
        $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
        $username = trim(filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS) ?: '');
        $password = $_POST["password"] ?? null;

        $errors = [];
        if (empty($username)) $errors[] = 'Username is required';
        if (!$email) $errors[] = 'Valid email is required';
        if (empty($password)) $errors[] = 'Password is required';
        elseif (strlen($password) < 8) $errors[] = 'Password must be at least 8 characters long';
        if (!empty($errors)) $this->errorResponse(implode(', ', $errors), 400);

        if ($this->userModel->emailExists($email)) $this->errorResponse('Email already in use.', 409);
        if ($this->userModel->usernameExists($username)) $this->errorResponse('Username already taken.', 409);

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $userId = $this->userModel->createUser($username, $email, $hashedPassword);

        if ($userId) {
            $this->successResponse(['userId' => $userId], 'Registration successful! Redirecting...', 201);
        } else {
            $this->errorResponse('Registration failed.', 500);
        }
    }

    /**
    * Handles user logout. POST request.
    */
    public function logout(): void
    {
         if (session_status() == PHP_SESSION_NONE) session_start();
         $_SESSION = array();
         if (ini_get("session.use_cookies")) {
             $params = session_get_cookie_params();
             setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
         }
         @session_destroy();
         $this->successResponse(null, 'Logout successful.');
    }

    /**
    * Checks session status. GET request.
    */
    public function checkSession(): void
    {
        if (session_status() == PHP_SESSION_NONE) session_start();
        if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_SESSION['user_id'])) {
             $this->successResponse([
                 'isLoggedIn' => true,
                 'user' => [
                     'id' => (int)$_SESSION['user_id'],
                     'email' => $_SESSION['user_email'] ?? null,
                     'username' => $_SESSION['user_username'] ?? null,
                     'profile_picture' => $_SESSION['user_profile_picture'] ?? null
                 ]
             ]);
        } else {
             $this->successResponse(['isLoggedIn' => false]);
        }
    }

    /**
    * Handles password reset request. POST request.
    */
    public function requestPasswordReset(): void
    {
         $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
         if (!$email) $this->errorResponse('Please provide a valid email address.', 400);

         $user = $this->userModel->getUserByEmail($email);
         if ($user) {
             $userId = (int)$user['user_id'];
             $plainToken = $this->passwordResetModel->createResetToken($userId, $email);
             if ($plainToken) {
                 $this->sendResetEmail($email, $plainToken);
             }
         }
         $this->successResponse(null, 'If an account with that email exists, a password reset code has been sent.');
    }

    /**
    * Verifies reset code. POST request.
    */
    public function verifyResetCode(): void
    {
         $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
         $plainToken = trim($_POST["token"] ?? '');
         if (!$email || empty($plainToken)) $this->errorResponse('Email and reset code are required.', 400);

         $isValid = $this->passwordResetModel->validateResetToken($email, $plainToken);
         if ($isValid !== false) {
             $this->successResponse(null, 'Code verified successfully. Redirecting...');
         } else {
             $this->errorResponse('Invalid or expired reset code.', 400);
         }
    }

    /**
    * Resets password using token. POST request.
    */
    public function resetPassword(): void
    {
         $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
         $plainToken = trim($_POST["token"] ?? '');
         $newPassword = $_POST["password"] ?? null;

         if (!$email || empty($plainToken) || empty($newPassword)) $this->errorResponse('Email, token, and new password are required.', 400);
         if (strlen($newPassword) < 8) $this->errorResponse('Password must be at least 8 characters long.', 400);

         $resetData = $this->passwordResetModel->validateResetToken($email, $plainToken);
         if ($resetData !== false) {
             $userId = (int)$resetData['user_id'];
             $resetId = (int)$resetData['id'];
             $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

             if ($this->userModel->updatePassword($userId, $newPasswordHash)) {
                 $this->passwordResetModel->deleteTokenById($resetId);
                 $this->successResponse(null, 'Password updated successfully. Redirecting...');
             } else {
                  $this->errorResponse('Failed to update password.', 500);
             }
         } else {
              $this->errorResponse('Invalid or expired reset token.', 400);
         }
     }

    /**
    * @param string $email
    * @param string $plainToken
    * @return bool
    */
    private function sendResetEmail(string $email, string $plainToken): bool
    {   

        // NOTE: In a production setting, feel free to use .env to hide all phpmailer info below
        // However for this demonstration code by us, .env is not used
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'put.your.gmail.here@gmail.com';
            $mail->Password = "passwordpart1 passwordpart2 passwordpart3 passwordpart4";
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;

            // --- Recipients ---
            $mail->setFrom('put.your.gmail.here@gmail.com', 'EmailUsername');
            $mail->addAddress($email);

            // --- Content ---
            $mail->isHTML(true);
            $mail->Subject = 'FastFahr Password Reset Request';

            $mail->Body    = "Hello,<br><br>You requested a password reset. Use the code below (expires in 1 hour):<br><br>"
                    . "<b>Code: " . htmlspecialchars($plainToken) . "</b><br><br>"
                    . "If you didn't request this, please ignore this email.<br><br>Thanks,<br>The FastFahr Team";
            $mail->AltBody = "Hello,\n\nYou requested a password reset. Use the code below (expires in 1 hour):\n\n"
                    . "Code: " . $plainToken . "\n\n"
                    . "If you didn't request this, ignore this email.\n\nThanks,\nThe FastFahr Team";

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            return false;
        }
    }
}