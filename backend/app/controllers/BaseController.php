<?php
namespace App\controllers;

use PDO;

abstract class BaseController
{
    protected PDO $dbh;
    protected ?int $loggedInUserId = null;

    /**
    * @param PDO $dbConnection
    * @param bool $authenticate If true, requires login for the controller instance.
    */
    public function __construct(PDO $dbConnection, bool $authenticate = true)
    {
        $this->dbh = $dbConnection;
        if ($authenticate) {
            $this->authenticateUser();
        }
        $this->setHeaders();
    }

    /**
    * Sets standard API headers.
    */
    protected function setHeaders(): void
    {
        header('Access-Control-Allow-Origin: ' . $_ENV['CORS_ORIGIN']);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

     /**
      * Ensures user is authenticated using helper function. Stores user ID.
      * @throws \Exception If authentication fails or helper function unavailable.
      */
     protected function authenticateUser(): void
     {
         if (!function_exists('require_login')) {
             throw new \Exception('Authentication system unavailable.', 500);
         }
         $this->loggedInUserId = require_login();
     }

     /**
      * Gets the authenticated user's ID. Throws if called when not authenticated.
      * @return int
      * @throws \Exception
      */
      protected function getUserId(): int
      {
          if ($this->loggedInUserId === null) {
              $this->authenticateUser();
          }
 
          if ($this->loggedInUserId === null) {
              throw new \Exception('User authentication failed or user ID not set.', 401);
          }
 
          return $this->loggedInUserId;
      }
 

    /**
    * Sends a JSON response and terminates the script.
    * @param mixed $data
    * @param int $statusCode
    */
    protected function jsonResponse($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        if (!headers_sent()) {
             header('Content-Type: application/json');
        }
        echo json_encode($data);
        exit;
    }

    /**
    * Sends a standard success JSON response.
    * @param mixed|null $data
    * @param string $message
    * @param int $statusCode
    */
    protected function successResponse($data = null, string $message = '', int $statusCode = 200): void
    {
        $response = ['success' => true];
        if ($message) $response['message'] = $message;
        if ($data !== null) {
            $response['data'] = $data;
        }
        $this->jsonResponse($response, $statusCode);
    }

    /**
    * Sends a standard error JSON response.
    * @param string $message
    * @param int $statusCode
    * @param mixed|null $details Optional details (use with caution in production)
    */
    protected function errorResponse(string $message, int $statusCode = 400, $details = null): void
    {
        $response = ['success' => false, 'error' => $message];
        $this->jsonResponse($response, $statusCode);
    }

    /**
    * Retrieves and decodes JSON input from request body.
    * @return array|null
    */
    protected function getJsonInput(): ?array
    {
        $input = file_get_contents('php://input');
        if ($input === false || $input === '') return null;

        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
             throw new \InvalidArgumentException('Invalid JSON input: ' . json_last_error_msg(), 400);
        }
        return $data;
    }
}