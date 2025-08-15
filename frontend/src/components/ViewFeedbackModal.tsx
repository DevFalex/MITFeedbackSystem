import React from 'react';
import Modal from 'react-modal';

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: any;
}

const ViewFeedbackModal: React.FC<ViewFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
}) => {
  if (!feedback) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white dark:bg-boxdark p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-bold mb-4">{feedback.title}</h2>
      <p className="mb-2">
        <strong>Category:</strong> {feedback.category}
      </p>
      <p className="mb-2">
        <strong>Status:</strong> {feedback.status}
      </p>
      <p className="mb-2">
        <strong>Submitted By:</strong>{' '}
        {feedback.isAnonymous
          ? 'Anonymous'
          : feedback.createdBy?.username || '—'}
      </p>
      <p className="mb-4">
        <strong>Description:</strong> {feedback.description}
      </p>

      {feedback.attachment && (
        <div className="mb-4">
          <strong>Attachment:</strong>{' '}
          <a
            href={`${process.env.REACT_APP_API_URL}/uploads/feedback/${feedback.attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View
          </a>
        </div>
      )}

      <button
        onClick={onClose}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Close
      </button>
    </Modal>
  );
};

export default ViewFeedbackModal;
