import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedback: any;
  onResponded: () => void;
}

const RespondFeedbackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  feedback,
  onResponded,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback?._id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/feedback/${feedback._id}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      toast.success('Comment added successfully');
      setComment('');
      onResponded();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Respond to Feedback"
      className="bg-white dark:bg-boxdark p-6 rounded shadow max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">Respond to Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Enter your response..."
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RespondFeedbackModal;
