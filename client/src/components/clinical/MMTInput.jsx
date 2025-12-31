import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import axios from '../../services/axios.config';

const MMTInput = ({ values = [], onChange }) => {
  const { t } = useTranslation();
  const [mmtReference, setMmtReference] = useState({ regions: [], muscleGroups: {}, grades: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMMTReference = async () => {
      try {
        const { data } = await axios.get('/reference/mmt');
        setMmtReference(data);
      } catch (error) {
        console.error('Error fetching MMT reference:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMMTReference();
  }, []);

  const addMMTEntry = () => {
    const newEntry = {
      muscleGroup: '',
      region: '',
      side: 'bilateral',
      grade: '',
      testPosition: 'sitting',
      notes: ''
    };
    onChange([...values, newEntry]);
  };

  const updateMMTEntry = (index, field, value) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeMMTEntry = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const getMusclesForRegion = (region) => {
    if (!region || !mmtReference.muscleGroups[region]) return [];
    return mmtReference.muscleGroups[region];
  };

  const getGradeInfo = (grade) => {
    return mmtReference.grades.find(g => g.value === grade);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-700';
    const numericGrade = parseFloat(grade.replace('+', '.5').replace('-', '.25'));
    
    if (numericGrade >= 4) return 'bg-green-100 text-green-700 border-green-300';
    if (numericGrade >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (numericGrade >= 2) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getStrengthLevel = (grade) => {
    if (!grade) return '';
    const numericGrade = parseFloat(grade.replace('+', '.5').replace('-', '.25'));
    
    if (numericGrade >= 4) return 'Functional';
    if (numericGrade >= 3) return 'Fair';
    if (numericGrade >= 2) return 'Poor';
    return 'Trace/None';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading MMT reference data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Manual Muscle Testing</CardTitle>
            <div className="relative group">
              <FiInfo className="text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                Record muscle strength using the 0-5 MMT scale (Kendall method). Grades are color-coded by functional level.
              </div>
            </div>
          </div>
          <Button onClick={addMMTEntry} size="sm" className="flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add MMT
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {values.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No MMT assessments recorded yet.</p>
            <p className="text-sm mt-1">Click "Add MMT" to start testing muscle strength.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((entry, index) => {
              const muscles = getMusclesForRegion(entry.region);
              const gradeInfo = getGradeInfo(entry.grade);

              return (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <button
                    onClick={() => removeMMTEntry(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Remove entry"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Region Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <select
                        value={entry.region}
                        onChange={(e) => updateMMTEntry(index, 'region', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select region...</option>
                        {mmtReference.regions.map(region => (
                          <option key={region.value} value={region.value}>
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Muscle Group Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Muscle Group *
                      </label>
                      <select
                        value={entry.muscleGroup}
                        onChange={(e) => updateMMTEntry(index, 'muscleGroup', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!entry.region}
                        required
                      >
                        <option value="">Select muscle...</option>
                        {muscles.map(muscle => (
                          <option key={muscle} value={muscle}>
                            {muscle}
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
                        onChange={(e) => updateMMTEntry(index, 'side', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="bilateral">Bilateral</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* MMT Grade Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MMT Grade *
                      </label>
                      <div className="relative">
                        <select
                          value={entry.grade}
                          onChange={(e) => updateMMTEntry(index, 'grade', e.target.value)}
                          className={`w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getGradeColor(entry.grade)}`}
                          required
                        >
                          <option value="">Select grade...</option>
                          {mmtReference.grades.map(grade => (
                            <option key={grade.value} value={grade.value}>
                              {grade.value} - {grade.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {entry.grade && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getGradeColor(entry.grade)}`}>
                            {getStrengthLevel(entry.grade)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Test Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Position
                      </label>
                      <select
                        value={entry.testPosition}
                        onChange={(e) => updateMMTEntry(index, 'testPosition', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="supine">Supine</option>
                        <option value="prone">Prone</option>
                        <option value="sidelying">Sidelying</option>
                        <option value="sitting">Sitting</option>
                        <option value="standing">Standing</option>
                        <option value="gravityEliminated">Gravity Eliminated</option>
                      </select>
                    </div>
                  </div>

                  {/* Grade Description */}
                  {gradeInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-900">Grade {gradeInfo.value}:</span>
                        <span className="ml-2 text-blue-800">{gradeInfo.description}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={entry.notes}
                      onChange={(e) => updateMMTEntry(index, 'notes', e.target.value)}
                      placeholder="Compensations, pain, technique modifications..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MMT Scale Reference */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">MMT Scale Reference</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-red-100 border border-red-300 rounded flex items-center justify-center font-semibold text-red-700">0-2</div>
              <span className="text-gray-600">Trace/Poor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center font-semibold text-yellow-700">3</div>
              <span className="text-gray-600">Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center font-semibold text-green-700">4-5</div>
              <span className="text-gray-600">Functional</span>
            </div>
            <div className="text-gray-500 italic">
              +/- modifiers for fine grading
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MMTInput;
