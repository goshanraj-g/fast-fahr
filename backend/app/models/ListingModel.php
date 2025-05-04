<?php
namespace App\models;

use PDO;

class ListingModel
{
    private PDO $dbh;
    private string $postsTable = 'posts';
    private string $usersTable = 'users';
    private string $postImagesTable = 'post_images';
    private string $bookmarksTable = 'bookmarks';

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        $this->dbh = $dbConnection;
    }

    /**
     * @return array
     */
    public function getAllListings(): array
    {
        $sql = "SELECT
                    p.*,
                    u.username AS creator_username,
                    pi.image_path
                FROM {$this->postsTable} p
                JOIN {$this->usersTable} u ON p.user_id = u.user_id
                LEFT JOIN {$this->postImagesTable} pi ON p.id = pi.post_id AND pi.is_main = 1
                ORDER BY p.created_at DESC";
        $stmt = $this->dbh->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

     /**
      * @param int $listingId
      * @return array|false
      */
    public function getListingById(int $listingId): array|false
    {
        $sql_post = "SELECT
                        p.*,
                        u.username AS creator_username
                     FROM {$this->postsTable} p
                     JOIN {$this->usersTable} u ON p.user_id = u.user_id
                     WHERE p.id = ?";
        $stmt_post = $this->dbh->prepare($sql_post);
        $stmt_post->execute([$listingId]);
        $listing = $stmt_post->fetch(PDO::FETCH_ASSOC);

        if (!$listing) {
            return false;
        }

        $sql_images = "SELECT image_path, is_main
                       FROM {$this->postImagesTable}
                       WHERE post_id = ?
                       ORDER BY is_main DESC, id ASC";
        $stmt_images = $this->dbh->prepare($sql_images);
        $stmt_images->execute([$listingId]);
        $listing['images'] = $stmt_images->fetchAll(PDO::FETCH_ASSOC);

        return $listing;
    }

    /**
     * @param int $userId
     * @param array $data
     * @return int|false
     */
    public function createListing(int $userId, array $data): int|false
    {
        $sql = "INSERT INTO {$this->postsTable} (
                    user_id, title, make, model, year, price, mileage, description,
                    transmission, fuelType, driveType, bodyType, exteriorColor,
                    province, city, created_at
                ) VALUES (
                    :user_id, :title, :make, :model, :year, :price, :mileage, :description,
                    :transmission, :fuelType, :driveType, :bodyType, :exteriorColor,
                    :province, :city, NOW()
                )";

        $stmt = $this->dbh->prepare($sql);
        $params = [
            ':user_id' => $userId,
            ':title' => $data['title'], ':make' => $data['make'], ':model' => $data['model'],
            ':year' => (int) $data['year'], ':price' => (float) $data['price'],
            ':mileage' => (int) str_replace(',', '', $data['mileage']),
            ':description' => $data['description'], ':transmission' => $data['transmission'],
            ':fuelType' => $data['fuelType'], ':driveType' => $data['driveType'],
            ':bodyType' => $data['bodyType'], ':exteriorColor' => $data['exteriorColor'],
            ':province' => $data['province'], ':city' => $data['city'],
        ];
        $success = $stmt->execute($params);
        if ($success) {
             $lastId = $this->dbh->lastInsertId();
             return ($lastId !== false && $lastId !== '0') ? (int)$lastId : false;
        }
        return false;
    }

    /**
     * @param int $postId
     * @param string $imagePath
     * @param bool $isMain
     * @return bool
     */
    public function addListingImage(int $postId, string $imagePath, bool $isMain): bool
    {
        $sql = "INSERT INTO {$this->postImagesTable} (post_id, image_path, is_main) VALUES (?, ?, ?)";
        $stmt = $this->dbh->prepare($sql);
        $isMainInt = $isMain ? 1 : 0;
        return $stmt->execute([$postId, $imagePath, $isMainInt]);
    }

     /**
      * @param int $listingId
      * @param int $userId
      * @return bool
      */
     public function deleteListing(int $listingId, int $userId): bool
     {
         $checkOwnerSql = "SELECT user_id FROM {$this->postsTable} WHERE id = ?";
         $stmtOwner = $this->dbh->prepare($checkOwnerSql);
         $stmtOwner->execute([$listingId]);
         $ownerId = $stmtOwner->fetchColumn();

         if ($ownerId === false || $ownerId != $userId) {
             return false;
         }

         $this->dbh->beginTransaction();
         try {
             $sqlDeleteBookmarks = "DELETE FROM {$this->bookmarksTable} WHERE post_id = ?";
             $stmtBookmarks = $this->dbh->prepare($sqlDeleteBookmarks);
             $stmtBookmarks->execute([$listingId]);

             $sqlDeleteImages = "DELETE FROM {$this->postImagesTable} WHERE post_id = ?";
             $stmtImages = $this->dbh->prepare($sqlDeleteImages);
             $stmtImages->execute([$listingId]);

             $sqlDeletePost = "DELETE FROM {$this->postsTable} WHERE id = ?";
             $stmtPost = $this->dbh->prepare($sqlDeletePost);
             $postDeleted = $stmtPost->execute([$listingId]);

             if ($postDeleted) {
                 $this->dbh->commit();
                 return true;
             } else {
                 $this->dbh->rollBack();
                 return false;
             }
         } catch (\PDOException $e) {
             if ($this->dbh->inTransaction()) {
                  $this->dbh->rollBack();
             }
             return false;
         }
    }

    public function updateListing(int $listingId, array $data): bool
    {
        $allowedFields = ['title', 'make', 'model', 'year', 'price', 'mileage', 'description', 'transmission', 'fuelType', 'driveType', 'bodyType', 'exteriorColor', 'province', 'city'];
        $setClauses = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setClauses[] = "`{$field}` = :{$field}";
                if (in_array($field, ['year', 'mileage'])) {
                     $params[":{$field}"] = (int) str_replace(',', '', $data[$field]);
                } elseif ($field === 'price') {
                     $params[":{$field}"] = (float) $data[$field];
                } else {
                     $params[":{$field}"] = $data[$field];
                }
            }
        }

        if (empty($setClauses)) {
            return false;
        }

        $sql = "UPDATE {$this->postsTable} SET " . implode(', ', $setClauses) . " WHERE id = :listing_id";
        $params[':listing_id'] = $listingId;

        try {
            $stmt = $this->dbh->prepare($sql);
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Retrieves all images for a specific listing ID.
     * Orders by main image first.
     *
     * @param int $listingId The ID of the listing.
     * @return array|false An array of image data arrays ([['image_path'=>..., 'is_main'=>...], ...])
     *                     or false on database error. Returns empty array if no images found.
     */
    public function getImages(int $listingId): array|false
    {
        $sql = "SELECT image_path, is_main
                FROM {$this->postImagesTable}
                WHERE post_id = ?
                ORDER BY is_main DESC, id ASC";
        try {
            $stmt = $this->dbh->prepare($sql);
            $stmt->execute([$listingId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
    * Deletes all image records associated with a specific post ID.
    * Used when replacing images during an update.
    * @param int $postId
    * @return bool True on success, false on failure.
    */
    public function deleteListingImages(int $postId): bool
    {
        $sql = "DELETE FROM {$this->postImagesTable} WHERE post_id = ?";
        try {
            $stmt = $this->dbh->prepare($sql);
            return $stmt->execute([$postId]);
        } catch (\PDOException $e) {
            return false;
        }
    }
}