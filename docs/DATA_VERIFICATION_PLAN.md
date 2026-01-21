# Clinical Data Verification & API Integration Plan

## Current Status: Manual Data Entry with Source Attribution

All our clinical reference data is currently **manually entered** with source citations. This approach works but has limitations:
- ❌ Data can become outdated
- ❌ No automatic updates when standards change
- ❌ Manual verification required
- ❌ Limited to what we can manually research

## Goal: API-First Approach with Verified Fallbacks

**Strategy:** Use official APIs where available, maintain verified local data as fallback

---

## 1. ICD-10 Codes - API Integration Available ✅

### Current Implementation
- File: `server/src/data/icd10-codes.js`
- Source: WHO ICD-10-CM 2025
- Method: Manual entry of 60+ common codes
- Status: ⚠️ Manual, needs API integration

### Available API
- **WHO ICD-11 API**: https://icd.who.int/icdapi
- **Access**: Free with API key (registration required)
- **Benefits**: 
  - Official WHO data
  - Always up-to-date
  - Full code set (not just subset)
  - Multi-language support
  - Code hierarchies and relationships

### Implementation Plan
```javascript
// New service: server/src/services/icd-api.service.js
- Register for WHO ICD API token
- Create search endpoint that queries WHO API
- Cache results in MongoDB for performance
- Fallback to local data if API unavailable
- Auto-refresh cache quarterly
```

**Priority:** HIGH - Official API available
**Effort:** 3-4 days
**Impact:** Always up-to-date diagnosis codes

---

## 2. CPT Codes - Proprietary (Limited Options) ⚠️

### Current Implementation
- File: `server/src/data/cpt-codes.js`
- Source: AMA CPT® 2025
- Method: Manual entry of common PT codes
- Status: ⚠️ Proprietary, requires license

### Available Options
- **AMA CPT API**: Exists but requires paid license ($200-500+/year)
- **CMS HCPCS**: Free but less detailed than CPT
- **Current approach**: Subset with disclaimer (legally acceptable for reference)

### Recommendation
```javascript
// Keep current approach but enhance verification
- Add annual verification process against AMA publications
- Document exact source (CPT® 2025 code book)
- Consider CMS HCPCS API as free alternative for basic codes
- For production, recommend users obtain AMA license
```

**Priority:** MEDIUM - Current approach legally acceptable
**Effort:** 1-2 days for verification process
**Impact:** Legal compliance, user transparency

---

## 3. ROM Standards - Verify Against AAOS Publications ✅

### Current Implementation
- File: `server/src/data/rom-reference.js`
- Source: AAOS (American Academy of Orthopedic Surgeons)
- Method: Manual entry from published standards
- Status: ✅ Accurate but should verify against latest publications

### Available Resources
- **AAOS Publications**: Clinical practice guidelines (PDF/web)
- **PubMed**: Research articles with ROM normative data
- **No direct API**: AAOS doesn't provide ROM API

### Verification Plan
```javascript
// Create verification script
1. Cross-reference against AAOS Clinical Practice Guidelines
2. Check PubMed for recent normative data studies
3. Document specific sources for each joint
4. Add references array to each measurement

// server/src/data/rom-reference.js enhancement
{
  joint: 'shoulder',
  movements: {
    flexion: {
      label: 'Flexion',
      normal: 180,
      source: 'AAOS Clinical Practice Guideline 2023',
      studyReferences: ['PMID:12345678', 'PMID:87654321']
    }
  }
}
```

**Priority:** HIGH - Core clinical data
**Effort:** 2-3 days for comprehensive verification
**Impact:** Clinical accuracy and credibility

---

## 4. MMT Standards - Verify Against Kendall ✅

### Current Implementation
- File: `server/src/data/mmt-reference.js`
- Source: Kendall's Muscle Testing and Function
- Method: Manual entry from textbook
- Status: ✅ Standard reference, verify edition

### Available Resources
- **Textbook**: Kendall's Muscle Testing and Function (latest edition)
- **No API**: Manual verification required
- **Alternative sources**: APTA documentation, PubMed articles

### Verification Plan
```javascript
// Verify against latest Kendall edition
1. Confirm we're using most recent edition
2. Cross-check muscle group assignments
3. Verify grade descriptions match exactly
4. Add edition/page number references

// Add to mmt-reference.js
{
  grade: '5',
  label: 'Normal',
  description: 'Holds test position against strong resistance',
  source: 'Kendall, F.P., et al. (2005). Muscles: Testing and Function, 5th ed., p. 23',
  clinicalNotes: 'Patient able to hold position against maximal resistance'
}
```

**Priority:** HIGH - Standard reference used globally
**Effort:** 2 days
**Impact:** Ensures we match clinical standard

---

## 5. Special Tests - Verify Sensitivity/Specificity Data 🔬

### Current Implementation
- File: `server/src/data/special-tests.js`
- Source: Published clinical literature
- Method: Manual entry from various sources
- Status: ⚠️ Needs specific citations for each test

### Available APIs
- **PubMed API**: Can search for diagnostic accuracy studies
- **PEDro**: Physiotherapy evidence database (web scraping possible)

### Enhancement Plan
```javascript
// Add PubMed API integration
1. For each special test, search PubMed for validation studies
2. Extract sensitivity/specificity from abstracts
3. Store PMIDs for reference
4. Auto-update annually

// Enhanced special-tests.js structure
{
  id: 'neer-test',
  name: "Neer's Impingement Test",
  sensitivity: '79%',
  specificity: '53%',
  sources: [
    {
      type: 'study',
      citation: 'Michener LA, et al. (2009)',
      pmid: '19168510',
      studyType: 'Systematic Review',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19168510/'
    }
  ],
  lastVerified: '2025-12-31'
}
```

**Priority:** HIGH - Critical for clinical decision-making
**Effort:** 5-7 days (need to research each test)
**Impact:** Evidence-based practice, defensible documentation

---

## 6. Exercise Data - API Integration Available ✅

### Current Implementation
- File: None yet (basic exercise fields in SessionDetail)
- Source: None
- Status: ❌ Missing - needs implementation

### Available APIs
1. **ExerciseDB (RapidAPI)**
   - 1,300+ exercises with animations
   - Free tier: 150 requests/day
   - Categories, muscle groups, equipment
   - API: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

2. **PhysiotherapyExercises.com**
   - 1,500+ exercises, 5,000+ images
   - Free, open access
   - May require web scraping or partnership

3. **API-Ninjas Exercise API**
   - 3,000+ exercises
   - Free tier available
   - Muscle group categorized

### Implementation Plan (Sprint 5)
```javascript
// New service: server/src/services/exercise-api.service.js
class ExerciseAPIService {
  async searchExercises(query, filters) {
    // 1. Try ExerciseDB API first
    // 2. Fallback to local cache
    // 3. Cache results for 30 days
  }
  
  async getExerciseDetails(exerciseId) {
    // Fetch full details including images/videos
  }
  
  async syncLibrary() {
    // Periodic sync of full library
  }
}
```

**Priority:** VERY HIGH - Major feature gap (practitioner complaint #3)
**Effort:** 2-3 weeks (Sprint 5)
**Impact:** Transforms exercise prescription capability

---

## 7. Outcome Measures - Data Extraction Required 🗄️

### Current Implementation
- File: None yet
- Source: None
- Status: ❌ Missing - needs implementation

### Available Resources
- **Rehabilitation Measures Database (RMD)**: 580+ measures, no official API
- **PROMIS (NIH)**: Patient-reported outcomes, has API
- **Individual measure websites**: Most are PDF/web only

### Implementation Plan (Sprint 5)
```javascript
// server/src/data/outcome-measures/
// Manually curate top 50 PT measures from RMD

// Structure
{
  id: 'oswestry',
  name: 'Oswestry Disability Index',
  acronym: 'ODI',
  population: 'Low back pain',
  items: 10,
  scoring: {
    min: 0,
    max: 50,
    interpretation: {
      '0-20': 'Minimal disability',
      '21-40': 'Moderate disability',
      '41-60': 'Severe disability',
      '61-80': 'Crippled',
      '81-100': 'Bed-bound'
    }
  },
  source: {
    name: 'Rehabilitation Measures Database',
    url: 'https://www.sralab.org/rehabilitation-measures/oswestry-disability-index',
    validation: 'Fairbank JC, Pynsent PB (2000). PMID: 11124709'
  },
  normativeData: { /* age/condition specific */ },
  minimumDetectableChange: 10,
  questions: [ /* full questionnaire */ ]
}
```

**Priority:** VERY HIGH - Major feature gap (practitioner complaint #4)
**Effort:** 3-4 weeks (Sprint 5)
**Impact:** Enables outcomes tracking, patient progress reports

---

## 8. Evidence Integration - PubMed API Available ✅

### Current Implementation
- File: None
- Status: ❌ No evidence integration

### Available APIs
1. **PubMed E-utilities API** (NCBI)
   - 39M+ citations
   - FREE, no authentication needed
   - Rate limit: 3 requests/second
   - API: https://www.ncbi.nlm.nih.gov/books/NBK25501/

2. **PEDro Database**
   - 67,000+ PT-specific trials
   - No official API (web scraping possible)
   - Quality ratings available

### Implementation Plan (Sprint 6)
```javascript
// New service: server/src/services/pubmed-api.service.js
class PubMedService {
  async searchByCondition(condition) {
    // Search PubMed for condition + physiotherapy
    // Return systematic reviews and RCTs
    // Cache results for 90 days
  }
  
  async getEvidenceSummary(diagnosis) {
    // Get top 5 most relevant studies
    // Parse abstracts for key findings
    // Return clinical recommendations
  }
}

// Add to SessionDetail
<EvidencePanel diagnosis={diagnoses[0]} />
// Shows relevant research, guidelines, recommendations
```

**Priority:** HIGH - Competitive differentiator
**Effort:** 2-3 weeks (Sprint 6)
**Impact:** Evidence-based decision support

---

## Implementation Roadmap

### Phase 1: Verify & Document Current Data (1-2 weeks)

**Week 1: ROM & MMT Verification**
- [ ] Cross-reference ROM values with AAOS guidelines
- [ ] Verify MMT against Kendall 5th edition
- [ ] Add specific page/source references
- [ ] Document verification date
- [ ] Create verification script

**Week 2: Special Tests & Codes Verification**
- [ ] Research each special test's validation study
- [ ] Add PMIDs and sensitivity/specificity sources
- [ ] Verify CPT codes against AMA 2025
- [ ] Verify ICD-10 codes against WHO 2025
- [ ] Create verification checklist

### Phase 2: API Integration - High Priority (3-4 weeks)

**Week 1: ICD-11 API**
- [ ] Register for WHO ICD API token
- [ ] Create icd-api.service.js
- [ ] Implement search with caching
- [ ] Test with common PT diagnoses
- [ ] Update ICD10Search component to use API

**Week 2-3: ExerciseDB API**
- [ ] Set up RapidAPI account (ExerciseDB)
- [ ] Create exercise-api.service.js
- [ ] Build exercise search/filter
- [ ] Cache exercise library locally
- [ ] Create ExerciseLibrary UI component

**Week 4: PubMed API**
- [ ] Create pubmed-api.service.js
- [ ] Implement condition-based search
- [ ] Parse abstracts for evidence
- [ ] Create EvidencePanel component
- [ ] Integrate into SessionDetail

### Phase 3: Data Enrichment (2-3 weeks)

**Week 1-2: Outcome Measures**
- [ ] Research top 50 PT measures on RMD
- [ ] Create outcome-measures data structure
- [ ] Add scoring algorithms
- [ ] Build OutcomeMeasure components
- [ ] Implement progress tracking

**Week 3: Special Tests Enhancement**
- [ ] Add detailed procedure instructions
- [ ] Include clinical pearls
- [ ] Add videos/images where available
- [ ] Link to validation studies

### Phase 4: Continuous Verification (Ongoing)

**Quarterly Review Process**
- [ ] Check WHO ICD API for updates
- [ ] Verify ROM/MMT standards haven't changed
- [ ] Update special test sensitivity/specificity
- [ ] Refresh PubMed evidence summaries
- [ ] Review CPT code changes (AMA publishes annually)

---

## Data Verification Checklist

### For Each Clinical Data Point

✅ **Source Documented**
- [ ] Primary source identified (e.g., "AAOS 2023")
- [ ] Publication/website URL included
- [ ] Edition/version specified
- [ ] Date accessed recorded

✅ **Accuracy Verified**
- [ ] Cross-checked with at least 2 sources
- [ ] Matches official publication
- [ ] No transcription errors
- [ ] Units/scales correct

✅ **Evidence-Based**
- [ ] Research citation provided (PMID if available)
- [ ] Study quality noted (e.g., systematic review, RCT)
- [ ] Sensitivity/specificity from validation study
- [ ] Conflicts/limitations noted

✅ **Up-to-Date**
- [ ] Most recent edition/version used
- [ ] Verification date recorded
- [ ] Update schedule defined
- [ ] Change log maintained

✅ **Legally Compliant**
- [ ] Copyright/licensing verified
- [ ] Attribution provided
- [ ] Fair use or license obtained
- [ ] Disclaimer included if needed

---

## API Integration Architecture

### Recommended Pattern: Cache-First with API Refresh

```javascript
// server/src/services/verified-data.service.js
class VerifiedDataService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  async getData(dataType, query, options = {}) {
    const cacheKey = `${dataType}:${JSON.stringify(query)}`;
    
    // 1. Check cache first
    if (this.isValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 2. Try API
    try {
      const data = await this.fetchFromAPI(dataType, query);
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + options.ttl);
      return data;
    } catch (error) {
      console.error('API fetch failed, using fallback:', error);
      
      // 3. Fallback to local verified data
      return this.getFallbackData(dataType, query);
    }
  }
  
  async fetchFromAPI(dataType, query) {
    switch(dataType) {
      case 'icd10':
        return await icdAPI.search(query);
      case 'exercise':
        return await exerciseAPI.search(query);
      case 'evidence':
        return await pubmedAPI.search(query);
      default:
        throw new Error('Unknown data type');
    }
  }
  
  getFallbackData(dataType, query) {
    // Load from local verified data files
    const dataMap = {
      'icd10': require('../data/icd10-codes'),
      'rom': require('../data/rom-reference'),
      'mmt': require('../data/mmt-reference'),
      'specialTests': require('../data/special-tests'),
      'cpt': require('../data/cpt-codes')
    };
    
    return dataMap[dataType].search(query);
  }
}
```

### Benefits of This Approach

✅ **Always Available**: Falls back to local data if API down
✅ **Performance**: Cache reduces API calls and response time
✅ **Cost**: Free tier API limits respected via caching
✅ **Accuracy**: APIs provide latest data when available
✅ **Reliability**: Local data ensures app never breaks

---

## Monitoring & Quality Assurance

### Data Quality Dashboard (Future)

```javascript
// Admin view showing:
- Last API sync date for each data source
- Cache hit/miss rates
- Data verification status
- Outdated records needing review
- API health status
```

### Automated Tests

```javascript
// __tests__/data-verification.test.js
describe('Clinical Data Verification', () => {
  it('ROM values match AAOS standards', () => {
    const shoulder = romReference.getJoint('shoulder');
    expect(shoulder.movements.flexion.normal).toBe(180);
    expect(shoulder.movements.flexion.source).toContain('AAOS');
  });
  
  it('Special tests have validation studies', () => {
    const tests = specialTests.getAllTests();
    tests.forEach(test => {
      expect(test.sources).toBeDefined();
      expect(test.sources.length).toBeGreaterThan(0);
      expect(test.sensitivity).toMatch(/\d+%/);
    });
  });
  
  it('ICD codes are valid WHO format', () => {
    const codes = icd10Codes.getAllCodes();
    codes.forEach(code => {
      expect(code.code).toMatch(/^[A-Z]\d{2}(\.\d{1,2})?$/);
      expect(code.source).toContain('WHO ICD-10-CM');
    });
  });
});
```

---

## Success Metrics

### Data Quality Indicators

| Metric | Target | Current |
|--------|--------|---------|
| **Sources documented** | 100% | ~80% |
| **API-backed data** | >50% | 0% |
| **Verification date recorded** | 100% | 0% |
| **Research citations (PMIDs)** | >80% | ~30% |
| **Cache hit rate** | >90% | N/A |
| **Data freshness** | <90 days | Static |

### User Impact

- ✅ Clinicians trust data accuracy
- ✅ Defensible documentation in audits
- ✅ Always up-to-date with standard changes
- ✅ Evidence-based recommendations
- ✅ Competitive credibility

---

## Next Steps

### Immediate (This Week)
1. Register for WHO ICD-11 API token
2. Start ROM/MMT verification against source materials
3. Create data verification checklist template

### Sprint 5 (Next 5-7 weeks)
1. Implement ICD-11 API integration
2. Integrate ExerciseDB API
3. Add outcome measures (RMD data)
4. Enhance special tests with research citations

### Sprint 6 (Following 4-6 weeks)
1. PubMed API integration
2. Clinical guidelines integration
3. Evidence-based recommendations

### Ongoing
1. Quarterly data verification reviews
2. Annual CPT/ICD code updates
3. Continuous PubMed evidence refresh
