<?php
namespace App\models;

use PDO;

class BookmarkModel
{
    private PDO $dbh;
    private string $table = 'bookmarks';
    private string $postsTable = 'posts';
    private string $usersTable = 'users';
    private string $postImagesTable = 'post_images';

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        $this->dbh = $dbConnection;
    }

    /**
     * @param int $userId
     * @param int $postId
     * @return bool
     */
    public function addBookmark(int $userId, int $postId): bool
    {
        $sql = "INSERT IGNORE INTO {$this->table} (user_id, post_id, created_at) VALUES (?, ?, NOW())";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$userId, $postId]);
    }

    /**
     * @param int $userId
     * @param int $postId
     * @return bool
     */
    public function removeBookmark(int $userId, int $postId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ? AND post_id = ?";
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute([$userId, $postId]);
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getUserBookmarks(int $userId): array
    {
        $sql = "SELECT
                    p.*,
                    u.username AS creator_username,
                    pi.image_path
                FROM {$this->postsTable} p
                JOIN {$this->usersTable} u ON p.user_id = u.user_id
                JOIN {$this->table} b ON p.id = b.post_id
                LEFT JOIN {$this->postImagesTable} pi ON p.id = pi.post_id AND pi.is_main = 1
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

     /**
      * @param int $userId
      * @param int $postId
      * @return bool
      */
     public function isBookmarked(int $userId, int $postId): bool
     {
         $sql = "SELECT 1 FROM {$this->table} WHERE user_id = ? AND post_id = ? LIMIT 1";
         $stmt = $this->dbh->prepare($sql);
         $stmt->execute([$userId, $postId]);
         return $stmt->fetchColumn() !== false;
     }
}