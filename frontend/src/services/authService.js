import api from './api';

export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const updateProfileApi = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};
