import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import axios from '../../services/axios.config';

const ROMInput = ({ values = [], onChange }) => {
  const { t } = useTranslation();
  const [romReference, setRomReference] = useState({ joints: [], reference: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchROMReference = async () => {
      try {
        const { data } = await axios.get('/reference/rom');
        setRomReference(data);
      } catch (error) {
        console.error('Error fetching ROM reference:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchROMReference();
  }, []);

  const addROMEntry = () => {
    const newEntry = {
      joint: '',
      side: 'bilateral',
      movement: '',
      measurement: 0,
      normalRange: 0,
      painLevel: 0,
      notes: ''
    };
    onChange([...values, newEntry]);
  };

  const updateROMEntry = (index, field, value) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-populate normal range when joint and movement are selected
    if (field === 'joint' || field === 'movement') {
      const joint = field === 'joint' ? value : updated[index].joint;
      const movement = field === 'movement' ? value : updated[index].movement;
      
      if (joint && movement && romReference.reference[joint]?.movements[movement]) {
        updated[index].normalRange = romReference.reference[joint].movements[movement].normal;
      }
    }
    
    onChange(updated);
  };

  const removeROMEntry = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const getMovementsForJoint = (joint) => {
    if (!joint || !romReference.reference[joint]) return [];
    const movements = romReference.reference[joint].movements;
    return Object.keys(movements).map(key => ({
      value: key,
      label: movements[key].label
    }));
  };

  const calculatePercentage = (measured, normal) => {
    if (!normal || normal === 0) return 0;
    return Math.round((measured / normal) * 100);
  };

  const getDeficitColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getDeficitLabel = (percentage) => {
    if (percentage >= 90) return 'WNL';
    if (percentage >= 75) return 'Mild Limitation';
    if (percentage >= 50) return 'Moderate Limitation';
    return 'Severe Limitation';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading ROM reference data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Range of Motion Measurements</CardTitle>
            <div className="relative group">
              <FiInfo className="text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                Record joint ROM measurements. Normal ranges are auto-populated for comparison.
              </div>
            </div>
          </div>
          <Button onClick={addROMEntry} size="sm" className="flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add ROM
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {values.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No ROM measurements recorded yet.</p>
            <p className="text-sm mt-1">Click "Add ROM" to start measuring joint ranges.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((entry, index) => {
              const percentage = calculatePercentage(entry.measurement, entry.normalRange);
              const movements = getMovementsForJoint(entry.joint);

              return (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <button
                    onClick={() => removeROMEntry(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Remove entry"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Joint Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Joint *
                      </label>
                      <select
                        value={entry.joint}
                        onChange={(e) => updateROMEntry(index, 'joint', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select joint...</option>
                        {romReference.joints.map(joint => (
                          <option key={joint.value} value={joint.value}>
                            {joint.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Side Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Side *
                      </label>
                      <select
                        value={entry.side}
                        onChange={(e) => updateROMEntry(index, 'side', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="bilateral">Bilateral</option>
                      </select>
                    </div>

                    {/* Movement Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Movement *
                      </label>
                      <select
                        value={entry.movement}
                        onChange={(e) => updateROMEntry(index, 'movement', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!entry.joint}
                        required
                      >
                        <option value="">Select movement...</option>
                        {movements.map(movement => (
                          <option key={movement.value} value={movement.value}>
                            {movement.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Measurement */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Measured (°) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="360"
                        value={entry.measurement}
                        onChange={(e) => updateROMEntry(index, 'measurement', parseInt(e.target.value) || 0)}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* ROM Analysis */}
                  {entry.normalRange > 0 && entry.measurement > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Normal Range:</span>
                            <span className="ml-2 font-semibold">{entry.normalRange}°</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Measured:</span>
                            <span className="ml-2 font-semibold">{entry.measurement}°</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Percentage:</span>
                            <span className="ml-2 font-semibold">{percentage}%</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDeficitColor(percentage)}`}>
                          {getDeficitLabel(percentage)}
                        </div>
                      </div>
                      
                      {/* Visual Progress Bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 90 ? 'bg-green-500' :
                            percentage >= 75 ? 'bg-yellow-500' :
                            percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pain Level and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pain During Movement (0-10)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="range"
                          min="0"
                          max="10"
                          value={entry.painLevel}
                          onChange={(e) => updateROMEntry(index, 'painLevel', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-lg font-semibold w-8 text-center">{entry.painLevel}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <Input
                        type="text"
                        value={entry.notes}
                        onChange={(e) => updateROMEntry(index, 'notes', e.target.value)}
                        placeholder="End feel, compensations, etc."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ROMInput;
