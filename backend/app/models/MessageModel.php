<?php
namespace App\models;

use PDO;
use DateTimeImmutable;

class MessageModel
{
    private PDO $dbh;
    private string $table = 'messages';
    private string $userTable = 'users';

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        $this->dbh = $dbConnection;
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getConversations(int $userId): array
    {
        $sql = "SELECT
                    u.user_id AS other_user_id, u.username AS userName, u.profile_picture AS userAvatar,
                    m_latest.content AS lastMessage, m_latest.sent_at AS lastMessageTimestamp,
                    m_latest.message_id AS lastMessageId,
                    (SELECT COUNT(*) FROM {$this->table} m_unread WHERE m_unread.receiver_id = ? AND m_unread.sender_id = u.user_id AND m_unread.is_read = FALSE) AS unreadCount
                FROM
                    (SELECT IF(sender_id = ?, receiver_id, sender_id) AS other_user, MAX(message_id) AS max_message_id FROM {$this->table} WHERE sender_id = ? OR receiver_id = ? GROUP BY other_user) AS m_unique
                JOIN {$this->table} m_latest ON m_unique.max_message_id = m_latest.message_id
                JOIN {$this->userTable} u ON m_unique.other_user = u.user_id
                ORDER BY m_latest.sent_at DESC";
        $stmt = $this->dbh->prepare($sql);
        $params = [$userId, $userId, $userId, $userId];
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param int $userId1
     * @param int $userId2
     * @return array
     */
    public function getMessagesBetweenUsers(int $userId1, int $userId2): array
    {
        $sql = "SELECT
                    m.message_id, m.sender_id, m.receiver_id, m.content, m.sent_at, m.is_read,
                    u_sender.username AS senderName, u_sender.profile_picture AS senderAvatar
                FROM {$this->table} m
                JOIN {$this->userTable} u_sender ON m.sender_id = u_sender.user_id
                WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY m.sent_at ASC";
        $stmt = $this->dbh->prepare($sql);
        $params = [$userId1, $userId2, $userId2, $userId1];
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param int $senderId
     * @param int $receiverId
     * @param string $content
     * @return int|false
     */
    public function sendMessage(int $senderId, int $receiverId, string $content): int|false
    {
        $sql = "INSERT INTO {$this->table} (sender_id, receiver_id, content, sent_at, is_read) VALUES (?, ?, ?, NOW(), FALSE)";
        $stmt = $this->dbh->prepare($sql);
        $params = [$senderId, $receiverId, $content];
        $success = $stmt->execute($params);
        if ($success) {
            $lastId = $this->dbh->lastInsertId();
            return ($lastId !== false && $lastId !== '0') ? (int) $lastId : false;
        }
        return false;
    }

    /**
     * @param int $userId1
     * @param int $userId2
     * @return bool
     */
    public function deleteConversation(int $userId1, int $userId2): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)";
        $stmt = $this->dbh->prepare($sql);
        $params = [$userId1, $userId2, $userId2, $userId1];
        return $stmt->execute($params);
    }

    /**
     * @param int $receiverId
     * @param int $senderId
     * @return bool
     */
    public function markMessagesAsRead(int $receiverId, int $senderId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE";
        $stmt = $this->dbh->prepare($sql);
        $params = [$receiverId, $senderId];
        return $stmt->execute($params);
    }

    /**
     * @param int $messageId
     * @return array|false
     */
    public function getMessageById(int $messageId): array|false
    {
        $sql = "SELECT
                    m.message_id, m.sender_id, m.receiver_id, m.content, m.sent_at, m.is_read,
                    u_sender.username AS senderName, u_sender.profile_picture AS senderAvatar
                FROM {$this->table} m
                JOIN {$this->userTable} u_sender ON m.sender_id = u_sender.user_id
                WHERE m.message_id = ?";
        $stmt = $this->dbh->prepare($sql);
        $params = [$messageId];
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}