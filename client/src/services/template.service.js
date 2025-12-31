import axiosInstance from './axios.config';

// Get all templates (user's + public)
export const getTemplates = async () => {
  const response = await axiosInstance.get('templates');
  return response.data;
};

// Get single template
export const getTemplate = async (id) => {
  const response = await axiosInstance.get(`templates/${id}`);
  return response.data;
};

// Create new template
export const createTemplate = async (templateData) => {
  const response = await axiosInstance.post('templates', templateData);
  return response.data;
};

// Update template
export const updateTemplate = async (id, templateData) => {
  const response = await axiosInstance.put(`templates/${id}`, templateData);
  return response.data;
};

// Delete template
export const deleteTemplate = async (id) => {
  const response = await axiosInstance.delete(`templates/${id}`);
  return response.data;
};

// Clone template
export const cloneTemplate = async (id) => {
  const response = await axiosInstance.post(`templates/${id}/clone`);
  return response.data;
};

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate
};
