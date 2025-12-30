import axiosInstance from './axios.config';

export const getPatients = async () => {
  const response = await axiosInstance.get('/patients');
  return response.data;
};

export const getPatient = async (id) => {
  const response = await axiosInstance.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await axiosInstance.post('/patients', patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await axiosInstance.put(`/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await axiosInstance.delete(`/patients/${id}`);
  return response.data;
};

export default {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
};
