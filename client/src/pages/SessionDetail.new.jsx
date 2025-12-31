import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSession, useSOAPNote, usePhysioData, useAudioTranscription, usePatient } from '../hooks';
import { LoadingPage } from '../components/ui';
import {
  SessionHeader,
  SOAPNoteEditor,
  PainScaleSection,
  RangeOfMotionSection,
  StrengthTestSection,
  AudioRecorderSection,
  TranscriptionDisplay,
} from '../components/session';

const SessionDetail = () => {
  const { id } = useParams();
  
  // Custom hooks for state management
  const { session, loading, saving, fetchSession, updateSession, setSession } = useSession(id);
  const soap = useSOAPNote();
  const physio = usePhysioData();
  const audio = useAudioTranscription();
  const { patient, fetchPatient, setPatient } = usePatient();

  // Load session data on mount
  useEffect(() => {
    if (id !== 'new') {
      fetchSession();
    }
  }, [id, fetchSession]);

  // Update form when session loads
  useEffect(() => {
    if (session) {
      soap.updateFromSession(session);
      physio.updateFromSession(session);
      
      // Handle patient data
      const patientData = session.patientId || session.patient;
      if (patientData && typeof patientData === 'object' && patientData._id) {
        setPatient(patientData);
      } else if (patientData && typeof patientData === 'string') {
        fetchPatient(patientData);
      }

      // Handle transcription
      const transcription = session.audioTranscription;
      if (transcription && typeof transcription === 'object' && transcription.transcription) {
        audio.setAudioTranscription(String(transcription.transcription));
      } else if (typeof transcription === 'string') {
        audio.setAudioTranscription(transcription);
      }
    }
  }, [session]);

  // Handle audio recording completion
  const handleRecordingComplete = async (audioBlob, duration) => {
    const result = await audio.processRecording(audioBlob, duration);
    
    if (result) {
      // Update SOAP note with AI-generated content
      if (result.soapData) {
        soap.updateFromTranscription(result.soapData);
      }
      
      // Update physio data with extracted information
      if (result.physioData) {
        physio.updateFromAI(result.physioData);
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    const sessionData = {
      ...soap.toSessionData(),
      ...physio.toSessionData(),
      audioTranscription: audio.audioTranscription,
    };

    // Add patient ID if it's a new session
    if (id === 'new' && patient?._id) {
      sessionData.patientId = patient._id;
    }

    await updateSession(sessionData);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SessionHeader
        session={session}
        patient={patient}
        onSave={handleSave}
        saving={saving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <AudioRecorderSection
            onRecordingComplete={handleRecordingComplete}
            isProcessing={audio.isProcessing}
          />

          <TranscriptionDisplay transcription={audio.audioTranscription} />

          <PainScaleSection
            painScale={physio.painScale}
            setPainScale={physio.setPainScale}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SOAPNoteEditor
            subjective={soap.subjective}
            setSubjective={soap.setSubjective}
            objective={soap.objective}
            setObjective={soap.setObjective}
            assessment={soap.assessment}
            setAssessment={soap.setAssessment}
            plan={soap.plan}
            setPlan={soap.setPlan}
          />

          <RangeOfMotionSection
            rangeOfMotion={physio.rangeOfMotion}
            addROMEntry={physio.addROMEntry}
            removeROMEntry={physio.removeROMEntry}
          />

          <StrengthTestSection
            strengthTest={physio.strengthTest}
            addStrengthEntry={physio.addStrengthEntry}
            removeStrengthEntry={physio.removeStrengthEntry}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
