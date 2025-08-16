import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ViewFeedbackModal from '../components/ViewFeedbackModal';
import AssignFeedbackModal from '../components/Modals/AssignFeedbackModal';
import RespondFeedbackModal from '../components/Modals/RespondFeedbackModal';
import UpdateStatusModal from '../components/Modals/UpdateStatusModal';

const AllFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [respondOpen, setRespondOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Dropdown
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchAllFeedback();
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

  const fetchAllFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://mitfeedbacksystem.onrender.com/api/feedback/allfeeds', {
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

  // Filter
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

    setFiltered(result);
  }, [searchTerm, statusFilter, feedbacks]);

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

  // Role permissions

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Feedback</h1>

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
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        <div className="overflow-x-auto overflow-y-visible bg-white dark:bg-boxdark rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Submitted By</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2">Assigned To</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fb) => (
                <tr key={fb._id} className="border-t">
                  <td className="px-4 py-2 font-medium">{fb.title}</td>
                  <td className="px-4 py-2">{fb.category}</td>
                  <td className="px-4 py-2">
                    <span className={getStatusColor(fb.status)}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {fb.isAnonymous
                      ? 'Anonymous'
                      : fb.createdBy?.name || fb.createdBy?.username || '—'}
                  </td>

                  <td className="px-4 py-2">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {fb.assignedTo
                      ? fb.assignedTo.name ||
                        fb.assignedTo.username ||
                        fb.assignedTo.email
                      : '—'}
                  </td>

                  <td className="px-4 py-2 relative">
                    <button
                      data-dropdown-button
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === fb._id ? null : fb._id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {dropdownOpen === fb._id && (
                      <div
                        data-dropdown-open
                        className="absolute right-0 top-full mt-2 w-44 bg-white border rounded shadow-lg z-50"
                      >
                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setViewOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setAssignOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Assign
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setRespondOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Respond
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setStatusOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Update Status
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ViewFeedbackModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        feedback={selectedFeedback}
      />
      <AssignFeedbackModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        feedback={selectedFeedback}
        onSuccess={fetchAllFeedback}
      />
      <RespondFeedbackModal
        isOpen={respondOpen}
        onClose={() => setRespondOpen(false)}
        feedback={selectedFeedback}
        onSuccess={fetchAllFeedback}
      />
      <UpdateStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        feedback={selectedFeedback}
        onSuccess={fetchAllFeedback}
      />
    </div>
  );
};

export default AllFeedback;
