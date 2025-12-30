import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import { useToast } from '../context/ToastContext';

const NewSessionModal = ({ isOpen, onClose, preselectedPatientId = null, onSessionCreated = null }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'follow-up',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    chiefComplaint: '',
    diagnosis: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      // Reset form data when modal opens
      setFormData({
        patientId: preselectedPatientId || '',
        type: 'follow-up',
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        chiefComplaint: '',
        diagnosis: ''
      });
    }
  }, [isOpen, preselectedPatientId]);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newSession = await sessionService.createSession(formData);
      
      // Call callback if provided, otherwise navigate
      if (onSessionCreated) {
        onSessionCreated(newSession);
      } else {
        navigate(`/sessions/${newSession._id}`);
      }
      
      // Close modal after successful creation
      onClose();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.userMessage || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">New Session</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!preselectedPatientId}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Session Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="initial">Initial Evaluation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="re-evaluation">Re-evaluation</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Date and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chief Complaint
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Why is the patient seeking treatment?"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Low back pain, Rotator cuff tear"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewSessionModal;
