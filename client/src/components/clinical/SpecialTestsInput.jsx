import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiInfo, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import axios from '../../services/axios.config';

const SpecialTestsInput = ({ values = [], onChange }) => {
  const { t } = useTranslation();
  const [testLibrary, setTestLibrary] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [bodyRegions, setBodyRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTestSelector, setShowTestSelector] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);

  useEffect(() => {
    const fetchTestLibrary = async () => {
      try {
        const { data } = await axios.get('/reference/special-tests');
        setTestLibrary(data.tests);
        setBodyRegions(data.bodyRegions);
        setFilteredTests(data.tests);
      } catch (error) {
        console.error('Error fetching special tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestLibrary();
  }, []);

  useEffect(() => {
    // Filter tests based on region and search
    let filtered = testLibrary;

    if (selectedRegion) {
      filtered = filtered.filter(test => test.bodyRegion === selectedRegion);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(query) ||
        test.purpose.toLowerCase().includes(query) ||
        test.indicates?.toLowerCase().includes(query)
      );
    }

    setFilteredTests(filtered);
  }, [selectedRegion, searchQuery, testLibrary]);

  const addTestResult = (test) => {
    const newEntry = {
      testId: test.id,
      testName: test.name,
      bodyRegion: test.bodyRegion,
      side: 'bilateral',
      result: '',
      findings: '',
      clinicalRelevance: test.indicates || '',
      sensitivity: test.sensitivity,
      specificity: test.specificity
    };
    onChange([...values, newEntry]);
    setShowTestSelector(false);
    setSearchQuery('');
    setSelectedRegion('');
  };

  const updateTestResult = (index, field, value) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeTestResult = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const showTestDetails = (test) => {
    setSelectedTestDetail(test);
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'positive':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'negative':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'positive':
        return '⊕';
      case 'negative':
        return '⊖';
      case 'inconclusive':
        return '?';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading special tests library...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Special Tests</CardTitle>
            <div className="relative group">
              <FiInfo className="text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                Record results from orthopedic special tests. Select from the evidence-based test library with sensitivity/specificity data.
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowTestSelector(!showTestSelector)} 
            size="sm" 
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {showTestSelector ? 'Cancel' : 'Add Test'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Test Selector */}
        {showTestSelector && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3">Select Test from Library</h4>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Regions</option>
                  {bodyRegions.map(region => (
                    <option key={region} value={region}>
                      {region.charAt(0).toUpperCase() + region.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tests
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or condition..."
                    className="w-full pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Test List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredTests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tests found. Try adjusting your filters.
                </div>
              ) : (
                filteredTests.map(test => (
                  <div
                    key={test.id}
                    className="border bg-white rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => showTestDetails(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{test.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{test.purpose}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {test.bodyRegion}
                          </span>
                          {test.sensitivity && (
                            <span>Sens: {test.sensitivity}</span>
                          )}
                          {test.specificity && (
                            <span>Spec: {test.specificity}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addTestResult(test);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Test Detail Modal */}
        {selectedTestDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedTestDetail.name}</h3>
                    <span className="inline-block mt-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                      {selectedTestDetail.bodyRegion}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTestDetail(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Purpose</h4>
                    <p className="text-gray-600">{selectedTestDetail.purpose}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Procedure</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedTestDetail.procedure}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Positive Findings</h4>
                    <p className="text-gray-600">{selectedTestDetail.positiveFindings}</p>
                  </div>

                  {selectedTestDetail.indicates && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">Clinical Significance</h4>
                          <p className="text-yellow-800 text-sm">{selectedTestDetail.indicates}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedTestDetail.sensitivity || selectedTestDetail.specificity) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTestDetail.sensitivity && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Sensitivity</div>
                          <div className="text-2xl font-bold text-gray-900">{selectedTestDetail.sensitivity}</div>
                          <div className="text-xs text-gray-500 mt-1">True positive rate</div>
                        </div>
                      )}
                      {selectedTestDetail.specificity && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Specificity</div>
                          <div className="text-2xl font-bold text-gray-900">{selectedTestDetail.specificity}</div>
                          <div className="text-xs text-gray-500 mt-1">True negative rate</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      addTestResult(selectedTestDetail);
                      setSelectedTestDetail(null);
                    }}
                    className="flex-1"
                  >
                    Add to Assessment
                  </Button>
                  <Button
                    onClick={() => setSelectedTestDetail(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recorded Tests */}
        {values.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No special tests performed yet.</p>
            <p className="text-sm mt-1">Click "Add Test" to select from the test library.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((entry, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                <button
                  onClick={() => removeTestResult(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remove test"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                <div className="pr-8">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.testName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {entry.bodyRegion}
                        </span>
                        {entry.sensitivity && (
                          <span className="text-xs text-gray-500">Sens: {entry.sensitivity}</span>
                        )}
                        {entry.specificity && (
                          <span className="text-xs text-gray-500">Spec: {entry.specificity}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {entry.clinicalRelevance && (
                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                      <span className="font-semibold">Indicates:</span> {entry.clinicalRelevance}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Side *
                    </label>
                    <select
                      value={entry.side}
                      onChange={(e) => updateTestResult(index, 'side', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="bilateral">Bilateral</option>
                    </select>
                  </div>

                  {/* Result */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Result *
                    </label>
                    <select
                      value={entry.result}
                      onChange={(e) => updateTestResult(index, 'result', e.target.value)}
                      className={`w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${getResultColor(entry.result)}`}
                      required
                    >
                      <option value="">Select result...</option>
                      <option value="positive">⊕ Positive</option>
                      <option value="negative">⊖ Negative</option>
                      <option value="inconclusive">? Inconclusive</option>
                    </select>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Findings & Observations
                  </label>
                  <textarea
                    value={entry.findings}
                    onChange={(e) => updateTestResult(index, 'findings', e.target.value)}
                    placeholder="Describe what you observed during the test..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Result Summary Badge */}
                {entry.result && (
                  <div className={`flex items-center gap-2 p-2 rounded border-2 ${getResultColor(entry.result)}`}>
                    <span className="text-2xl">{getResultIcon(entry.result)}</span>
                    <span className="font-semibold">
                      {entry.result.charAt(0).toUpperCase() + entry.result.slice(1)} Test Result
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecialTestsInput;
