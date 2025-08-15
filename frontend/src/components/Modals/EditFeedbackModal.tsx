import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

interface EditFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: any;
  onUpdated: () => void;
}

const EditFeedbackModal: React.FC<EditFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onUpdated,
}) => {
  const [title, setTitle] = useState(feedback?.title || '');
  const [description, setDescription] = useState(feedback?.description || '');
  const [category, setCategory] = useState(feedback?.category || 'FEEDBACK');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (feedback.status !== 'PENDING') {
      toast.error('Cannot edit feedback after review');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (file) formData.append('attachment', file);

      const res = await fetch(`/api/feedback/${feedback._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Update failed');
      toast.success('Feedback updated successfully');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">Edit Feedback</h2>
      <input
        className="border p-2 w-full mb-3"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="border p-2 w-full mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="FEEDBACK">Feedback</option>
        <option value="SUGGESTION">Suggestion</option>
      </select>
      <input
        type="file"
        className="mb-3"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
      <button
        onClick={onClose}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </Modal>
  );
};

export default EditFeedbackModal;
