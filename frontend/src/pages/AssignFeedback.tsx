import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AssignFeedback: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState('');

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://mitfeedbacksystem.onrender.com/api/users/lecturers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch lecturers');
      const data = await res.json();
      setLecturers(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAssign = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://mitfeedbacksystem.onrender.com/api/feedback/${id}/assign`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo: selectedLecturer }),
      });
      if (!res.ok) throw new Error('Failed to assign feedback');
      toast.success('Feedback assigned successfully');
      navigate('/all-feedback');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Assign Feedback</h1>
      <select
        className="border p-2 w-full mb-4"
        value={selectedLecturer}
        onChange={(e) => setSelectedLecturer(e.target.value)}
      >
        <option value="">Select Lecturer</option>
        {lecturers.map((lec) => (
          <option key={lec._id} value={lec._id}>
            {lec.username}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Assign
      </button>
    </div>
  );
};

export default AssignFeedback;
