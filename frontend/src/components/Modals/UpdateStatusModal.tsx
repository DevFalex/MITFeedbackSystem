import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedback: any;
  onStatusUpdated: () => void;
}

const UpdateStatusModal: React.FC<Props> = ({
  isOpen,
  onClose,
  feedback,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState(feedback?.status || 'PENDING');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback?._id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://mitfeedbacksystem.onrender.com/api/feedback/${feedback._id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Update Status"
      className="bg-white dark:bg-boxdark p-6 rounded shadow max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">Update Status</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
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
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateStatusModal;
