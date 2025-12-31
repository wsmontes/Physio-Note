import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import VoiceRecorder from '../VoiceRecorder';

export function AudioRecorderSection({ onRecordingComplete, isProcessing }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Recording</CardTitle>
      </CardHeader>
      <CardContent>
        <VoiceRecorder
          onRecordingComplete={onRecordingComplete}
          disabled={isProcessing}
        />
        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Processing audio... This may take a moment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TranscriptionDisplay({ transcription }) {
  if (!transcription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
        </div>
      </CardContent>
    </Card>
  );
}
