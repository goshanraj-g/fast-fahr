<?php
namespace App\controllers;

use App\models\ListingModel;
use PDO;

class ListingsController extends BaseController
{
    private ListingModel $listingModel;

    /**
    * @param PDO $dbConnection
    */
    public function __construct(PDO $dbConnection)
    {
        parent::__construct($dbConnection, false);
        $this->listingModel = new ListingModel($this->dbh);
    }

    /**
    * Handles GET request to fetch all listings. (Now public)
    */
    public function getAll(): void
    {
        $listings = $this->listingModel->getAllListings();
        $this->successResponse($listings);
    }

    /**
    * Handles GET request to fetch a single listing by ID. (Now public)
    * @param int $id
    */
    public function getOne(int $id): void
    {
         if ($id <= 0) $this->errorResponse('Invalid listing ID.', 400);
         $listing = $this->listingModel->getListingById($id);
         if ($listing) {
             $this->successResponse($listing);
         } else {
             $this->errorResponse('Listing not found.', 404);
         }
    }

    /**
    * Handles POST request to create a new listing. (Requires Auth)
    */
    public function create(): void
    {
        $userId = $this->getUserId();
        $data = $_POST;
        $files = $_FILES;

        $requiredFields = ['title', 'make', 'model', 'year', 'price', 'mileage', 'description', 'transmission', 'fuelType', 'driveType', 'bodyType', 'exteriorColor', 'province', 'city'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) $this->errorResponse("Missing field: {$field}", 400);
        }

        $listingId = $this->listingModel->createListing($userId, $data);
        if (!$listingId) $this->errorResponse('Failed to save listing data.', 500);

        $imagePaths = [];
        $imageUploadError = null;
        try {
             $imagePaths = $this->handleImageUploads($files, $listingId);
        } catch (\Exception $e) {
             error_log("Image upload exception for listing $listingId: " . $e->getMessage());
             $imageUploadError = $e->getMessage();
        }

        $imageDbSuccessCount = 0;
        $imageDbTotal = count($imagePaths);
        if (!empty($imagePaths)) {
            $mainIndex = isset($data['mainPhotoIndex']) ? (int) $data['mainPhotoIndex'] : 0;
            if ($mainIndex >= count($imagePaths)) {
                $mainIndex = 0;
            }
            foreach ($imagePaths as $index => $path) {
                 $isMain = ($index === $mainIndex);
                 if ($this->listingModel->addListingImage($listingId, $path, $isMain)) {
                     $imageDbSuccessCount++;
                 } else {

                 }
            }
        }

        $createdListingData = $this->listingModel->getListingById($listingId);

        $message = '';
        $statusCode = 201;
        if ($imageUploadError) {
            $message = "Listing created, but image upload failed: $imageUploadError";
            $statusCode = 207;
        } elseif ($imageDbTotal > 0 && $imageDbSuccessCount < $imageDbTotal) {
            $message = "Listing created, but only $imageDbSuccessCount of $imageDbTotal images could be saved to the database.";
            $statusCode = 207;
        } elseif ($imageDbTotal > 0 && $imageDbSuccessCount === $imageDbTotal) {
            $message = 'Listing created successfully.';
        } elseif ($imageDbTotal === 0 && empty($_FILES['photos']['name'][0])) {
            $message = 'Listing created, but no photos were provided or uploaded.';
        } elseif ($imageDbTotal === 0 && !empty($_FILES['photos']['name'][0])) {
             $message = 'Listing created, but no valid photos were processed or saved.';
             $statusCode = 207;
        } else {
            $message = 'Listing created.';
        }

        if ($createdListingData) {
            $mainImagePath = null;
            if (!empty($createdListingData['images'])) {
                foreach ($createdListingData['images'] as $img) {
                    if (!empty($img['is_main'])) {
                        $mainImagePath = $img['image_path'];
                        break;
                    }
                }

                if (!$mainImagePath && isset($createdListingData['images'][0]['image_path'])) {
                     $mainImagePath = $createdListingData['images'][0]['image_path'];
                }
            }
            $createdListingData['image_path'] = $mainImagePath;

            $this->successResponse(['newListing' => $createdListingData], $message, $statusCode);
        } else {
            $this->successResponse(['listingId' => $listingId], 'Listing created, but failed to retrieve its data.', 207);
        }
    }

    /**
    * Handles POST request (or DELETE) to delete a listing. (Requires Auth)
    * @param int $id
    */
    public function delete(int $id): void
    {
        $userId = $this->getUserId();

        if ($id <= 0) $this->errorResponse('Invalid listing ID.', 400);

        $listing = $this->listingModel->getListingById($id);
        if (!$listing) $this->errorResponse('Listing not found.', 404);
        if ($listing['user_id'] != $userId) $this->errorResponse('Permission denied.', 403);

        $deleted = $this->listingModel->deleteListing($id, $userId);
        if ($deleted) {
            if (!empty($listing['images'])) {
                $uploadDir = dirname(__DIR__, 3) . '/uploads';
                foreach ($listing['images'] as $image) {
                    $filename = basename($image['image_path']);
                    $filePath = $uploadDir . '/' . $filename;
                    if ($filename && file_exists($filePath)) @unlink($filePath);
             }
            }
             $this->successResponse(null, 'Listing deleted.');
         } else {
             $this->errorResponse('Failed to delete listing.', 500);
         }
    }

    /**
    * Handles POST request to update an existing listing's details. (Requires Auth)
    */
    public function update(): void
    {
        $userId = $this->getUserId();
        $data = $_POST;
        $files = $_FILES;
        $listingId = filter_var($data['listing_id'] ?? null, FILTER_VALIDATE_INT);
 
        if (!$listingId || $listingId <= 0) $this->errorResponse('Missing or invalid listing ID.', 400);
        $requiredFields = ['title', 'make', 'model', 'year', 'price', 'mileage', 'description', 'transmission', 'fuelType', 'driveType', 'bodyType', 'exteriorColor', 'province', 'city'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) $this->errorResponse("Missing field for update: {$field}", 400);
        }
        $existingListing = $this->listingModel->getListingById($listingId);
        if (!$existingListing) $this->errorResponse('Listing not found.', 404);
        if ($existingListing['user_id'] != $userId) $this->errorResponse('Permission denied.', 403);
 
        $newImagePaths = [];
        $imageUploadError = null;
        $dbImageSuccess = true;
 
        if (isset($files['photos']) && !empty($files['photos']['name'][0]) && $files['photos']['error'][0] !== UPLOAD_ERR_NO_FILE) {
 
            if (!empty($existingListing['images'])) {
                $uploadDir = dirname(__DIR__, 3) . '/uploads';
                foreach ($existingListing['images'] as $image) {
                    if (!empty($image['image_path'])) {
                        $filename = basename($image['image_path']);
                        $filePath = $uploadDir . '/' . $filename;
                        if ($filename && file_exists($filePath)) {
                              @unlink($filePath);
                        }
                    }
                }
            }
 
            if (!$this->listingModel->deleteListingImages($listingId)) {
                $dbImageSuccess = false;
            }
 
            try {
                $newImagePaths = $this->handleImageUploads($files, $listingId);
            } catch (\Exception $e) {
                $imageUploadError = $e->getMessage();
                $dbImageSuccess = false;
            }
 
            if (!empty($newImagePaths)) {
                $mainIndex = isset($data['mainPhotoIndex']) ? (int) $data['mainPhotoIndex'] : 0;
                if ($mainIndex >= count($newImagePaths)) { $mainIndex = 0; }
 
                foreach ($newImagePaths as $index => $path) {
                    $isMain = ($index === $mainIndex);
                    if (!$this->listingModel->addListingImage($listingId, $path, $isMain)) {
                        $dbImageSuccess = false;
                    }
                }
            } elseif (!$imageUploadError && $dbImageSuccess) {
                  $imageUploadError = "No valid new images processed.";
            }
        }

        $textDataSuccess = $this->listingModel->updateListing($listingId, $data);
        if (!$textDataSuccess) {
            $this->errorResponse('Failed to update listing text data.', 500);
        }
 
 
        $finalListingData = $this->listingModel->getListingById($listingId);
 
        if ($finalListingData) {
            $mainImagePath = null;
            if (!empty($finalListingData['images'])) {
                foreach ($finalListingData['images'] as $img) {
                    if (!empty($img['is_main'])) {
                        $mainImagePath = $img['image_path'];
                        break;
                    }
                }
                if (!$mainImagePath && isset($finalListingData['images'][0]['image_path'])) {
                    $mainImagePath = $finalListingData['images'][0]['image_path'];
                }
            }
            $finalListingData['image_path'] = $mainImagePath;
 
              $message = 'Listing updated successfully.';
              $statusCode = 200;
              if (!$dbImageSuccess || $imageUploadError) {
                   $message = 'Listing text updated, but there was an issue processing new images.';
                   if ($imageUploadError) $message .= " Error: " . $imageUploadError;
                   $statusCode = 207;
              }
 
              $this->successResponse($finalListingData, $message, $statusCode);
 
          } else {
              $this->successResponse(null, 'Listing updated, but failed to retrieve final data.', 200);
          }
      }

     /**
      * Handles POST request to add images to an existing listing. (Requires Auth)
      */
     public function addImages(): void
     {
         $userId = $this->getUserId();

         $listingId = filter_input(INPUT_POST, 'listing_id', FILTER_VALIDATE_INT);
         $files = $_FILES;
          if (!$listingId || $listingId <= 0) $this->errorResponse('Missing or invalid listing ID.', 400);
          if (empty($files['photos']) || !is_array($files['photos']['name']) || empty($files['photos']['name'][0])) {
               $this->errorResponse("Missing 'photos' or no files uploaded.", 400);
          }

          $listing = $this->listingModel->getListingById($listingId);
          if (!$listing) $this->errorResponse('Listing not found.', 404);
          if ($listing['user_id'] != $userId) $this->errorResponse('Permission denied.', 403);

          try {
              $imagePaths = $this->handleImageUploads($files, $listingId);
              if (empty($imagePaths)) $this->errorResponse('No valid images processed.', 400);

              $imageDbSuccessCount = 0;
              foreach ($imagePaths as $path) {
                   if ($this->listingModel->addListingImage($listingId, $path, false)) {
                      $imageDbSuccessCount++;
                   }
              }
               if ($imageDbSuccessCount > 0) {
                   $this->successResponse( ['added_count' => $imageDbSuccessCount], 'Images processed.', 201);
               } else { $this->errorResponse('Failed to save image records.', 500); }
          } catch (\Exception $e) { $this->errorResponse('Server error during image upload.', 500); }
     }

    /**
     * @param array $files $_FILES array
     * @param int $listingId
     * @return array Paths of successfully uploaded files relative to web root
     * @throws \Exception On critical directory or file move errors
     */
    private function handleImageUploads(array $files, int $listingId): array
    {
        $uploadedPaths = [];
        if (empty($files['photos']) || !is_array($files['photos']['name'])) return [];
        $baseUploadDir = dirname(__DIR__, 3) . '/uploads';
        $webBaseDir = '/uploads';
        if (!file_exists($baseUploadDir)) { if (!mkdir($baseUploadDir, 0755, true)) throw new \Exception("Cannot create upload directory."); }
        if (!is_writable($baseUploadDir)) throw new \Exception("Upload directory not writable.");
        $photos = $files['photos'];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        for ($i = 0; $i < count($photos['name']); $i++) {
            if ($photos['error'][$i] !== UPLOAD_ERR_OK) continue;
            $tmpName = $photos['tmp_name'][$i];
            $originalName = preg_replace("/[^a-zA-Z0-9._-]/", "_", basename($photos['name'][$i]));
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            $baseName = pathinfo($originalName, PATHINFO_FILENAME);
            if (!in_array($extension, $allowedExtensions)) continue;
            $uniqueName = $baseName . '_' . uniqid() . '.' . $extension;
            $relativePath = $webBaseDir . '/' . $uniqueName;
            $destination = $baseUploadDir . '/' . $uniqueName;
            if (move_uploaded_file($tmpName, $destination)) {
                $uploadedPaths[] = $relativePath;
            }
        }
        return $uploadedPaths;
    }

    public function getImagesForListing(): void
    {

        $listingId = filter_input(INPUT_GET, 'listing_id', FILTER_VALIDATE_INT);

        if (!$listingId || $listingId <= 0) {
            $this->errorResponse('Missing or invalid listing_id parameter.', 400);
        }

        $images = $this->listingModel->getImages($listingId);

        if ($images !== false) {
            $this->successResponse($images);
        } else {
             $this->errorResponse('Could not retrieve images for the specified listing.', 404);
        }
    }
}