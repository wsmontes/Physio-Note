# Sprint 4: Technical Implementation Plan
## Immediate Clinical Features (No External Dependencies)

**Based on:** [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) - Technically Feasible Subset  
**Timeline:** 4-6 weeks  
**Focus:** Clinical features that practitioners need most

---

## 🎯 SCOPE: What We're Building

### ✅ INCLUDED (Technically Feasible Now)
1. **Structured Clinical Measurements** - ROM, MMT, Special Tests
2. **Billing Documentation** - CPT codes, 8-minute rule, ICD-10
3. **Enhanced Session Workflow** - Better organization, validation
4. **UI/UX Improvements** - Keyboard shortcuts, help system
5. **Clinical Data Models** - Proper schema for measurements

### ❌ DEFERRED (Requires External Dependencies)
- HIPAA compliance infrastructure (needs BAAs, legal counsel)
- Insurance verification API (needs vendor contracts)
- EMR integrations (needs partnerships)
- Clinical validation study (needs participants, budget)
- Penetration testing (needs security firm)

---

## 📋 SPRINT 4 TASKS

### Priority 1: Structured Clinical Measurements (Week 1-2)

#### Task 1.1: Range of Motion (ROM) Interface
**Estimated:** 8-10 hours

**Backend:**
- [ ] Update Session model with ROM structure:
```javascript
rangeOfMotion: [{
  joint: String,        // 'shoulder', 'elbow', 'hip', 'knee', 'ankle', 'spine'
  side: String,         // 'left', 'right', 'bilateral'
  movement: String,     // 'flexion', 'extension', 'abduction', etc.
  measurement: Number,  // degrees
  normalRange: Number,  // reference value
  painLevel: Number,    // 0-10 during movement
  notes: String
}]
```

**Frontend:**
- [ ] Create `components/clinical/ROMInput.jsx`
  - Dropdown for joint selection (presets)
  - Dropdown for movement type (joint-specific options)
  - Side selector (L/R/Bilateral)
  - Measurement input with validation (0-360°)
  - Show normal range reference
  - Visual indicator (percentage of normal)
  - Add/remove ROM entries
  
- [ ] Integrate into SessionDetail page
  - Add ROM section above SOAP notes
  - Display ROM history from previous sessions
  - Graph ROM progress over time

**Data:**
- [ ] Create ROM reference library (`/server/src/data/rom-reference.js`)
  - Joint movements with normal ranges
  - Example: Shoulder flexion: 180°, extension: 60°

---

#### Task 1.2: Manual Muscle Testing (MMT)
**Estimated:** 6-8 hours

**Backend:**
- [ ] Update Session model:
```javascript
muscleStrength: [{
  muscleGroup: String,  // 'shoulder flexors', 'knee extensors', etc.
  side: String,
  grade: String,        // '0', '1', '2-', '2', '2+', '3-', '3', '3+', '4', '5'
  testPosition: String, // 'seated', 'supine', 'standing'
  notes: String
}]
```

**Frontend:**
- [ ] Create `components/clinical/MMTInput.jsx`
  - Muscle group selector (organized by region)
  - 0-5 grading scale with +/- modifiers
  - Side selector
  - Test position dropdown
  - Color coding (red: 0-2, yellow: 3, green: 4-5)
  - Add/remove MMT entries

**Data:**
- [ ] Create MMT reference library (`/server/src/data/mmt-reference.js`)
  - Common muscle groups by body region
  - Grade definitions with descriptions

---

#### Task 1.3: Special Tests Library
**Estimated:** 10-12 hours

**Backend:**
- [ ] Update Session model:
```javascript
specialTests: [{
  testName: String,     // 'Neer\'s Test', 'Lachman Test', etc.
  bodyRegion: String,   // 'shoulder', 'knee', 'spine'
  side: String,
  result: String,       // 'positive', 'negative', 'inconclusive'
  findings: String,     // specific observations
  clinicalRelevance: String  // what this indicates
}]
```

**Frontend:**
- [ ] Create `components/clinical/SpecialTestsInput.jsx`
  - Search/filter tests by body region
  - Common tests organized by specialty
  - Result selector (positive/negative/inconclusive)
  - Show test description and what positive indicates
  - Add/remove test entries

**Data:**
- [ ] Create special tests library (`/server/src/data/special-tests.js`)
  - 50+ common orthopedic tests
  - Organized by body region
  - Include: name, description, positive finding indicates
  - Examples:
    - Shoulder: Neer's, Hawkins-Kennedy, Apprehension, Empty Can
    - Knee: Lachman, Anterior Drawer, McMurray, Valgus/Varus Stress
    - Spine: Straight Leg Raise, Spurling's, Slump Test

---

### Priority 2: Billing Documentation (Week 2-3)

#### Task 2.1: CPT Code Selection
**Estimated:** 8-10 hours

**Backend:**
- [ ] Update Session model:
```javascript
billing: {
  cptCodes: [{
    code: String,         // '97110', '97140', etc.
    description: String,  // 'Therapeutic Exercise'
    units: Number,        // billable units
    minutes: Number,      // actual time spent
    modifiers: [String],  // ['GP'], etc.
    notes: String
  }],
  totalMinutes: Number,
  totalUnits: Number,
  evaluationType: String  // '97161', '97162', '97163' (low/mod/high complexity)
}
```

**Frontend:**
- [ ] Create `components/billing/CPTCodeSelector.jsx`
  - Common PT CPT codes with descriptions
  - Time input per code (minutes)
  - Auto-calculate units based on 8-minute rule
  - Running total of time/units
  - Warning if minutes don't support units

**Data:**
- [ ] Create CPT code library (`/server/src/data/cpt-codes.js`)
  - Common PT codes:
    - 97110: Therapeutic Exercise
    - 97112: Neuromuscular Re-education
    - 97116: Gait Training
    - 97140: Manual Therapy
    - 97530: Therapeutic Activities
    - 97535: Self-care Management
    - 97161-97163: Evaluation codes
    - Plus 20+ more codes

---

#### Task 2.2: 8-Minute Rule Calculator
**Estimated:** 6-8 hours

**Frontend:**
- [ ] Create `components/billing/EightMinuteRuleCalculator.jsx`
  - Visual timeline of session
  - Show billable units based on total time
  - Highlight when approaching unit threshold (8, 23, 38, 53 min)
  - Calculation display: "45 minutes = 3 units"
  - Warning for mixed treatment (different calculation)
  - Info tooltip explaining the rule

**Utility:**
- [ ] Create `/client/src/utils/billingCalculations.js`
```javascript
export const calculateUnits = (minutes) => {
  // 8-minute rule logic
  // 8-22 min = 1 unit
  // 23-37 min = 2 units
  // 38-52 min = 3 units
  // etc.
}

export const validateBillingTime = (cptCodes) => {
  // Check if minutes support claimed units
  // Return warnings/errors
}
```

---

#### Task 2.3: ICD-10 Code Search
**Estimated:** 8-10 hours

**Backend:**
- [ ] Update Session model:
```javascript
diagnoses: [{
  icd10Code: String,    // 'M25.511'
  description: String,  // 'Pain in right shoulder'
  isPrimary: Boolean,   // primary vs secondary diagnosis
  onset: Date,
  status: String        // 'acute', 'chronic', 'resolving'
}]
```

**Frontend:**
- [ ] Create `components/billing/ICD10Search.jsx`
  - Search common PT diagnoses
  - Autocomplete suggestions
  - Mark primary diagnosis
  - Link diagnoses to CPT codes (medical necessity)
  - Recently used codes quick select

**Data:**
- [ ] Create ICD-10 library (`/server/src/data/icd10-codes.js`)
  - 100+ common PT diagnoses
  - Organized by body region
  - Examples:
    - M25.511: Pain in right shoulder
    - M54.5: Low back pain
    - S93.401A: Sprain of unspecified ligament of right ankle
    - M17.11: Unilateral primary osteoarthritis, right knee

---

### Priority 3: Enhanced Session Workflow (Week 3-4)

#### Task 3.1: Session Header Enhancement
**Estimated:** 4-6 hours

**Frontend:**
- [ ] Update SessionDetail header
  - Show patient info card (age, diagnosis, visit #)
  - Display authorization status (visits used/remaining)
  - Session timer (track total time)
  - Session status indicator (in-progress/completed/signed)
  - Quick links to patient history

---

#### Task 3.2: Clinical Summary Widget
**Estimated:** 6-8 hours

**Frontend:**
- [ ] Create `components/clinical/ClinicalSummary.jsx`
  - Display at top of session
  - Show from previous visit:
    - Pain levels (then vs now)
    - ROM measurements (then vs now)
    - Functional status
  - Visual progress indicators
  - "Copy from last visit" quick action

---

#### Task 3.3: Treatment Plan Section
**Estimated:** 6-8 hours

**Backend:**
- [ ] Create TreatmentPlan model:
```javascript
{
  patientId: ObjectId,
  goals: [{
    description: String,
    category: String,      // 'pain', 'rom', 'strength', 'function'
    targetDate: Date,
    measurementCriteria: String,
    status: String,        // 'active', 'achieved', 'modified', 'discontinued'
    progress: String       // 'on track', 'behind', 'ahead'
  }],
  frequency: String,       // '3x/week'
  duration: String,        // '4 weeks'
  totalVisits: Number,
  visitsCompleted: Number,
  expectedOutcome: String,
  dischargeCriteria: String
}
```

**Frontend:**
- [ ] Create TreatmentPlan page/component
  - Set frequency and duration
  - Add SMART goals
  - Track progress toward goals
  - Show on SessionDetail page
  - Update goals during treatment

---

### Priority 4: UI/UX Improvements (Week 4)

#### Task 4.1: Keyboard Shortcuts
**Estimated:** 4-6 hours

**Frontend:**
- [ ] Implement keyboard shortcuts:
  - `Ctrl/Cmd + S`: Save session
  - `Ctrl/Cmd + P`: Jump to Patients
  - `Ctrl/Cmd + N`: New session
  - `Ctrl/Cmd + F`: Search
  - `Ctrl/Cmd + K`: Command palette
  - `Esc`: Close modals
  - `Tab`: Navigate form fields

- [ ] Create shortcuts help modal (Ctrl/Cmd + ?)
- [ ] Add visual indicators for shortcuts on buttons

---

#### Task 4.2: Form Validation & Feedback
**Estimated:** 6-8 hours

**Frontend:**
- [ ] Add real-time validation:
  - Required field indicators
  - Format validation (phone, email, dates)
  - Range validation (ROM 0-360°, pain 0-10)
  - Custom error messages
  - Success confirmations (green checkmarks)

- [ ] Unsaved changes warning
  - Detect form changes
  - Warn before navigating away
  - "You have unsaved changes" modal

---

#### Task 4.3: Contextual Help System
**Estimated:** 4-6 hours

**Frontend:**
- [ ] Add help tooltips throughout app:
  - Hover over ? icons
  - Explain complex fields
  - Link to documentation
  - Video tutorial embeds (when available)

- [ ] Create Help sidebar (slides in from right)
  - Context-aware content
  - Search help articles
  - Quick links to common tasks

---

### Priority 5: Data Models & API Updates (Week 1)

#### Task 5.1: Update Session Model
**Estimated:** 4-6 hours

**Backend:**
- [ ] Enhance session.model.js with new fields
- [ ] Add validation rules
- [ ] Create migration script for existing sessions
- [ ] Add indexes for performance

---

#### Task 5.2: Create New API Endpoints
**Estimated:** 6-8 hours

**Backend:**
- [ ] `/api/reference/rom` - GET ROM reference data
- [ ] `/api/reference/mmt` - GET MMT reference data
- [ ] `/api/reference/special-tests` - GET special tests library
- [ ] `/api/reference/cpt-codes` - GET CPT code library
- [ ] `/api/reference/icd10-codes` - GET ICD-10 codes (with search)
- [ ] `/api/sessions/:id/clinical-summary` - GET previous session comparison
- [ ] `/api/treatment-plans` - CRUD for treatment plans

---

#### Task 5.3: Create Reference Data Seeders
**Estimated:** 6-8 hours

**Backend:**
- [ ] Create seed scripts for:
  - ROM reference values
  - MMT muscle groups
  - Special tests library
  - CPT codes
  - ICD-10 codes

- [ ] Run seeders in development
- [ ] Document how to update reference data

---

## 🗓️ DETAILED TIMELINE

### Week 1: Clinical Measurements Foundation
- **Days 1-2:** Update Session model, create reference data
- **Days 3-4:** Build ROM Input component
- **Days 5:** Build MMT Input component

### Week 2: Clinical Measurements Complete + Billing Start
- **Days 1-2:** Build Special Tests component
- **Days 3-4:** CPT Code selector
- **Days 5:** 8-minute rule calculator

### Week 3: Billing Complete + Workflow Enhancements
- **Days 1-2:** ICD-10 search
- **Days 3-4:** Session header enhancement, Clinical summary
- **Day 5:** Treatment plan foundation

### Week 4: Polish & UX
- **Days 1-2:** Keyboard shortcuts, form validation
- **Days 3-4:** Help system, tooltips
- **Day 5:** Testing, bug fixes, documentation

---

## 📊 PROGRESS TRACKING

### Current Status: Sprint 4 Planning Complete

| Task | Status | Priority | Estimated | Actual |
|------|--------|----------|-----------|--------|
| ROM Input | 🔵 Not Started | P1 | 8-10h | - |
| MMT Input | 🔵 Not Started | P1 | 6-8h | - |
| Special Tests | 🔵 Not Started | P1 | 10-12h | - |
| CPT Codes | 🔵 Not Started | P1 | 8-10h | - |
| 8-Min Rule | 🔵 Not Started | P1 | 6-8h | - |
| ICD-10 Search | 🔵 Not Started | P1 | 8-10h | - |
| Session Enhancements | 🔵 Not Started | P2 | 10-14h | - |
| UX Improvements | 🔵 Not Started | P2 | 14-20h | - |
| **TOTAL** | | | **70-92h** | **-** |

**Legend:**
- 🔵 Not Started
- 🟡 In Progress
- ✅ Complete
- ⚠️ Blocked

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] All new components have TypeScript definitions (or PropTypes)
- [ ] All new components have tests (80%+ coverage)
- [ ] All API endpoints documented
- [ ] No console errors in browser
- [ ] Mobile responsive (tested on 3 screen sizes)

### Clinical Utility Metrics
- [ ] ROM measurements can be entered in <60 seconds
- [ ] Special tests searchable/filterable
- [ ] 8-minute rule calculation is accurate vs. manual
- [ ] ICD-10 search returns results in <1 second
- [ ] Session workflow feels natural (subjective but aim for intuitive)

### Code Quality Metrics
- [ ] No duplicate code (DRY principle)
- [ ] Consistent component structure
- [ ] Proper error handling
- [ ] Loading states for all async operations
- [ ] Accessibility basics (keyboard nav, ARIA labels)

---

## 🚀 NEXT STEPS

### Immediate (Today)
1. Create todo list for Sprint 4 tasks
2. Set up new component directories
3. Create reference data files (ROM, MMT, tests, CPT, ICD-10)
4. Update Session model schema

### This Week
1. Build ROM Input component
2. Build MMT Input component
3. Integrate into SessionDetail page
4. Test with sample data

### Following Weeks
- Continue building according to timeline
- Daily progress updates
- Weekly demos of completed features

---

## 📝 NOTES

**Why These Features First?**
- Address practitioner's #1 complaint: "Missing clinical essentials"
- No external dependencies (can build immediately)
- High impact on clinical utility
- Foundation for future features (outcomes tracking, analytics)

**What About HIPAA Compliance?**
- Still NOT production-ready without Phase 1 (legal compliance)
- These features make the app more useful for demo/testing
- When compliance is done, we'll have a feature-complete product

**Post-Sprint 4:**
- User feedback on new features
- Bug fixes and refinements
- Then consider: scheduling system, outcomes tracking, or begin Phase 1 compliance work

---

**Document Owner:** Development Team  
**Created:** December 31, 2025  
**Status:** Ready to Start  
**Next Review:** Weekly standup
