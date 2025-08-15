import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

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
      className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">{feedback.title}</h2>
      <p className="mb-2">{feedback.description}</p>
      <p className="text-sm text-gray-600 mb-2">
        Category: {feedback.category}
      </p>
      <p className="text-sm text-gray-600 mb-2">Status: {feedback.status}</p>
      {feedback.attachment && (
        <a
          href={`${process.env.REACT_APP_API_URL}/uploads/feedback/${feedback.attachment}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          View Attachment
        </a>
      )}
      <button
        onClick={onClose}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </Modal>
  );
};

export default ViewFeedbackModal;
