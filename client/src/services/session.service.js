import axiosInstance from './axios.config';

export const getSessions = async () => {
  const response = await axiosInstance.get('/sessions');
  return response.data;
};

export const getSession = async (id) => {
  const response = await axiosInstance.get(`/sessions/${id}`);
  return response.data;
};

export const getPatientSessions = async (patientId) => {
  const response = await axiosInstance.get(`/sessions/patient/${patientId}`);
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await axiosInstance.post('/sessions', sessionData);
  return response.data;
};

export const updateSession = async (id, sessionData) => {
  const response = await axiosInstance.put(`/sessions/${id}`, sessionData);
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await axiosInstance.delete(`/sessions/${id}`);
  return response.data;
};

export default {
  getSessions,
  getSession,
  getPatientSessions,
  createSession,
  updateSession,
  deleteSession
};
