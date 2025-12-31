import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSave, FiArrowLeft, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import VoiceRecorder from '../components/VoiceRecorder';
import sessionService from '../services/session.service';
import patientService from '../services/patient.service';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import { useTemplates } from '../hooks';
import { ROMInput, MMTInput, SpecialTestsInput, EvidencePanel } from '../components/clinical';
import { CPTCodeSelector, EightMinuteRuleCalculator, ICD10Search } from '../components/billing';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Template selection
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
  
  // New clinical measurement fields (Sprint 4)
  const [muscleStrength, setMuscleStrength] = useState([]);
  const [specialTests, setSpecialTests] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [cptCodes, setCptCodes] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  
  // AI Agent metadata (Phase 1)
  const [exerciseMetadata, setExerciseMetadata] = useState(null);

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
      
      // New clinical measurement fields
      setMuscleStrength(sessionData.muscleStrength || []);
      setSpecialTests(sessionData.specialTests || []);
      setDiagnoses(sessionData.billing?.diagnoses || []);
      setCptCodes(sessionData.billing?.cptCodes || []);
      setTotalMinutes(sessionData.billing?.totalMinutes || 0);
      
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

      // Use selected template instructions if available
      const templateInstructions = selectedTemplate?.promptInstructions || 'soap';
      
      const response = await aiService.generateNote(transcriptionText, context, templateInstructions);
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

  cons
      // Prepare context for AI agent
      const context = {
        patientId: session?.patient,
        diagnosis: diagnoses.find(d => d.isPrimary)?.description || session?.chiefComplaint || assessment,
        impairments: [
          ...rangeOfMotion.map(rom => `${rom.joint} ROM deficit: ${rom.deficit}%`),
          ...muscleStrength.filter(mmt => mmt.grade < 4).map(mmt => `${mmt.muscle} weakness: Grade ${mmt.grade}`),
          ...specialTests.filter(test => test.result === 'positive').map(test => `Positive ${test.name}`)
        ],
        goals: plan || 'Improve function and reduce pain',
        sessionData: {
          affectedJoint: rangeOfMotion[0]?.joint,
          currentFunctionLevel: assessment
        }
      };
      
      // Use agent-based generation with evidence
      const result = await aiService.generateExerciseProgramAgent(context);
      
      // Set exercises and metadata
      setExercises(result.exercises || []);
      setExerciseMetadata(result.metadata);
      
      toast.success(`Exercise program generated with ${result.metadata?.evidenceSources?.length || 0} evidence sources!`
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
        // New clinical measurement fields
        muscleStrength,
        specialTests,
        billing: {
          diagnoses,
          cptCodes,
          totalMinutes,
          totalUnits: cptCodes.reduce((sum, code) => sum + (code.units || 0), 0),
          evaluationType: cptCodes.find(c => c.category === 'evaluation')?.code || null
        },
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
        <div className="text-lg text-gray-600">{t('sessionDetail.loadingSession')}</div>
      </div>
    );
  }

  if (!session || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('sessionDetail.sessionNotFound')}</div>
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
            <h1 className="text-3xl font-bold">{t('sessionDetail.title')}</h1>
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
          {saving ? t('status.saving') : t('sessionDetail.saveSession')}
        </button>
      </div>

      {/* Template Selector */}
      {!templatesLoading && templates.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('templates.title')}
            </label>
            <select
              value={selectedTemplate?._id || ''}
              onChange={(e) => {
                const template = templates.find(t => t._id === e.target.value);
                setSelectedTemplate(template || null);
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('templates.fields.type')} - Default SOAP</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} ({t(`templates.specialties.${template.specialty}`)})
                </option>
              ))}
            </select>
          </div>
          {selectedTemplate?.description && (
            <p className="text-sm text-gray-600 mt-2">{selectedTemplate.description}</p>
          )}
        </div>
      )}

      {/* Voice Recorder Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('sessionDetail.voiceRecording')}</h2>
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        {aiLoading && (
          <div className="mt-4 text-center text-blue-600">
            <FiActivity className="inline animate-spin mr-2" />
            {t('sessionDetail.processingAudio')}
          </div>
        )}
        {audioTranscription && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('sessionDetail.transcription')}</h3>
            <p className="text-gray-700">{String(audioTranscription)}</p>
          </div>
        )}
      </div>

      {/* SOAP Note Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('soap.subjective')}</h2>
          <textarea
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('soap.placeholders.subjective')}
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('soap.objective')}</h2>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('soap.placeholders.objective')}
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('soap.assessment')}</h2>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('soap.placeholders.assessment')}
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('soap.plan')}</h2>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('soap.placeholders.plan')}
          />
        </div>
      </div>

      {/* Pain Scale */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('sessionDetail.painAssessment')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('physio.painFields.current')} (0-10)</label>
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
            <label className="block text-sm font-medium mb-2">{t('physio.painFields.best')} (0-10)</label>
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
            <label className="block text-sm font-medium mb-2">{t('physio.painFields.worst')} (0-10)</label>
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
            <label className="block text-sm font-medium mb-2">{t('physio.painFields.location')}</label>
            <input
              type="text"
              value={painScale.location}
              onChange={(e) => setPainScale({ ...painScale, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder={t('sessionDetail.placeholders.painLocation')}
            />
          </div>
        </div>
      </div>

      {/* Clinical Measurements Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Clinical Measurements</h2>
        <div className="space-y-6">
          {/* Range of Motion - New Component */}
          <ROMInput values={rangeOfMotion} onChange={setRangeOfMotion} />
          
          {/* Manual Muscle Testing - New Component */}
          <MMTInput values={muscleStrength} onChange={setMuscleStrength} />
          
          {/* Special Tests - New Component */}
          <SpecialTestsInput values={specialTests} onChange={setSpecialTests} />
        </div>
      </div>



      {/* Exercise Prescription */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('sessionDetail.exercisePrescription')}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateExercises}
              disabled={aiLoading}
              className="btn-secondary"
            >
              {t('sessionDetail.aiGenerate')}
            </button>
            <button onClick={addExercise} className="btn-secondary">
              {t('sessionDetail.addExercise')}
            </button>
          </div>
        </div>
        {exercises.map((exercise, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <input
                type="text"
                placeholder={t('sessionDetail.placeholders.exerciseName')}
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
                placeholder={t('sessionDetail.placeholders.sets')}
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
                placeholder={t('sessionDetail.placeholders.reps')}
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
                <span className="text-sm">{t('sessionDetail.homeProgram')}</span>
              </label>
            </div>
            <textarea
              placeholder={t('sessionDetail.placeholders.instructions')}
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
        
        {/* Evidence Panel - Show research sources for AI-generated exercises */}
        {exerciseMetadata && exerciseMetadata.evidenceSources && exerciseMetadata.evidenceSources.length > 0 && (
          <EvidencePanel metadata={exerciseMetadata} />
        )}
      </div>

      {/* Modalities Used */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('sessionDetail.modalitiesUsed')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'ultrasound', label: t('sessionDetail.modalities.ultrasound') },
            { key: 'tens', label: t('sessionDetail.modalities.tens') },
            { key: 'heat', label: t('sessionDetail.modalities.heat') },
            { key: 'ice', label: t('sessionDetail.modalities.ice') },
            { key: 'manualTherapy', label: t('sessionDetail.modalities.manualTherapy') },
            { key: 'dryNeedling', label: t('sessionDetail.modalities.dryNeedling') },
            { key: 'cupping', label: t('sessionDetail.modalities.cupping') },
            { key: 'taping', label: t('sessionDetail.modalities.taping') }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={modalitiesUsed.includes(label)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setModalitiesUsed([...modalitiesUsed, label]);
                  } else {
                    setModalitiesUsed(modalitiesUsed.filter(m => m !== label));
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Billing & Documentation Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Billing & Documentation</h2>
        <div className="space-y-6">
          {/* ICD-10 Diagnoses - New Component */}
          <ICD10Search values={diagnoses} onChange={setDiagnoses} />
          
          {/* CPT Codes & Time Tracking - New Component */}
          <CPTCodeSelector 
            values={cptCodes} 
            onChange={setCptCodes}
            onTimeUpdate={setTotalMinutes}
          />
          
          {/* 8-Minute Rule Calculator - New Component */}
          <EightMinuteRuleCalculator 
            totalMinutes={totalMinutes}
            claimedUnits={cptCodes.reduce((sum, code) => sum + (code.units || 0), 0)}
          />
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-8">
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={handleSaveSession}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <FiSave />
            {saving ? t('status.saving') : t('sessionDetail.saveSession')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
