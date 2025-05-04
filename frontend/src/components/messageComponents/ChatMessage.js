import React from "react";
import "../css/messageCSS/chatMessage.css";

/**
* Renders a single chat message bubble WITHOUT avatars, showing sender name.
* @param {object} props - Component properties.
* @param {object} props.message - The message object (senderName, text, timestamp, isSending).
* @param {boolean} props.isCurrentUser - Flag indicating if the message was sent by the currently logged-in user.
* @returns {JSX.Element} The ChatMessage component.
*/
function ChatMessage({ message, isCurrentUser }) {
  const { senderName, text, timestamp, isSending } = message;

  const messageClasses = `chat-message ${isCurrentUser ? "sent" : "received"} ${
    isSending ? "sending" : ""
  }`;

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
      const originalDate = new Date(isoString);

      // NOTE!!!: I needed to adjust the time by 6 hours  here so by default messages show time in EST instead of UTC
      // However -> Database still stores times in UTC, this is just a hacky solution to have the time of messages in EST for frontend
      const adjustedDate = new Date(originalDate.getTime() + (6 * 60 * 60 * 1000));

      return adjustedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className={messageClasses}>
      <div className="message-content">
        <span className="message-sender-name">
            {isCurrentUser ? "You" : (senderName || "Unknown User")}
        </span>
        <div className="message-bubble">
          <p className="message-text">{text}</p>
        </div>
        {isSending ? (
          <span className="message-timestamp sending-status">Sending...</span>
        ) : (
          <span className="message-timestamp">
            {formatTimestamp(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;