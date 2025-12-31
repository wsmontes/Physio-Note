import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiInfo, FiSearch, FiClock } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import axios from '../../services/axios.config';

const CPTCodeSelector = ({ values = [], onChange, onTimeUpdate }) => {
  const { t } = useTranslation();
  const [cptCodes, setCptCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCodeSelector, setShowCodeSelector] = useState(false);
  const [calculatedUnits, setCalculatedUnits] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const fetchCPTCodes = async () => {
      try {
        const { data } = await axios.get('/reference/cpt-codes');
        setCptCodes(data.codes);
        setCategories(data.categories);
        setFilteredCodes(data.codes.filter(code => code.common));
      } catch (error) {
        console.error('Error fetching CPT codes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCPTCodes();
  }, []);

  useEffect(() => {
    // Filter codes based on category and search
    let filtered = cptCodes;

    if (selectedCategory) {
      filtered = filtered.filter(code => code.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(code => 
        code.code.toLowerCase().includes(query) ||
        code.description.toLowerCase().includes(query)
      );
    } else if (!selectedCategory) {
      // Show only common codes if no filters applied
      filtered = filtered.filter(code => code.common);
    }

    setFilteredCodes(filtered);
  }, [selectedCategory, searchQuery, cptCodes]);

  useEffect(() => {
    // Calculate total minutes and units
    const total = values.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
    setTotalMinutes(total);
    
    if (onTimeUpdate) {
      onTimeUpdate(total);
    }

    // Calculate units using 8-minute rule
    const calculateUnits = async () => {
      try {
        const { data } = await axios.post('/reference/billing/calculate-units', {
          minutes: total
        });
        setCalculatedUnits(data.totalUnits);
      } catch (error) {
        console.error('Error calculating units:', error);
      }
    };

    if (total > 0) {
      calculateUnits();
    } else {
      setCalculatedUnits(0);
    }
  }, [values, onTimeUpdate]);

  const addCPTCode = (code) => {
    const newEntry = {
      code: code.code,
      description: code.description,
      category: code.category,
      minutes: code.timeBased ? 15 : 0,
      units: code.timeBased ? 1 : 1,
      modifiers: [],
      isTimeBased: code.timeBased
    };
    onChange([...values, newEntry]);
    setShowCodeSelector(false);
    setSearchQuery('');
    setSelectedCategory('');
  };

  const updateCPTEntry = (index, field, value) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate units for time-based codes
    if (field === 'minutes' && updated[index].isTimeBased) {
      const minutes = parseInt(value) || 0;
      // Simple approximation: 1 unit per 15 minutes
      updated[index].units = Math.ceil(minutes / 15);
    }
    
    onChange(updated);
  };

  const removeCPTEntry = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const addModifier = (index, modifier) => {
    const updated = [...values];
    if (!updated[index].modifiers.includes(modifier)) {
      updated[index].modifiers = [...updated[index].modifiers, modifier];
      onChange(updated);
    }
  };

  const removeModifier = (index, modifier) => {
    const updated = [...values];
    updated[index].modifiers = updated[index].modifiers.filter(m => m !== modifier);
    onChange(updated);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'evaluation':
        return 'bg-purple-100 text-purple-700';
      case 'therapeutic':
        return 'bg-blue-100 text-blue-700';
      case 'modality':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const commonModifiers = [
    { code: 'GP', description: 'Services delivered under PT plan of care' },
    { code: '59', description: 'Distinct procedural service' },
    { code: 'KX', description: 'Requirements met for medical necessity' },
    { code: '97', description: 'Rehabilitative services' }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading CPT codes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>CPT Codes & Time Tracking</CardTitle>
            <div className="relative group">
              <FiInfo className="text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                Document CPT codes for billing. Time-based codes follow the 8-minute rule for unit calculation.
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowCodeSelector(!showCodeSelector)} 
            size="sm" 
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {showCodeSelector ? 'Cancel' : 'Add Code'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Time Summary */}
        {values.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiClock className="text-blue-600" />
                <span className="font-semibold text-blue-900">Session Time Summary</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <div className="text-xs text-blue-600 mb-1">Total Minutes</div>
                <div className="text-2xl font-bold text-blue-900">{totalMinutes}</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">Calculated Units</div>
                <div className="text-2xl font-bold text-blue-900">{calculatedUnits}</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">Codes Documented</div>
                <div className="text-2xl font-bold text-blue-900">{values.length}</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">8-Minute Rule</div>
                <div className="text-sm text-blue-800 mt-1">Applied ✓</div>
              </div>
            </div>
          </div>
        )}

        {/* Code Selector */}
        {showCodeSelector && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3">Select CPT Code</h4>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Codes
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by code or description..."
                    className="w-full pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Code List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No codes found. Try adjusting your filters.
                </div>
              ) : (
                filteredCodes.map(code => (
                  <div
                    key={code.code}
                    className="border bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-gray-900">{code.code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(code.category)}`}>
                            {code.category}
                          </span>
                          {code.timeBased && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              Time-based
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{code.description}</p>
                      </div>
                      <Button
                        onClick={() => addCPTCode(code)}
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

        {/* Selected Codes */}
        {values.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No CPT codes documented yet.</p>
            <p className="text-sm mt-1">Click "Add Code" to start documenting services.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((entry, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                <button
                  onClick={() => removeCPTEntry(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remove code"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-lg text-gray-900">{entry.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    {entry.isTimeBased && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Time-based
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                </div>

                {entry.isTimeBased && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minutes *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={entry.minutes}
                        onChange={(e) => updateCPTEntry(index, 'minutes', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Units (Auto)
                      </label>
                      <Input
                        type="number"
                        value={entry.units}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>
                  </div>
                )}

                {/* Modifiers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modifiers
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {entry.modifiers.map(modifier => (
                      <span
                        key={modifier}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                      >
                        {modifier}
                        <button
                          onClick={() => removeModifier(index, modifier)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <div className="relative group">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addModifier(index, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 cursor-pointer"
                      >
                        <option value="">+ Add modifier</option>
                        {commonModifiers.map(mod => (
                          <option key={mod.code} value={mod.code} disabled={entry.modifiers.includes(mod.code)}>
                            {mod.code} - {mod.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CPTCodeSelector;
