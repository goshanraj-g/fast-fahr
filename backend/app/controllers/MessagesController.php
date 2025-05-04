<?php
namespace App\controllers;

use App\models\MessageModel;
use App\models\UserModel;
use PDO;
use DateTimeImmutable;
use Exception;

class MessagesController extends BaseController
{
    private MessageModel $messageModel;
    private UserModel $userModel;

    /**
     * @param PDO $dbConnection
     */
    public function __construct(PDO $dbConnection)
    {
        parent::__construct($dbConnection);
        $this->messageModel = new MessageModel($this->dbh);
        $this->userModel = new UserModel($this->dbh);
    }

    /**
     * Gets the list of conversations for the logged-in user.
     */
    public function getConversations(): void
    {
        $userId = $this->getUserId();
        $conversations = $this->messageModel->getConversations($userId);

        foreach ($conversations as &$convo) {
            if (!empty($convo['lastMessageTimestamp'])) {
                try {
                     $date = new DateTimeImmutable($convo['lastMessageTimestamp']);
                     $convo['lastMessageTimestamp'] = $date->format(DateTimeImmutable::ATOM);
                } catch (Exception $e) { $convo['lastMessageTimestamp'] = null; }
            }
            $convo['unread'] = isset($convo['unreadCount']) && $convo['unreadCount'] > 0;
            unset($convo['unreadCount']);
        }
        unset($convo);
        $this->successResponse($conversations);
    }

    /**
     * Gets messages between the logged-in user and another user.
     */
    public function getMessages(): void
    {
        $otherUserId = filter_input(INPUT_GET, 'other_user_id', FILTER_VALIDATE_INT);
        if (!$otherUserId) $this->errorResponse('Missing or invalid other_user_id parameter.', 400);

        $loggedInUserId = $this->getUserId();
        $messages = $this->messageModel->getMessagesBetweenUsers($loggedInUserId, $otherUserId);
        $formattedMessages = [];
        foreach ($messages as $msg) {
             try { $date = new DateTimeImmutable($msg['sent_at']); $timestamp = $date->format(DateTimeImmutable::ATOM); }
             catch(Exception $e) { $timestamp = null; }
            $formattedMessages[] = [
                'id' => $msg['message_id'], 'senderId' => $msg['sender_id'], 'receiverId' => $msg['receiver_id'],
                'senderName' => $msg['senderName'], 'senderAvatar' => $msg['senderAvatar'] ?? null,
                'text' => $msg['content'], 'timestamp' => $timestamp, 'isRead' => (bool)$msg['is_read']
            ];
        }
        $this->messageModel->markMessagesAsRead($loggedInUserId, $otherUserId);
        $this->successResponse($formattedMessages);
    }

    /**
     * Sends a new message. POST request with JSON body.
     */
    public function sendMessage(): void
    {
        $data = $this->getJsonInput();
        if ($data === null) $this->errorResponse('Invalid JSON request body.', 400);

        $receiverId = filter_var($data['receiver_id'] ?? null, FILTER_VALIDATE_INT);
        $content = trim(filter_var($data['content'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));

        if (!$receiverId || empty($content)) $this->errorResponse('Missing or invalid receiver_id or content.', 400);

        $loggedInUserId = $this->getUserId();
        if ($receiverId === $loggedInUserId) $this->errorResponse('Cannot send messages to yourself.', 400);

        $newMessageId = $this->messageModel->sendMessage($loggedInUserId, $receiverId, $content);
        if ($newMessageId) {
            $newMessageData = $this->messageModel->getMessageById($newMessageId);
            if ($newMessageData) {
                try { $date = new DateTimeImmutable($newMessageData['sent_at']); $timestamp = $date->format(DateTimeImmutable::ATOM); }
                catch (Exception $e) { $timestamp = date(DateTimeImmutable::ATOM); }
               $formattedMessage = [
                   'id' => $newMessageData['message_id'], 'senderId' => $newMessageData['sender_id'], 'receiverId' => $newMessageData['receiver_id'],
                   'senderName' => $newMessageData['senderName'], 'senderAvatar' => $newMessageData['senderAvatar'] ?? null,
                   'text' => $newMessageData['content'], 'timestamp' => $timestamp, 'isRead' => false
               ];
                $this->successResponse(['newMessage' => $formattedMessage], 'Message sent.', 201);
            } else {
                $this->successResponse(null, 'Message sent, but retrieval failed.', 200);
            }
        } else {
            $this->errorResponse('Failed to save message.', 500);
        }
    }

    /**
     * Deletes a conversation. POST or DELETE request with JSON body.
     */
    public function deleteConversation(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
              $this->errorResponse('Method Not Allowed. Use POST or DELETE.', 405);
         }
        $data = $this->getJsonInput();
        $otherUserId = filter_var($data['other_user_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$otherUserId) $this->errorResponse('Missing or invalid other_user_id.', 400);

        $loggedInUserId = $this->getUserId();
        if ($this->messageModel->deleteConversation($loggedInUserId, $otherUserId)) {
            $this->successResponse(null, 'Conversation deleted.');
        } else {
            $this->errorResponse('Failed to delete conversation.', 500);
        }
    }

    /**
     * Marks messages as read. POST request with JSON body.
     */
    public function markRead(): void
    {
        $data = $this->getJsonInput();
        $senderId = filter_var($data['sender_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$senderId) $this->errorResponse('Missing or invalid sender_id.', 400);

        $loggedInUserId = $this->getUserId();
        if ($this->messageModel->markMessagesAsRead($loggedInUserId, $senderId)) {
            $this->successResponse(null, 'Messages marked as read.');
        } else {
            $this->errorResponse('Failed to mark messages as read.', 500);
        }
    }

     /**
     * Finds a user by username. GET request.
     */
    public function findUser(): void
    {
        $usernameToFind = trim(filter_input(INPUT_GET, 'username', FILTER_SANITIZE_SPECIAL_CHARS) ?: '');
        if (empty($usernameToFind)) $this->errorResponse('Missing username parameter.', 400);

        $loggedInUserId = $this->getUserId();
        $foundUser = $this->userModel->getUserByUsername($usernameToFind);

        if ($foundUser) {
            if ((int)$foundUser['user_id'] === $loggedInUserId) {
                $this->errorResponse('Cannot start conversation with yourself.', 400);
            } else {
                $this->successResponse([
                    'user' => [
                        'id' => (int)$foundUser['user_id'],
                        'username' => $foundUser['username'],
                        'avatar' => $foundUser['profile_picture'] ?? null
                    ]
                ]);
            }
        } else {
             $this->errorResponse('User not found.', 404);
        }
    }
}