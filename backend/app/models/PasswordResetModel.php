<?php
namespace App\models;

use PDO;
use DateTimeImmutable;
use Exception;

class PasswordResetModel
{
    private PDO $dbh;
    private string $table = 'password_resets';

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        $this->dbh = $dbConnection;
    }

    /**
     * @param int $userId
     * @param string $email
     * @return string|false
     */
    public function createResetToken(int $userId, string $email): string|false
    {
        $this->dbh->beginTransaction();
        try {
            $sql_delete = "DELETE FROM {$this->table} WHERE user_id = ?";
            $stmt_delete = $this->dbh->prepare($sql_delete);
            if (!$stmt_delete->execute([$userId])) {
                 $this->dbh->rollBack();
                 return false;
            }

            $plainToken = bin2hex(random_bytes(32));
            $hashedToken = password_hash($plainToken, PASSWORD_DEFAULT);
            $expires = new DateTimeImmutable('+1 hour');
            $expiresFormatted = $expires->format('Y-m-d H:i:s');

            $sql_insert = "INSERT INTO {$this->table} (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)";
            $stmt_insert = $this->dbh->prepare($sql_insert);
            $params_insert = [$userId, $email, $hashedToken, $expiresFormatted];
            $success_insert = $stmt_insert->execute($params_insert);

            if ($success_insert) {
                $this->dbh->commit();
                return $plainToken;
            } else {
                $this->dbh->rollBack();
                return false;
            }
        } catch (Exception $e) {
             if ($this->dbh->inTransaction()) {
                $this->dbh->rollBack();
            }
            return false;
        }
    }

    /**
     * @param string $email
     * @param string $plainToken
     * @return array|false
     */
    public function validateResetToken(string $email, string $plainToken): array|false
    {
        $currentTime = (new DateTimeImmutable())->format('Y-m-d H:i:s');
        $sql = "SELECT * FROM {$this->table} WHERE email = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute([$email, $currentTime]);
        $requestData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($requestData && password_verify($plainToken, $requestData['token'])) {
            return $requestData;
        }
        return false;
    }

    /**
     * @param int $resetId
     * @return bool
     */
    public function deleteTokenById(int $resetId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$resetId]);
    }
}