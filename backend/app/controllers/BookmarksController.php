<?php
namespace App\controllers;

use App\models\BookmarkModel;
use PDO;

class BookmarksController extends BaseController
{
    private BookmarkModel $bookmarkModel;

    /**
    * @param PDO $dbConnection
    */
    public function __construct(PDO $dbConnection)
    {
        parent::__construct($dbConnection);
        $this->bookmarkModel = new BookmarkModel($this->dbh);
    }

    /**
    * Handles GET request to list user's bookmarks.
    */
    public function listUserBookmarks(): void
    {
        $userId = $this->getUserId();
        $bookmarks = $this->bookmarkModel->getUserBookmarks($userId);
        $this->successResponse($bookmarks);
    }

    /**
    * Handles POST request to add a bookmark.
    */
    public function addBookmark(): void
    {
        $postId = filter_input(INPUT_POST, 'post_id', FILTER_VALIDATE_INT);
        if (!$postId) $this->errorResponse('Invalid or missing post_id.', 400);

        $userId = $this->getUserId();
        if ($this->bookmarkModel->addBookmark($userId, $postId)) {
            $this->successResponse(null, 'Bookmarked successfully.', 201);
        } else {
            $this->errorResponse('Failed to add bookmark.', 500);
        }
    }

    /**
    * Handles POST request to remove a bookmark.
    */
    public function removeBookmark(): void
    {
        $postId = filter_input(INPUT_POST, 'post_id', FILTER_VALIDATE_INT);
        if (!$postId) $this->errorResponse('Invalid or missing post_id.', 400);

        $userId = $this->getUserId();
        if ($this->bookmarkModel->removeBookmark($userId, $postId)) {
            $this->successResponse(null, 'Bookmark removed successfully.');
        } else {
            $this->errorResponse('Failed to remove bookmark.', 500);
        }
    }
}