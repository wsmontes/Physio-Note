# Service Layer Standardization

## Overview
All services follow a consistent pattern for data access across the application.

## Architecture Principles

### 1. Single Responsibility
- **One modal component** (`NewSessionModal`) handles all session creation
- **No duplicate buttons** - each action has one clear entry point per context
- **Consistent navigation** - modals handle callbacks, parents decide navigation

### 2. Modal Pattern
- All create/edit operations use modals (never navigate to `/resource/new`)
- Modals accept callbacks (`onSessionCreated`, `onPatientCreated`, etc.)
- Modals close themselves after successful operation
- Parent components decide what happens after (refresh, navigate, etc.)

### 3. Route Pattern
- `/resource` - List view (e.g., `/patients`, `/sessions`)
- `/resource/:id` - Detail view (e.g., `/patients/123`, `/sessions/456`)
- **NO** `/resource/new` routes - use modals instead

## Service Functions

### Patient Service (`client/src/services/patient.service.js`)
```javascript
patientService.getPatients()           // Get all patients
patientService.getPatient(id)          // Get single patient
patientService.createPatient(data)     // Create patient
patientService.updatePatient(id, data) // Update patient
patientService.deletePatient(id)       // Delete patient
```

### Session Service (`client/src/services/session.service.js`)
```javascript
sessionService.getSessions()                // Get all sessions
sessionService.getSession(id)               // Get single session
sessionService.getPatientSessions(patientId) // Get sessions for a patient
sessionService.createSession(data)          // Create session
sessionService.updateSession(id, data)      // Update session
sessionService.deleteSession(id)            // Delete session
```

### Note Service (`client/src/services/note.service.js`)
```javascript
noteService.getNotes()                   // Get all notes
noteService.getNote(id)                  // Get single note
noteService.getNotesByPatient(patientId) // Get notes for a patient
noteService.getNotesBySession(sessionId) // Get notes for a session
noteService.createNote(data)             // Create note
noteService.updateNote(id, data)         // Update note
noteService.deleteNote(id)               // Delete note
```

### AI Service (`client/src/services/ai.service.js`)
```javascript
aiService.transcribeAudio(audioBlob)           // Transcribe audio
aiService.generateSoapNote(transcription)      // Generate SOAP note
aiService.suggestExercises(assessment)         // Suggest exercises
aiService.generateBillingCodes(sessionData)    // Generate billing codes
```

## Usage Rules

1. **Always import services, never use axios directly in components**
   ```javascript
   // ✅ CORRECT
   import patientService from '../services/patient.service';
   const patients = await patientService.getPatients();
   
   // ❌ WRONG
   import axios from 'axios';
   const response = await axios.get('/api/patients');
   ```

2. **All "get all" functions use plural without "getAll" prefix**
   - `getPatients()` not `getAllPatients()`
   - `getSessions()` not `getAllSessions()`
   - `getNotes()` not `getAllNotes()`

3. **All "get single" functions use singular**
   - `getPatient(id)` not `getPatientById(id)`
   - `getSession(id)` not `getSessionById(id)`
   - `getNote(id)` not `getNoteById(id)`

4. **All services return data directly (not response.data)**
   - Services handle the `.data` extraction
   - Components work with the data objects directly

## Files Using Services

### Pages
- `Dashboard.jsx` - Uses all three services for stats
- `Patients.jsx` - Uses patientService
- `PatientDetail.jsx` - Uses patientService + sessionService
- `Sessions.jsx` - Uses sessionService
- `SessionDetail.jsx` - Uses sessionService + patientService + aiService
- `Notes.jsx` - Uses noteService + patientService + sessionService

### Components
- `NewSessionModal.jsx` - Uses patientService + sessionService

## Verified Consistency
All service calls have been audited and standardized as of December 29, 2025.
