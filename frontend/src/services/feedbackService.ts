import axios from 'axios';

export const submitFeedback = async (token: string, data: any) => {
  return axios.post('https://mitfeedbacksystem.onrender.com/api/feedback', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyFeedbacks = async (token: string) => {
  return axios.get('https://mitfeedbacksystem.onrender.com/api/feedback/myfeeds', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Add other feedback functions as needed
