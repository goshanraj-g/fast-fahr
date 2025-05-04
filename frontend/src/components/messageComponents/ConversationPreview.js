import React from "react";
import "../css/messageCSS/conversationPreview.css";

/**
 * Renders a preview card for a single conversation.
 * @param {object} props - Component properties.
 * @param {object} props.conversation - Object containing conversation details (userName, userAvatar, lastMessage, unread, other_user_id).
 * @param {boolean} props.isSelected - Flag indicating if this conversation is currently selected.
 * @param {function} props.onSelect - Callback function triggered when the preview card is clicked.
 * @returns {JSX.Element} The ConversationPreview component.
*/
function ConversationPreview({ conversation, isSelected, onSelect }) {
  const { userName, userAvatar, lastMessage, unread } = conversation;

  return (
    <div
      className={`conversation-preview ${isSelected ? "active" : ""} ${
        unread ? "unread" : ""
      }`}
      onClick={onSelect}
    >
      {userAvatar ? (
        <img
          src={`${process.env.REACT_APP_STATIC_BASE}${userAvatar}`}
          alt={`${userName || 'User'}'s avatar`}
          className="preview-avatar"
          onError={(e) => e.target.style.display = 'none'}
        />
      ) : (

        <div className="profile-initial preview-avatar">
          {userName ? userName.charAt(0).toUpperCase() : '?'}
        </div>
      )}
      <div className="preview-details">
        <h3 className="preview-username">{userName || 'Unknown User'}</h3>
        <p className="preview-message">{lastMessage || '...'}</p>
      </div>
      <div className="preview-meta">
        {unread && <span className="unread-indicator">!</span>}
      </div>
    </div>
  );
}

export default ConversationPreview;