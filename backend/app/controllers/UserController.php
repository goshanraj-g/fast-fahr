<?php
namespace App\controllers;

use App\models\UserModel;
use PDO;

class UserController extends BaseController
{
    private UserModel $userModel;

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        parent::__construct($dbConnection);
        $this->userModel = new UserModel($this->dbh);
    }

    /**
     * Gets the profile of the logged-in user. GET request.
     */
    public function getProfile(): void
    {
        $userId = $this->getUserId();
        $user = $this->userModel->getUserById($userId);

        if ($user) {
             $this->successResponse([
                 'user' => [
                     'username' => $user['username'],
                     'email' => $user['email'],
                     'profile_picture' => $user['profile_picture'] ?? null
                 ]
             ]);
        } else {
             $this->errorResponse('User profile not found.', 404);
        }
    }

    /**
     * Updates username and email. POST request.
     */
    public function updateInfo(): void
    {
        $userId = $this->getUserId();
        $username = trim(filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS) ?: '');
        $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);

        $errors = [];
        if (empty($username)) $errors[] = 'Username is required';
        if (!$email) $errors[] = 'Valid email is required';
        if (!empty($errors)) $this->errorResponse(implode(', ', $errors), 400);

        if ($this->userModel->emailExists($email, $userId)) $this->errorResponse('Email already in use.', 409);
        if ($this->userModel->usernameExists($username, $userId)) $this->errorResponse('Username already taken.', 409);

        if ($this->userModel->updateUserInfo($userId, $username, $email)) {
             if (session_status() == PHP_SESSION_ACTIVE) {
                 $_SESSION['user_username'] = $username;
                 $_SESSION['user_email'] = $email;
             }
            $this->successResponse(null, 'Profile information updated successfully!');
        } else {
            $this->errorResponse('Failed to update profile information.', 500);
        }
    }

    /**
     * Updates user password. POST request with JSON body.
     */
    public function updatePassword(): void
    {
        $userId = $this->getUserId();
        $data = $this->getJsonInput();
        if ($data === null) $this->errorResponse('Invalid JSON request body.', 400);

        $currentPassword = $data['currentPassword'] ?? null;
        $newPassword = $data['newPassword'] ?? null;

        if (empty($currentPassword) || empty($newPassword)) $this->errorResponse('Current and new password are required.', 400);
        if (strlen($newPassword) < 8) $this->errorResponse('New password must be at least 8 characters long.', 400);

        $user = $this->userModel->getUserById($userId);
        if (!$user) $this->errorResponse('User not found.', 404);

        if (!password_verify($currentPassword, $user['password_hash'])) {
            $this->errorResponse('Current password is incorrect.', 401);
        }

        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        if ($this->userModel->updatePassword($userId, $newPasswordHash)) {
            $this->successResponse(null, 'Password updated successfully!');
        } else {
            $this->errorResponse('Failed to update password.', 500);
        }
    }

    /**
    * Updates profile picture. POST request with 'profilePicture' file upload.
    */
     public function updateProfilePicture(): void
     {
         $userId = $this->getUserId();

         if (!isset($_FILES['profilePicture']) || $_FILES['profilePicture']['error'] !== UPLOAD_ERR_OK) {
             $this->errorResponse('No file uploaded or upload error occurred.', 400);
         }
         $file = $_FILES['profilePicture'];
         $tmpName = $file['tmp_name'];

         if (!function_exists('finfo_open')) $this->errorResponse('Server configuration error: finfo required.', 500);
         $finfo = new \finfo(FILEINFO_MIME_TYPE);
         $fileType = $finfo->file($tmpName);
         $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
         if (!in_array($fileType, $allowedTypes)) $this->errorResponse('Only JPG, PNG, GIF, and WEBP files are allowed.', 400);

         $maxSize = 5 * 1024 * 1024; // 5MB
         if ($file['size'] > $maxSize) $this->errorResponse('File size exceeds the limit of 5MB.', 400);

         try {
             $rootDir = dirname(__DIR__, 3);
             $uploadDir = $rootDir . '/uploads/profile_pictures';
             $webDir = '/uploads/profile_pictures';

             if (!is_dir($uploadDir)) {
                 if (!mkdir($uploadDir, 0755, true)) throw new \Exception("Cannot create upload directory.");
             }
              if (!is_writable($uploadDir)) throw new \Exception("Upload directory is not writable.");

             $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg');
             if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                  throw new \Exception("Invalid file extension derived from name.");
             }
             $uniqueName = $userId . '_' . uniqid() . '.' . $extension;
             $destination = $uploadDir . '/' . $uniqueName;
             $webPath = $webDir . '/' . $uniqueName;

             $currentUser = $this->userModel->getUserById($userId);
             if ($currentUser && !empty($currentUser['profile_picture'])) {
                  $oldFilename = basename($currentUser['profile_picture']);
                  $oldFilePath = $uploadDir . '/' . $oldFilename;
                  if ($oldFilename && file_exists($oldFilePath)) @unlink($oldFilePath);
             }

             if (move_uploaded_file($tmpName, $destination)) {
                 if ($this->userModel->updateProfilePicture($userId, $webPath)) {
                      if (session_status() == PHP_SESSION_ACTIVE) $_SESSION['user_profile_picture'] = $webPath;
                     $this->successResponse(['profile_picture' => $webPath], 'Profile picture updated successfully!');
                 } else {
                      @unlink($destination);
                     $this->errorResponse('Failed to update profile picture in database.', 500);
                 }
             } else {
                  throw new \Exception('Failed to save uploaded file.');
             }
         } catch (\Exception $e) {
             $this->errorResponse('An error occurred during file upload.', 500);
         }
     }
}