import axiosInstance from './axios.config';

const noteService = {
  // Get all notes
  async getNotes() {
    const response = await axiosInstance.get('notes');
    return response.data;
  },

  // Get a single note
  async getNote(id) {
    const response = await axiosInstance.get(`notes/${id}`);
    return response.data;
  },

  // Create a new note
  async createNote(noteData) {
    const response = await axiosInstance.post('notes', noteData);
    return response.data;
  },

  // Update a note
  async updateNote(id, noteData) {
    const response = await axiosInstance.put(`notes/${id}`, noteData);
    return response.data;
  },

  // Delete a note
  async deleteNote(id) {
    const response = await axiosInstance.delete(`notes/${id}`);
    return response.data;
  },

  // Get notes by patient
  async getNotesByPatient(patientId) {
    const response = await axiosInstance.get(`notes?patient=${patientId}`);
    return response.data;
  },

  // Get notes by session
  async getNotesBySession(sessionId) {
    const response = await axiosInstance.get(`notes?session=${sessionId}`);
    return response.data;
  }
};

export default noteService;
