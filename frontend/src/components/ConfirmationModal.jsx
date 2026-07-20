import "../styles/components/ConfirmationModal.css";

function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
})
{

    if (!isOpen) return null;

    return (

        <div className="modal-overlay">

            <div className="modal-container">

                <h2>{title}</h2>
                <p>{message}</p>

                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={onCancel}>
                        {cancelText}
                    </button>

                    <button className="confirm-btn" onClick={onConfirm}>
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>

    );

}

export default ConfirmationModal;