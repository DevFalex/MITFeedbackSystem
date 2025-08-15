import axios from 'axios';

export const submitFeedback = async (token: string, data: any) => {
  return axios.post('http://localhost:5000/api/feedback', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyFeedbacks = async (token: string) => {
  return axios.get('http://localhost:5000/api/feedback/myfeeds', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Add other feedback functions as needed
