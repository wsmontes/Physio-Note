import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit2, FiPlus, FiUser, FiPhone, FiMail, 
  FiCalendar, FiFileText, FiActivity, FiMapPin 
} from 'react-icons/fi';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import NewSessionModal from '../components/NewSessionModal';
import { useToast } from '../context/ToastContext';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientData = await patientService.getPatient(id);
      setPatient(patientData);
      
      // Initialize edit form with proper structure
      setEditForm({
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        phone: patientData.phone || '',
        email: patientData.email || '',
        address: patientData.address || ''
      });

      // Fetch sessions for this patient
      const patientSessions = await sessionService.getPatientSessions(id);
      setSessions(patientSessions);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error(error.userMessage || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      // Clean up the data - remove empty optional fields
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      };
      
      // Only add optional fields if they have values
      if (editForm.dateOfBirth) updateData.dateOfBirth = editForm.dateOfBirth;
      if (editForm.gender) updateData.gender = editForm.gender;
      if (editForm.phone) updateData.phone = editForm.phone;
      if (editForm.email) updateData.email = editForm.email;
      if (editForm.address) updateData.address = editForm.address;

      await patientService.updatePatient(id, updateData);
      // Refresh patient data
      await fetchPatientData();
      setShowEditModal(false);
      toast.success('Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error(error.userMessage || 'Failed to update patient');
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'in-progress': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading patient data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Patient not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-gray-600 mt-1">
              Patient ID: {patient._id?.slice(-8).toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiEdit2 />
            Edit Patient
          </button>
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus />
            New Session
          </button>
        </div>
      </div>

      {/* Patient Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Personal Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-medium">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Age</label>
              <p className="font-medium">{calculateAge(patient.dateOfBirth)} years</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <p className="font-medium capitalize">{patient.gender || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiPhone className="text-green-600" />
            Contact Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <FiPhone className="w-4 h-4" />
                Phone
              </label>
              <p className="font-medium">{patient.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <FiMail className="w-4 h-4" />
                Email
              </label>
              <p className="font-medium">{patient.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                Address
              </label>
              <p className="font-medium">{patient.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiActivity className="text-red-600" />
            Medical Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p className="font-medium">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {patient.status || 'Active'}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Emergency Contact</label>
              <p className="font-medium">{patient.emergencyContact?.name || 'Not provided'}</p>
              <p className="text-sm text-gray-600">{patient.emergencyContact?.phone || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History */}
      {patient.medicalHistory && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Medical History</h2>
          <div className="space-y-4">
            {patient.medicalHistory.conditions && patient.medicalHistory.conditions.length > 0 && (
              <div>
                <label className="text-sm text-gray-600 font-medium">Conditions</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.medicalHistory.conditions.map((condition, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.medicalHistory.surgeries && patient.medicalHistory.surgeries.length > 0 && (
              <div>
                <label className="text-sm text-gray-600 font-medium">Previous Surgeries</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.medicalHistory.surgeries.map((surgery, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {surgery}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.medicalHistory.medications && patient.medicalHistory.medications.length > 0 && (
              <div>
                <label className="text-sm text-gray-600 font-medium">Current Medications</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.medicalHistory.medications.map((medication, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.medicalHistory.allergies && patient.medicalHistory.allergies.length > 0 && (
              <div>
                <label className="text-sm text-gray-600 font-medium">Allergies</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.medicalHistory.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insurance Information */}
      {patient.insurance && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Insurance Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Provider</label>
              <p className="font-medium">{patient.insurance.provider || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Policy Number</label>
              <p className="font-medium">{patient.insurance.policyNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Group Number</label>
              <p className="font-medium">{patient.insurance.groupNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="card">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FiCalendar />
          Session History ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No sessions recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Diagnosis</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{session.type}</td>
                    <td className="px-4 py-3 text-sm">{session.duration} min</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{session.diagnosis || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Link
                        to={`/sessions/${session._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Patient Information</h2>
              <form onSubmit={handleUpdatePatient}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        preselectedPatientId={id}
        onSessionCreated={(newSession) => {
          fetchPatientData(); // Refresh sessions list
          // Optionally navigate to the new session
          navigate(`/sessions/${newSession._id}`);
        }}
      />
    </div>
  );
};

export default PatientDetail;
