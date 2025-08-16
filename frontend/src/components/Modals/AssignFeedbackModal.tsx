import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

interface AssignFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: any;
  onSuccess: () => void;
}

type RoleOption = 'LECTURER' | 'MIT_COORDINATOR' | 'ADMIN';

const AssignFeedbackModal: React.FC<AssignFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onSuccess,
}) => {
  const [role, setRole] = useState<RoleOption | ''>('');
  const [users, setUsers] = useState<any[]>([]);
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setRole('');
      setUsers([]);
      setAssignee('');
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!role) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://mitfeedbacksystem.onrender.com/api/users/role/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load users for selected role');
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    fetchUsers();
  }, [role]);

  const handleAssign = async () => {
    if (!role) return toast.error('Please select a role');
    if (!assignee) return toast.error('Please select a user to assign');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://mitfeedbacksystem.onrender.com/api/feedback/${feedback._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, assignee }),
      });
      if (!res.ok) throw new Error('Failed to assign feedback');

      toast.success('Feedback assigned successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!feedback) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white dark:bg-boxdark p-6 rounded shadow-lg max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-lg font-bold mb-4">Assign Feedback</h2>
      <p className="mb-4">{feedback.title}</p>

      <label className="block text-sm font-medium mb-1">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as RoleOption)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Select Role</option>
        <option value="LECTURER">Lecturer</option>
        <option value="MIT_COORDINATOR">MIT Coordinator</option>
        <option value="ADMIN">Admin</option>
      </select>

      {role && (
        <>
          <label className="block text-sm font-medium mb-1">User</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          >
            <option value="">Select {role}</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || u.username || u.email}
              </option>
            ))}
          </select>
        </>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Assign
        </button>
      </div>
    </Modal>
  );
};

export default AssignFeedbackModal;
