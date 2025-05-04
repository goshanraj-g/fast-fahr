import React from 'react';
import './css/modalStyles.css';

/**
* Renders a generic confirmation modal controlled by props.
* Similar structure to ListingCard - adaptable via props.
*
* @param {object} props - Component properties.
* @param {boolean} props.isOpen - Controls if the modal is visible.
* @param {function} props.onClose - Function to call to close the modal.
* @param {function} props.onConfirm - Function to execute when confirm button is clicked.
* @param {boolean} props.isLoading - Disables buttons and shows loading text when true.
* @param {string} props.title - The text for the modal header.
* @param {string | JSX.Element} props.bodyText - The main message/question in the modal body.
* @param {string | JSX.Element} [props.warningText] - Optional additional warning text.
* @param {string} [props.confirmText='Confirm'] - Text for the confirmation button.
* @param {string} [props.confirmIcon='fa-check'] - Font Awesome icon class for the confirm button.
* @param {string} [props.cancelText='Cancel'] - Text for the cancel button.
* @param {string} [props.errorText=''] - Text to display if an error occurred during the confirm action.
* @returns {JSX.Element | null} The ConfirmationModal component or null if not open.
*/
function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    title,
    bodyText,
    warningText = '',
    confirmText = 'Confirm',
    confirmIcon = 'fa-check',
    cancelText = 'Cancel',
    errorText = ''
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Close" disabled={isLoading}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p>{bodyText}</p>
                    {warningText && <p className="warning-text">{warningText}</p>}
                    {errorText && <p className="error-text">{errorText}</p>}
                </div>
                <div className="modal-actions">
                    <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={isLoading}>
                        <i className="fas fa-arrow-left"></i> {cancelText}
                    </button>
                    <button type="button" className="modal-confirm-btn delete-btn" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : <><i className={`fas ${confirmIcon}`}></i> {confirmText}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;