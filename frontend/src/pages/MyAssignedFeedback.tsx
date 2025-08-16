import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ViewFeedbackModal from '../components/Modals/ViewFeedbackModal';
import RespondFeedbackModal from '../components/Modals/RespondFeedbackModal';
import UpdateStatusModal from '../components/Modals/UpdateStatusModal';

const MyAssignedFeedback: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [respondOpen, setRespondOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignedFeedback();
  }, []);

  const fetchAssignedFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://mitfeedbacksystem.onrender.com/api/feedback/assigned/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch assigned feedback');

      const data = await res.json();
      setFeedbacks(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        {user
          ? `My Assigned Feedback - ${user.username}`
          : 'My Assigned Feedback'}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : feedbacks.length === 0 ? (
        <p>No assigned feedback found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-boxdark rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Submitted By</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb._id} className="border-t">
                  <td className="px-4 py-2 font-medium">{fb.title}</td>
                  <td className="px-4 py-2">{fb.category}</td>
                  <td className="px-4 py-2">
                    {fb.isAnonymous ? 'Anonymous' : fb.createdBy?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={getStatusColor(fb.status)}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 relative">
                    <button
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === fb._id ? null : fb._id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {dropdownOpen === fb._id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
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
      <RespondFeedbackModal
        isOpen={respondOpen}
        onClose={() => setRespondOpen(false)}
        feedback={selectedFeedback}
        onResponded={fetchAssignedFeedback}
      />
      <UpdateStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        feedback={selectedFeedback}
        onStatusUpdated={fetchAssignedFeedback}
      />
    </div>
  );
};

export default MyAssignedFeedback;
