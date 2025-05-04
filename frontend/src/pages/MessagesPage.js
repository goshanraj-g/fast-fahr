import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import NavBar from "../components/Navbar";
import ConversationList from "../components/messageComponents/ConversationList.js";
import ChatInterface from "../components/messageComponents/ChatInterface.js";
import AddContactModal from "../components/messageComponents/AddContactModal.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import "../components/css/messageCSS/messagesPage.css";

function MessagesPage() {
  const { currentUser, isLoading: authLoading, requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [selectedOtherUserId, setSelectedOtherUserId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [addContactError, setAddContactError] = useState("");

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [prefillUsername, setPrefillUsername] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const pollingIntervalRef = useRef(null);
  const POLLING_RATE_MS = 9000;

  const fetchConversations = useCallback(async (isInitialLoad = false) => {
    if (!currentUser) return [];
    try {
      const response = await fetch( `${process.env.REACT_APP_API_BASE}/messages/get_conversations.php`, { credentials: "include" } );
      if (!response.ok) { const errorText = await response.text(); throw new Error(`HTTP ${response.status}: ${errorText}`); }
      const responseData = await response.json();

      if (responseData.success && Array.isArray(responseData.data)) {
          const serverConversations = responseData.data.map((convo) => ({
              ...convo, isPlaceholder: false,
              lastMessageTimestamp: convo.lastMessageTimestamp ? new Date(convo.lastMessageTimestamp).toISOString() : null,
          }));

          setConversations((currentConversations) => {
              const serverConvoMap = new Map( serverConversations.map((convo) => [convo.other_user_id, convo]) );
              const nextStateConversations = [...serverConversations];
              currentConversations.forEach((currentConvo) => {
                  if ( currentConvo.isPlaceholder && !serverConvoMap.has(currentConvo.other_user_id) ) {
                      nextStateConversations.push(currentConvo);
                  }
              });

              const uniqueConversationsMap = new Map( nextStateConversations.map((convo) => [convo.other_user_id, convo]) );
              const uniqueConversations = Array.from(uniqueConversationsMap.values());
              uniqueConversations.sort((a, b) => {
                  const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
                  const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
                  return timeB - timeA;
              });
              return uniqueConversations;
          });
          return serverConversations;
      } else {
           throw new Error(responseData.error || "Invalid data format for conversations.");
      }
    } catch (err) {
      if (isInitialLoad) { setError(`Failed to load conversations: ${err.message}.`); setConversations([]); }
      return [];
    }
  }, [currentUser]);

  const fetchMessages = useCallback( async (otherUserId) => {
    if (!currentUser || !otherUserId) return;
    setIsLoadingMessages(true);
    setError("");
    try {
      const response = await fetch( `${process.env.REACT_APP_API_BASE}/messages/get_messages.php?other_user_id=${otherUserId}`, { credentials: "include" } );
      if (!response.ok) { const errorText = await response.text(); throw new Error(`HTTP ${response.status}: ${errorText}`); }
      const responseData = await response.json();

      if (responseData.success && Array.isArray(responseData.data)) {
          setMessages((prev) => ({ ...prev, [otherUserId]: responseData.data }));
      } else {
           throw new Error(responseData.error || "Invalid data format for messages.");
      }
    } catch (err) { setError(`Failed to load messages for user ${otherUserId}: ${err.message}`); }
    finally { setIsLoadingMessages(false); }
  }, [currentUser]);

  const handleSelectConversation = useCallback(
    (otherUserId) => {
      if (!requireAuth()) return;
      if (otherUserId === selectedOtherUserId) return;

      setSelectedOtherUserId(otherUserId);
      setError("");
      setDeleteError("");

      if (!isLoadingMessages) {
        fetchMessages(otherUserId);
      }

      setConversations((prevConversations) => {
        const convoIndex = prevConversations.findIndex(c => c.other_user_id === otherUserId);
        if (convoIndex === -1 || !prevConversations[convoIndex].unread) {
          return prevConversations;
        }

        fetch(`${process.env.REACT_APP_API_BASE}/messages/mark_read.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender_id: otherUserId }),
          credentials: "include",
        });

        const updatedConvo = { ...prevConversations[convoIndex], unread: false };
        return [
            ...prevConversations.slice(0, convoIndex),
            updatedConvo,
            ...prevConversations.slice(convoIndex + 1)
        ];
      });
    },
    [requireAuth, selectedOtherUserId, fetchMessages, isLoadingMessages]
  );

  const handleAddMessage = useCallback( async (newMessageData) => {
      if (!requireAuth() || !selectedOtherUserId) return;

      const tempId = `temp_${Date.now()}`;
      const now = new Date();
      const optimisticMessage = {
          id: tempId,
          senderId: currentUser.id,
          receiverId: selectedOtherUserId,
          senderName: currentUser.username || "You",
          senderAvatar: currentUser.profile_picture || null,
          text: newMessageData.text,
          timestamp: now.toISOString(),
          isRead: false,
          isSending: true,
      };

      setMessages((prev) => ({
          ...prev,
          [selectedOtherUserId]: [ ...(prev[selectedOtherUserId] || []), optimisticMessage ],
      }));

      setConversations((prevConvos) => {
          const optimisticTimestampISO = optimisticMessage.timestamp;
          const convoIndex = prevConvos.findIndex((c) => c.other_user_id === selectedOtherUserId);
          let updatedConvos;
          if (convoIndex > -1) {
              const updatedConvo = {
                  ...prevConvos[convoIndex],
                  lastMessage: optimisticMessage.text,
                  lastMessageTimestamp: optimisticTimestampISO,
                  isPlaceholder: false
              };
              updatedConvos = [
                  ...prevConvos.slice(0, convoIndex),
                  updatedConvo,
                  ...prevConvos.slice(convoIndex + 1)
              ];
          } else {
              updatedConvos = prevConvos;
          }

          return updatedConvos.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
              const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
              return timeB - timeA;
          });
      });

      try {
          const response = await fetch( `${process.env.REACT_APP_API_BASE}/messages/send_message.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiver_id: selectedOtherUserId, content: newMessageData.text }), credentials: "include" } );
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error( result.error || `HTTP ${response.status}` );
          if (!result.data?.newMessage) throw new Error("Missing newMessage in API response.");

          const realMessage = result.data.newMessage;

          setMessages((prev) => {
              const currentChatMessages = prev[selectedOtherUserId] || [];
              const finalMessages = currentChatMessages.map((msg) =>
                  msg.id === tempId ? { ...realMessage, isSending: false } : msg
              );

               if (!finalMessages.some((msg) => msg.id === realMessage.id && msg.id !== tempId)) {
                    const filtered = currentChatMessages.filter( (msg) => msg.id !== tempId );
                    filtered.push({ ...realMessage, isSending: false });
                    return { ...prev, [selectedOtherUserId]: filtered };
               }
              return { ...prev, [selectedOtherUserId]: finalMessages };
          });

          setConversations((prev) =>
              prev.map((convo) =>
                   convo.other_user_id === selectedOtherUserId
                       ? { ...convo,
                           lastMessage: realMessage.text,
                           lastMessageTimestamp: realMessage.timestamp || new Date().toISOString(),
                           isPlaceholder: false }
                       : convo
              ).sort((a, b) => {
                   const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
                   const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
                   return timeB - timeA;
              })
          );

      } catch (err) {
          setError(`Send failed: ${err.message}.`);
          setMessages((prev) => {
              const currentMsgs = prev[selectedOtherUserId] || [];
              return { ...prev, [selectedOtherUserId]: currentMsgs.map((msg) =>
                      msg.id === tempId ? { ...msg, isSending: false, error: "Failed to send" } : msg
              )};
          });
      }
    }, [currentUser, requireAuth, selectedOtherUserId, setError, setMessages, setConversations]
  );

  const openAddContactModal = useCallback(() => { if (!requireAuth()) return; setPrefillUsername(""); setAddContactError(""); setIsAddContactModalOpen(true); }, [requireAuth]);
  const closeAddContactModal = useCallback(() => { setIsAddContactModalOpen(false); setPrefillUsername(""); setAddContactError(""); }, []);
  const handleFindAndAddContact = useCallback( async (usernameToAdd) => {
      if (!requireAuth()) return false;
      setAddContactError("");
      let success = false;
      if (!usernameToAdd?.trim()) { setAddContactError("Username required."); return false; }
      try {
        const response = await fetch( `${process.env.REACT_APP_API_BASE}/messages/find_user.php?username=${encodeURIComponent(usernameToAdd.trim())}`, { credentials: "include" } );
        const result = await response.json();
        if (!response.ok || !result.success) {
            setAddContactError( result.error || `Could not find user '${usernameToAdd}'.` );
        } else {
            if (!result.data?.user) throw new Error("Missing user data in findUser response.");
            const foundUser = result.data.user;

            if (foundUser.id === currentUser.id) { setAddContactError("Cannot add yourself."); return false; }

            let alreadyExists = false;
            setConversations((prev) => {
                alreadyExists = prev.some((c) => c.other_user_id === foundUser.id);
                if (alreadyExists) return prev;

                const newPlaceholderConvo = {
                    other_user_id: foundUser.id,
                    userName: foundUser.username,
                    userAvatar: foundUser.avatar || null,
                    lastMessage: "Chat started",
                    lastMessageTimestamp: new Date().toISOString(),
                    unread: false,
                    isPlaceholder: true
                };
                return [...prev, newPlaceholderConvo].sort((a, b) => {
                    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
                    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
                    return timeB - timeA;
                });
            });

            if (alreadyExists) {
                handleSelectConversation(foundUser.id);
                success = true;
            } else {
                setMessages((prev) => ({ ...prev, [foundUser.id]: [] }));
                handleSelectConversation(foundUser.id);
                success = true;
            }
            if (success) closeAddContactModal();
        }
      } catch (err) {
          setAddContactError("An error occurred while searching.");
          success = false;
      }
      return success;
    }, [requireAuth, handleSelectConversation, closeAddContactModal, currentUser]
  );

  const openDeleteModal = useCallback( (otherUserId, userName) => {
    if (!requireAuth()) return;
    setUserToDelete({ id: otherUserId, name: userName });
    setDeleteError("");
    setIsDeleteModalOpen(true);
  }, [requireAuth]);

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError("");
  }, [isDeleting]);

  const handleConfirmDeleteChat = useCallback(async () => {
    if (!userToDelete || !requireAuth()) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch( `${process.env.REACT_APP_API_BASE}/messages/delete_conversation.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ other_user_id: userToDelete.id }), credentials: "include", } );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setConversations((prev) => prev.filter((c) => c.other_user_id !== userToDelete.id));
      setMessages((prev) => { const next = { ...prev }; delete next[userToDelete.id]; return next; });
      if (selectedOtherUserId === userToDelete.id) {
        setSelectedOtherUserId(null);
      }
      closeDeleteModal();

    } catch (err) {
      setDeleteError(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }, [userToDelete, requireAuth, selectedOtherUserId, closeDeleteModal, setConversations, setMessages, setSelectedOtherUserId]);

  useEffect(() => {
    let isMounted = true;
    if (!authLoading) {
      if (!requireAuth()) {
        return;
      }

      const shouldOpenModal = location.state?.openAddContactModal;
      const usernameToPrefill = location.state?.prefillUsername;
      if (shouldOpenModal && usernameToPrefill && isMounted) {
        setPrefillUsername(usernameToPrefill);
        setIsAddContactModalOpen(true);
        navigate(location.pathname, { replace: true, state: {} });
      }

      setIsLoadingConversations(true);
      fetchConversations(true)
        .catch((err) => { if (isMounted) setError("Failed to load chats initially."); })
        .finally(() => { if (isMounted) setIsLoadingConversations(false); });
    }
    return () => { isMounted = false; };
  }, [authLoading, requireAuth, fetchConversations, location.state, navigate]);

  useEffect(() => {
    let intervalId = null;
    if (!isLoadingConversations && currentUser && !authLoading) {
      if (!pollingIntervalRef.current) {
        intervalId = setInterval(() => {
          fetchConversations(false);
          if (selectedOtherUserId) {
            fetchMessages(selectedOtherUserId);
          }
        }, POLLING_RATE_MS);
        pollingIntervalRef.current = intervalId;
      }
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [ currentUser, authLoading, isLoadingConversations, selectedOtherUserId, fetchConversations, fetchMessages ]);

  const selectedConversation = conversations.find( (c) => c.other_user_id === selectedOtherUserId );
  const currentMessages = selectedOtherUserId ? (messages[selectedOtherUserId] || []) : [];

  return (
    <div>
      <div className="messages-page">
        <div className="conversation-list-area">
          {isLoadingConversations ? ( <div className="loading-conversations">Loading...</div> ) : (
            <ConversationList
              conversations={conversations} selectedConversationId={selectedOtherUserId}
              onSelectConversation={handleSelectConversation} onAddContact={openAddContactModal}
              currentUser={currentUser}
            />
          )}
        </div>

        <div className="chat-interface-area">
          {error && <div className="error-banner">{error}</div>}

          {selectedConversation ? (
            <ChatInterface
              key={selectedOtherUserId}
              conversation={selectedConversation}
              messages={currentMessages}
              isLoading={ isLoadingMessages && selectedOtherUserId === selectedConversation.other_user_id }
              onSendMessage={handleAddMessage}
              onDeleteChat={() => openDeleteModal( selectedConversation.other_user_id, selectedConversation.userName )}
              currentUser={currentUser}
            />
          ) : !isLoadingConversations && conversations.length === 0 ? (
             <div className="no-chat-selected"> <h2>No conversations</h2> <p>Click '+' to start chatting.</p> </div>
          ) : !isLoadingConversations ? (
             <div className="no-chat-selected"> <h2>Select a conversation</h2> <p>Choose a chat to view messages.</p> </div>
          ) : null }
        </div>
      </div>

      {/* Modals */}
      {isAddContactModalOpen && ( <AddContactModal onClose={closeAddContactModal} onAddContact={handleFindAndAddContact} initialUsername={prefillUsername} error={addContactError}/> )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteChat}
        isLoading={isDeleting}
        title="Delete Conversation"
        bodyText={`Are you sure you want to permanently delete the entire chat history with ${userToDelete?.name || 'this user'}?`}
        warningText="This action cannot be undone and will delete the chat for both users."
        confirmText="Delete"
        confirmIcon="fa-times"
        cancelText="Return"
        errorText={deleteError}
      />
    </div>
  );
}

export default MessagesPage;