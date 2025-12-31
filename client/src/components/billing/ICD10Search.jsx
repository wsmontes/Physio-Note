import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiInfo, FiSearch, FiStar } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import axios from '../../services/axios.config';

const ICD10Search = ({ values = [], onChange }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [commonCodes, setCommonCodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchCommonCodes = async () => {
      try {
        const { data } = await axios.get('/reference/icd10-codes?common=true');
        setCommonCodes(data.codes);
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching ICD-10 codes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommonCodes();
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('category', selectedCategory);

        const { data } = await axios.get(`/reference/icd10-codes?${params.toString()}`);
        setSearchResults(data.codes);
      } catch (error) {
        console.error('Error searching ICD-10 codes:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory]);

  const addDiagnosis = (code) => {
    // Check if already added
    if (values.some(v => v.icd10Code === code.code)) {
      return;
    }

    const newEntry = {
      icd10Code: code.code,
      description: code.description,
      category: code.category,
      isPrimary: values.length === 0, // First diagnosis is primary by default
      onset: '',
      status: 'acute'
    };
    onChange([...values, newEntry]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateDiagnosis = (index, field, value) => {
    const updated = [...values];
    
    // If setting as primary, unset all others
    if (field === 'isPrimary' && value === true) {
      updated.forEach((_, i) => {
        updated[i].isPrimary = i === index;
      });
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    onChange(updated);
  };

  const removeDiagnosis = (index) => {
    const updated = values.filter((_, i) => i !== index);
    
    // If removing primary diagnosis, make first one primary
    if (values[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    
    onChange(updated);
  };

  const getCategoryColor = (category) => {
    const colors = {
      shoulder: 'bg-blue-100 text-blue-700',
      knee: 'bg-green-100 text-green-700',
      spine: 'bg-purple-100 text-purple-700',
      ankle: 'bg-orange-100 text-orange-700',
      hip: 'bg-pink-100 text-pink-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading ICD-10 codes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Diagnoses (ICD-10)</CardTitle>
            <div className="relative group">
              <FiInfo className="text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                Document patient diagnoses using ICD-10-CM codes. Mark one diagnosis as primary for billing.
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowSearch(!showSearch)} 
            size="sm" 
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {showSearch ? 'Cancel' : 'Add Diagnosis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Interface */}
        {showSearch && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3">Search ICD-10 Codes</h4>
            
            {/* Search Box */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by condition, symptom, or code
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., shoulder pain, M25.511, rotator cuff..."
                  className="w-full pl-10"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by body region
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                </h5>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.length === 0 && !searching && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No codes found. Try a different search term.
                    </div>
                  )}
                  {searchResults.map(code => (
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
                          </div>
                          <p className="text-sm text-gray-600">{code.description}</p>
                        </div>
                        <Button
                          onClick={() => addDiagnosis(code)}
                          size="sm"
                          variant="outline"
                          disabled={values.some(v => v.icd10Code === code.code)}
                        >
                          {values.some(v => v.icd10Code === code.code) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Codes Quick Select */}
            {searchQuery.trim().length < 2 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiStar className="text-yellow-500" />
                  Common PT Diagnoses
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonCodes.slice(0, 10).map(code => (
                    <button
                      key={code.code}
                      onClick={() => addDiagnosis(code)}
                      disabled={values.some(v => v.icd10Code === code.code)}
                      className="text-left border bg-white rounded-lg p-2 hover:shadow-md transition-shadow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-mono font-semibold text-gray-900">{code.code}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{code.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diagnosis List */}
        {values.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No diagnoses documented yet.</p>
            <p className="text-sm mt-1">Click "Add Diagnosis" to search and add ICD-10 codes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((entry, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 space-y-3 relative ${entry.isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                {entry.isPrimary && (
                  <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FiStar className="w-3 h-3" />
                    PRIMARY DIAGNOSIS
                  </div>
                )}

                <button
                  onClick={() => removeDiagnosis(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remove diagnosis"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                <div className="pr-8 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-lg text-gray-900">{entry.icd10Code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{entry.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Primary Diagnosis Checkbox */}
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.isPrimary}
                        onChange={(e) => updateDiagnosis(index, 'isPrimary', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Primary Diagnosis</span>
                    </label>
                  </div>

                  {/* Onset Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onset Date
                    </label>
                    <Input
                      type="date"
                      value={entry.onset}
                      onChange={(e) => updateDiagnosis(index, 'onset', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={entry.status}
                      onChange={(e) => updateDiagnosis(index, 'status', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="acute">Acute</option>
                      <option value="chronic">Chronic</option>
                      <option value="resolving">Resolving</option>
                      <option value="stable">Stable</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Billing Note */}
        {values.length > 0 && !values.some(v => v.isPrimary) && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <FiInfo className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <span className="font-semibold">Reminder:</span> Please mark one diagnosis as primary for billing purposes.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ICD10Search;
