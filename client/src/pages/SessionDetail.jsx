import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import VoiceRecorder from '../components/VoiceRecorder';
import sessionService from '../services/session.service';
import patientService from '../services/patient.service';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // SOAP Note sections
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Physiotherapy specific data
  const [painScale, setPainScale] = useState({ current: 0, best: 0, worst: 0, location: '' });
  const [rangeOfMotion, setRangeOfMotion] = useState([]);
  const [strengthTest, setStrengthTest] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [modalitiesUsed, setModalitiesUsed] = useState([]);
  const [billingCodes, setBillingCodes] = useState([]);
  const [audioTranscription, setAudioTranscription] = useState('');

  useEffect(() => {
    // Don't try to fetch if this is a new session
    if (id !== 'new') {
      fetchSessionData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const sessionData = await sessionService.getSession(id);
      setSession(sessionData);

      // Load patient data - handle both populated object and ID reference
      let patientData = sessionData.patientId || sessionData.patient;
      
      // If patientData is an object (populated), use it directly
      if (patientData && typeof patientData === 'object' && patientData._id) {
        setPatient(patientData); // Already have the patient data
      } else if (patientData && typeof patientData === 'string') {
        // Patient is just an ID, need to fetch
        const fetchedPatient = await patientService.getPatient(patientData);
        setPatient(fetchedPatient);
      }

      // Populate form fields
      setSubjective(sessionData.subjective || '');
      setObjective(sessionData.objective || '');
      setAssessment(sessionData.assessment || '');
      setPlan(sessionData.plan || '');
      setPainScale(sessionData.painScale || { current: 0, best: 0, worst: 0, location: '' });
      setRangeOfMotion(sessionData.rangeOfMotion || []);
      setStrengthTest(sessionData.strengthTest || []);
      setExercises(sessionData.exercises || []);
      setModalitiesUsed(sessionData.modalitiesUsed || []);
      setBillingCodes(sessionData.billingCodes || []);
      
      // Handle audioTranscription - it might be an object or string
      const transcription = sessionData.audioTranscription;
      if (transcription && typeof transcription === 'object' && transcription.transcription) {
        setAudioTranscription(String(transcription.transcription));
      } else if (typeof transcription === 'string') {
        setAudioTranscription(transcription);
      } else {
        setAudioTranscription('');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error(error.userMessage || 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (audioBlob, duration) => {
    try {
      setAiLoading(true);
      
      // Transcribe audio
      const result = await aiService.transcribeAudio(audioBlob, duration);
      const transcriptionText = (typeof result === 'object' && result.transcription) 
        ? String(result.transcription) 
        : (typeof result === 'string' ? result : '');
      
      console.log('Transcription result:', result);
      console.log('Transcription text:', transcriptionText);
      
      setAudioTranscription(transcriptionText);

      // Only generate SOAP note if we have transcription text
      if (!transcriptionText || transcriptionText.trim() === '') {
        toast.error('No transcription text received. Please check your OpenAI API key configuration.');
        return;
      }

      // Generate SOAP note from transcription
      const context = {
        patientName: patient?.name || '',
        diagnosis: session?.diagnosis || '',
        previousNotes: session?.subjective || ''
      };
      
      const response = await aiService.generateNote(transcriptionText, context, 'soap');
      console.log('SOAP note response:', response);
      console.log('Note object:', response.note);
      console.log('Note content:', response.note?.content);
      
      // Extract SOAP sections from the response
      const soapNote = response.note?.content || response.content || response;
      console.log('Extracted SOAP note:', soapNote);
      console.log('Subjective:', soapNote.subjective);
      console.log('Objective:', soapNote.objective);
      console.log('Assessment:', soapNote.assessment);
      console.log('Plan:', soapNote.plan);
      
      if (soapNote.subjective) setSubjective(soapNote.subjective.trim());
      if (soapNote.objective) setObjective(soapNote.objective.trim());
      if (soapNote.assessment) setAssessment(soapNote.assessment.trim());
      if (soapNote.plan) setPlan(soapNote.plan.trim());

      toast.success('SOAP note generated successfully!');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(error.userMessage || 'Failed to process audio');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateExercises = async () => {
    try {
      setAiLoading(true);
      const context = {
        diagnosis: session?.diagnosis || assessment,
        currentExercises: exercises,
        patientAge: patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : null
      };
      
      const exerciseProgram = await aiService.generateExerciseProgram(context);
      setExercises(exerciseProgram.exercises || []);
      toast.success('Exercise program generated!');
    } catch (error) {
      console.error('Error generating exercises:', error);
      toast.error(error.userMessage || 'Failed to generate exercises');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSuggestBillingCodes = async () => {
    try {
      setAiLoading(true);
      const context = {
        treatments: modalitiesUsed,
        sessionType: session?.type || 'follow-up',
        duration: session?.duration || 60,
        procedures: objective
      };
      
      const codes = await aiService.suggestBillingCodes(context);
      setBillingCodes(codes.codes || []);
      toast.success('Billing codes suggested!');
    } catch (error) {
      console.error('Error suggesting codes:', error);
      toast.error(error.userMessage || 'Failed to suggest billing codes');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveSession = async () => {
    try {
      setSaving(true);
      
      const updatedSession = {
        subjective,
        objective,
        assessment,
        plan,
        painScale,
        rangeOfMotion,
        strengthTest,
        exercises,
        modalitiesUsed,
        billingCodes,
        audioTranscription: typeof audioTranscription === 'string' ? audioTranscription : String(audioTranscription || ''),
        status: 'completed'
      };

      await sessionService.updateSession(id, updatedSession);
      toast.success('Session saved successfully!');
      navigate('/sessions');
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error(error.userMessage || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const addROMEntry = () => {
    setRangeOfMotion([...rangeOfMotion, { joint: '', movement: '', measurement: '' }]);
  };

  const addStrengthEntry = () => {
    setStrengthTest([...strengthTest, { muscle: '', grade: '', notes: '' }]);
  };

  const addExercise = () => {
    setExercises([...exercises, { type: '', sets: 3, reps: 10, instructions: '', homeProgram: false }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading session...</div>
      </div>
    );
  }

  if (!session || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Session not found</div>
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
            <h1 className="text-3xl font-bold">Session Documentation</h1>
            <p className="text-gray-600 mt-1">
              <FiUser className="inline mr-2" />
              {patient.name} • {new Date(session.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveSession}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <FiSave />
          {saving ? 'Saving...' : 'Save Session'}
        </button>
      </div>

      {/* Voice Recorder Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Voice Recording</h2>
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        {aiLoading && (
          <div className="mt-4 text-center text-blue-600">
            <FiActivity className="inline animate-spin mr-2" />
            Processing audio and generating SOAP note...
          </div>
        )}
        {audioTranscription && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Transcription:</h3>
            <p className="text-gray-700">{String(audioTranscription)}</p>
          </div>
        )}
      </div>

      {/* SOAP Note Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Subjective</h2>
          <textarea
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Patient's complaints, symptoms, history..."
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Objective</h2>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observations, measurements, test results..."
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Assessment</h2>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Clinical interpretation, diagnosis, progress..."
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Plan</h2>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Treatment plan, goals, next steps..."
          />
        </div>
      </div>

      {/* Pain Scale */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Pain Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Pain (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={painScale.current}
              onChange={(e) => setPainScale({ ...painScale, current: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Best Pain (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={painScale.best}
              onChange={(e) => setPainScale({ ...painScale, best: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Worst Pain (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={painScale.worst}
              onChange={(e) => setPainScale({ ...painScale, worst: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={painScale.location}
              onChange={(e) => setPainScale({ ...painScale, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Lower back, Right knee"
            />
          </div>
        </div>
      </div>

      {/* Range of Motion */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Range of Motion</h2>
          <button onClick={addROMEntry} className="btn-secondary">
            + Add ROM Test
          </button>
        </div>
        {rangeOfMotion.map((rom, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Joint (e.g., Right Shoulder)"
              value={rom.joint}
              onChange={(e) => {
                const updated = [...rangeOfMotion];
                updated[index].joint = e.target.value;
                setRangeOfMotion(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Movement (e.g., Flexion)"
              value={rom.movement}
              onChange={(e) => {
                const updated = [...rangeOfMotion];
                updated[index].movement = e.target.value;
                setRangeOfMotion(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Measurement (e.g., 120°)"
              value={rom.measurement}
              onChange={(e) => {
                const updated = [...rangeOfMotion];
                updated[index].measurement = e.target.value;
                setRangeOfMotion(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Strength Testing */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Strength Testing</h2>
          <button onClick={addStrengthEntry} className="btn-secondary">
            + Add Strength Test
          </button>
        </div>
        {strengthTest.map((test, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Muscle Group"
              value={test.muscle}
              onChange={(e) => {
                const updated = [...strengthTest];
                updated[index].muscle = e.target.value;
                setStrengthTest(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={test.grade}
              onChange={(e) => {
                const updated = [...strengthTest];
                updated[index].grade = e.target.value;
                setStrengthTest(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Grade</option>
              <option value="5/5">5/5 - Normal</option>
              <option value="4/5">4/5 - Good</option>
              <option value="3/5">3/5 - Fair</option>
              <option value="2/5">2/5 - Poor</option>
              <option value="1/5">1/5 - Trace</option>
              <option value="0/5">0/5 - Zero</option>
            </select>
            <input
              type="text"
              placeholder="Notes"
              value={test.notes}
              onChange={(e) => {
                const updated = [...strengthTest];
                updated[index].notes = e.target.value;
                setStrengthTest(updated);
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Exercise Prescription */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Exercise Prescription</h2>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateExercises}
              disabled={aiLoading}
              className="btn-secondary"
            >
              🤖 AI Generate
            </button>
            <button onClick={addExercise} className="btn-secondary">
              + Add Exercise
            </button>
          </div>
        </div>
        {exercises.map((exercise, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <input
                type="text"
                placeholder="Exercise Name"
                value={exercise.type}
                onChange={(e) => {
                  const updated = [...exercises];
                  updated[index].type = e.target.value;
                  setExercises(updated);
                }}
                className="p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Sets"
                value={exercise.sets}
                onChange={(e) => {
                  const updated = [...exercises];
                  updated[index].sets = parseInt(e.target.value);
                  setExercises(updated);
                }}
                className="p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Reps"
                value={exercise.reps}
                onChange={(e) => {
                  const updated = [...exercises];
                  updated[index].reps = parseInt(e.target.value);
                  setExercises(updated);
                }}
                className="p-2 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  checked={exercise.homeProgram}
                  onChange={(e) => {
                    const updated = [...exercises];
                    updated[index].homeProgram = e.target.checked;
                    setExercises(updated);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Home Program</span>
              </label>
            </div>
            <textarea
              placeholder="Instructions..."
              value={exercise.instructions}
              onChange={(e) => {
                const updated = [...exercises];
                updated[index].instructions = e.target.value;
                setExercises(updated);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="2"
            />
          </div>
        ))}
      </div>

      {/* Modalities Used */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Modalities Used</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Ultrasound', 'TENS', 'Heat', 'Ice', 'Manual Therapy', 'Dry Needling', 'Cupping', 'Taping'].map((modality) => (
            <label key={modality} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={modalitiesUsed.includes(modality)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setModalitiesUsed([...modalitiesUsed, modality]);
                  } else {
                    setModalitiesUsed(modalitiesUsed.filter(m => m !== modality));
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{modality}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Billing Codes */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Billing Codes</h2>
          <button
            onClick={handleSuggestBillingCodes}
            disabled={aiLoading}
            className="btn-secondary"
          >
            🤖 AI Suggest Codes
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {billingCodes.map((code, index) => (
            <div key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              {code}
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add billing code (e.g., 97110)"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              setBillingCodes([...billingCodes, e.target.value.trim()]);
              e.target.value = '';
            }
          }}
          className="w-full p-2 border border-gray-300 rounded-lg mt-3"
        />
      </div>

      {/* Save Button Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-8">
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSession}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
