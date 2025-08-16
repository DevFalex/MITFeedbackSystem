import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ViewFeedbackModal from '../components/Modals/ViewFeedbackModal';
import EditFeedbackModal from '../components/Modals/EditFeedbackModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import PortalDropdown from '../components/PortalDropdown';

const MyFeedback: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target as Element).closest('[data-dropdown-open]') &&
        !(e.target as Element).closest('[data-dropdown-button]')
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMyFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://mitfeedbacksystem.onrender.com/api/feedback/myfeeds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch feedbacks');
      const data = await res.json();
      setFeedbacks(data);
      setFiltered(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = feedbacks;
    if (searchTerm.trim()) {
      result = result.filter(
        (fb) =>
          fb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((fb) => fb.status === statusFilter);
    }
    if (startDate && endDate) {
      result = result.filter((fb) => {
        const date = new Date(fb.createdAt);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }
    setFiltered(result);
  }, [searchTerm, statusFilter, startDate, endDate, feedbacks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-500 text-white px-2 py-1 rounded text-sm';
      case 'REVIEWED':
        return 'bg-blue-500 text-white px-2 py-1 rounded text-sm';
      case 'RESOLVED':
        return 'bg-green-500 text-white px-2 py-1 rounded text-sm';
      default:
        return 'bg-gray-500 text-white px-2 py-1 rounded text-sm';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {user ? `My Feedback - ${user.username}` : 'My Feedback'}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 bg-white dark:bg-boxdark p-4 rounded shadow">
        <input
          type="text"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-boxdark rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Attachment</th>
                <th className="px-4 py-2 text-left">Comments</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fb) => (
                <tr key={fb._id} className="border-t">
                  <td className="px-4 py-2 font-medium">{fb.title}</td>
                  <td className="px-4 py-2">{fb.description}</td>
                  <td className="px-4 py-2">{fb.category}</td>
                  <td className="px-4 py-2">
                    <span className={getStatusColor(fb.status)}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {fb.attachment ? (
                      <a
                        href={`${process.env.REACT_APP_API_URL}/uploads/feedback/${fb.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {fb.comments && fb.comments.length > 0
                      ? `${fb.comments.length} comment(s)`
                      : '—'}
                  </td>
                  <td className="px-4 py-2 relative">
                    <button
                      data-dropdown-button
                      onClick={(e) => {
                        const rect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX,
                        });
                        setSelectedFeedback(fb);
                        setDropdownOpen(
                          dropdownOpen === fb._id ? null : fb._id,
                        );
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <BsThreeDotsVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Portal Dropdown */}
      {dropdownOpen && selectedFeedback && (
        <PortalDropdown position={dropdownPosition}>
          <div
            data-dropdown-open
            className="w-20 bg-white border rounded shadow-lg"
          >
            <button
              onClick={() => {
                setViewOpen(true);
                setDropdownOpen(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              View
            </button>
            <button
              onClick={() => {
                setEditOpen(true);
                setDropdownOpen(null);
              }}
              disabled={selectedFeedback.status !== 'PENDING'}
              className={`block w-full text-left px-4 py-2 ${
                selectedFeedback.status !== 'PENDING'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDeleteOpen(true);
                setDropdownOpen(null);
              }}
              disabled={selectedFeedback.status !== 'PENDING'}
              className={`block w-full text-left px-4 py-2 text-red-600 ${
                selectedFeedback.status !== 'PENDING'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              Delete
            </button>
          </div>
        </PortalDropdown>
      )}

      {/* Modals */}
      <ViewFeedbackModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        feedback={selectedFeedback}
      />
      <EditFeedbackModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        feedback={selectedFeedback}
        onUpdated={fetchMyFeedback}
      />
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        feedback={selectedFeedback}
        onDeleted={fetchMyFeedback}
      />
    </div>
  );
};

export default MyFeedback;
