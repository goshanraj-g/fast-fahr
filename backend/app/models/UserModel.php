<?php
namespace App\models;

use PDO;

class UserModel
{
    private PDO $dbh;
    private string $table = 'users';

    /**
    * @param PDO $dbConnection
    */
    public function __construct(PDO $dbConnection)
    {
        $this->dbh = $dbConnection;
    }

    /**
    * @param int $id
    * @return array|false
    */
    public function getUserById(int $id): array|false
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
    * @param string $username
    * @return array|false
    */
    public function getUserByUsername(string $username): array|false
    {
        $sql = "SELECT user_id, username, email, profile_picture FROM {$this->table} WHERE username = ?";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
    * @param string $email
    * @return array|false
    */
    public function getUserByEmail(string $email): array|false
    {
        $sql = "SELECT user_id, email, username, password_hash, profile_picture FROM {$this->table} WHERE email = ? LIMIT 1";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
    * @param int $userId
    * @param string $newPasswordHash
    * @return bool
    */
    public function updatePassword(int $userId, string $newPasswordHash): bool
    {
        $sql = "UPDATE {$this->table} SET password_hash = ? WHERE user_id = ?";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$newPasswordHash, $userId]);
    }

    /**
    * @param string $username
    * @param string $email
    * @param string $passwordHash
    * @return int|false
    */
    public function createUser(string $username, string $email, string $passwordHash): int|false
    {
        $sql = "INSERT INTO {$this->table} (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $this->dbh->prepare($sql);
        $success = $stmt->execute([$username, $email, $passwordHash]);
        if ($success) {
            $lastId = $this->dbh->lastInsertId();
            return ($lastId !== false && $lastId !== '0') ? (int)$lastId : false;
        }
        return false;
    }

    /**
    * @param int $userId
    * @param string $username
    * @param string $email
    * @return bool
    */
    public function updateUserInfo(int $userId, string $username, string $email): bool
    {
        $sql = "UPDATE {$this->table} SET username = ?, email = ? WHERE user_id = ?";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$username, $email, $userId]);
    }

    /**
    * @param int $userId
    * @param string $webPath
    * @return bool
    */
    public function updateProfilePicture(int $userId, string $webPath): bool
    {
        $sql = "UPDATE {$this->table} SET profile_picture = ? WHERE user_id = ?";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$webPath, $userId]);
    }

    /**
    * @param string $email
    * @param int|null $excludeUserId
    * @return bool
    */
    public function emailExists(string $email, ?int $excludeUserId = null): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE email = ?";
        $params = [$email];
        if ($excludeUserId !== null) {
            $sql .= " AND user_id != ?";
            $params[] = $excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() !== false;
    }

    /**
    * @param string $username
    * @param int|null $excludeUserId
    * @return bool
    */
    public function usernameExists(string $username, ?int $excludeUserId = null): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE username = ?";
        $params = [$username];
        if ($excludeUserId !== null) {
            $sql .= " AND user_id != ?";
            $params[] = $excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() !== false;
    }
}