import { FiArrowLeft, FiUser, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { formatDate } from '../../lib/utils';

export function SessionHeader({ session, patient, onSave, saving }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session ? 'Edit Session' : 'New Session'}
          </h1>
          {patient && (
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FiUser className="h-4 w-4" />
                <span>{patient.firstName} {patient.lastName}</span>
              </div>
              {session?.date && (
                <div className="flex items-center gap-1">
                  <FiClock className="h-4 w-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onSave}
        loading={saving}
        size="lg"
      >
        Save Session
      </Button>
    </div>
  );
}
