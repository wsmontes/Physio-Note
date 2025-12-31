import { useState, useEffect } from 'react';
import { FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import axios from '../../services/axios.config';

const EightMinuteRuleCalculator = ({ totalMinutes, claimedUnits }) => {
  const [calculatedUnits, setCalculatedUnits] = useState(0);
  const [ruleBreakdown, setRuleBreakdown] = useState([]);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const calculateUnits = async () => {
      if (totalMinutes === 0) {
        setCalculatedUnits(0);
        setRuleBreakdown([]);
        return;
      }

      try {
        const { data } = await axios.post('/reference/billing/calculate-units', {
          minutes: totalMinutes
        });
        setCalculatedUnits(data.totalUnits);
        setRuleBreakdown(data.breakdown || []);

        // Validate if claimed units match calculated
        if (claimedUnits !== undefined && claimedUnits > 0) {
          const isValid = claimedUnits <= data.totalUnits;
          setValidationResult({
            isValid,
            message: isValid 
              ? 'Units claimed are within acceptable range'
              : `Units claimed (${claimedUnits}) exceed calculated units (${data.totalUnits})`
          });
        }
      } catch (error) {
        console.error('Error calculating units:', error);
      }
    };

    calculateUnits();
  }, [totalMinutes, claimedUnits]);

  const getThresholds = () => [
    { minutes: 8, units: 1, label: '1 unit', color: 'bg-blue-200' },
    { minutes: 23, units: 2, label: '2 units', color: 'bg-blue-300' },
    { minutes: 38, units: 3, label: '3 units', color: 'bg-blue-400' },
    { minutes: 53, units: 4, label: '4 units', color: 'bg-blue-500' },
    { minutes: 68, units: 5, label: '5 units', color: 'bg-blue-600' },
    { minutes: 83, units: 6, label: '6 units', color: 'bg-blue-700' }
  ];

  const getCurrentThreshold = () => {
    const thresholds = getThresholds();
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalMinutes >= thresholds[i].minutes) {
        return thresholds[i];
      }
    }
    return null;
  };

  const getNextThreshold = () => {
    const thresholds = getThresholds();
    for (let i = 0; i < thresholds.length; i++) {
      if (totalMinutes < thresholds[i].minutes) {
        return {
          ...thresholds[i],
          minutesNeeded: thresholds[i].minutes - totalMinutes
        };
      }
    }
    return null;
  };

  const currentThreshold = getCurrentThreshold();
  const nextThreshold = getNextThreshold();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>8-Minute Rule Calculator</CardTitle>
          <div className="relative group">
            <FiInfo className="text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <p className="font-semibold mb-2">CMS 8-Minute Rule</p>
              <p className="mb-2">Medicare billing rule for time-based CPT codes:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>8-22 minutes = 1 unit</li>
                <li>23-37 minutes = 2 units</li>
                <li>38-52 minutes = 3 units</li>
                <li>And so on (each additional 15 minutes = 1 unit)</li>
              </ul>
              <p className="mt-2 italic">Note: Non-time-based codes are billed as 1 unit regardless of time.</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalMinutes === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Add time-based CPT codes to see the 8-minute rule calculation.</p>
            <p className="text-sm mt-1">The calculator will automatically determine billable units.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium mb-1">Total Treatment Time</div>
                  <div className="text-4xl font-bold text-blue-900">{totalMinutes} minutes</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium mb-1">Calculated Units</div>
                  <div className="text-4xl font-bold text-blue-900">{calculatedUnits}</div>
                </div>
              </div>
              
              {currentThreshold && (
                <div className="mt-4 text-sm text-blue-700">
                  Current threshold: <span className="font-semibold">{currentThreshold.minutes}+ minutes = {currentThreshold.units} {currentThreshold.units === 1 ? 'unit' : 'units'}</span>
                </div>
              )}
              
              {nextThreshold && (
                <div className="mt-2 text-sm text-blue-600">
                  Next threshold: Need <span className="font-semibold">{nextThreshold.minutesNeeded} more minutes</span> to reach {nextThreshold.units} {nextThreshold.units === 1 ? 'unit' : 'units'} ({nextThreshold.minutes}+ minutes)
                </div>
              )}
            </div>

            {/* Visual Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Time-to-Units Visualization</h4>
              <div className="relative">
                {/* Timeline bar */}
                <div className="h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                  {getThresholds().map((threshold, index) => {
                    const nextThresholdMin = getThresholds()[index + 1]?.minutes || 100;
                    const width = ((nextThresholdMin - threshold.minutes) / 100) * 100;
                    const isActive = totalMinutes >= threshold.minutes;
                    
                    return (
                      <div
                        key={threshold.minutes}
                        className={`absolute h-full transition-all ${isActive ? threshold.color + ' text-white' : 'bg-gray-200 text-gray-400'}`}
                        style={{
                          left: `${(threshold.minutes / 100) * 100}%`,
                          width: `${width}%`
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-xs font-semibold">
                          {threshold.label}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Current time marker */}
                  <div
                    className="absolute top-0 h-full w-1 bg-red-500"
                    style={{ left: `${Math.min((totalMinutes / 100) * 100, 100)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                      {totalMinutes} min
                    </div>
                  </div>
                </div>

                {/* Threshold markers */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {getThresholds().map(threshold => (
                    <div key={threshold.minutes} className="text-center">
                      <div className="font-semibold">{threshold.minutes}'</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule Explanation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">8-Minute Rule Breakdown</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="grid grid-cols-3 gap-2 font-semibold text-gray-700 pb-2 border-b">
                  <div>Time Range</div>
                  <div>Units</div>
                  <div>Your Time</div>
                </div>
                {[
                  { range: '8-22 min', units: 1 },
                  { range: '23-37 min', units: 2 },
                  { range: '38-52 min', units: 3 },
                  { range: '53-67 min', units: 4 },
                  { range: '68-82 min', units: 5 },
                  { range: '83+ min', units: 6 }
                ].map((rule, index) => {
                  const minTime = index === 0 ? 8 : 8 + (index * 15);
                  const maxTime = minTime + 14;
                  const isActive = totalMinutes >= minTime && (index === 5 || totalMinutes <= maxTime);
                  
                  return (
                    <div key={rule.range} className={`grid grid-cols-3 gap-2 py-1 ${isActive ? 'bg-blue-100 font-semibold text-blue-900 rounded px-2' : ''}`}>
                      <div>{rule.range}</div>
                      <div>{rule.units} {rule.units === 1 ? 'unit' : 'units'}</div>
                      <div>{isActive ? '← You are here' : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Validation Warning/Success */}
            {validationResult && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                validationResult.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                {validationResult.isValid ? (
                  <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                ) : (
                  <FiAlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                )}
                <div>
                  <div className={`font-semibold ${validationResult.isValid ? 'text-green-900' : 'text-yellow-900'}`}>
                    {validationResult.isValid ? 'Billing Validation Passed' : 'Billing Alert'}
                  </div>
                  <div className={`text-sm mt-1 ${validationResult.isValid ? 'text-green-700' : 'text-yellow-800'}`}>
                    {validationResult.message}
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FiInfo className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important Billing Notes:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Only time-based CPT codes follow the 8-minute rule</li>
                    <li>Non-time-based codes (e.g., evaluations) are billed as 1 unit</li>
                    <li>Total treatment time must be documented in session notes</li>
                    <li>Medicare and most insurers require adherence to this rule</li>
                    <li>Always verify with your billing department for specific payer requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EightMinuteRuleCalculator;
