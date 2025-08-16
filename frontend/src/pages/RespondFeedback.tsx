import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RespondFeedback: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://mitfeedbacksystem.onrender.com/api/feedback/${id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      toast.success('Comment added successfully');
      navigate('/all-feedback');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Respond to Feedback</h1>
      <textarea
        className="border p-2 w-full mb-4"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type your response..."
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send Response
      </button>
    </div>
  );
};

export default RespondFeedback;
