# Physio-Note API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "therapist@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "licenseNumber": "PT12345",
  "specialty": "Orthopedic Physiotherapy",
  "phone": "(555) 123-4567"
}
```

**Response:**
```json
{
  "_id": "...",
  "email": "therapist@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "therapist",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "therapist@example.com",
  "password": "securePassword123"
}
```

---

## Patient Endpoints

### Get All Patients
```http
GET /api/patients
```

**Response:**
```json
[
  {
    "_id": "...",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "(555) 234-5678",
    "dateOfBirth": "1985-05-15",
    "status": "active",
    "medicalHistory": {
      "conditions": ["Lower back pain", "Previous knee surgery"],
      "allergies": ["Penicillin"],
      "medications": ["Ibuprofen 400mg"]
    }
  }
]
```

### Get Single Patient
```http
GET /api/patients/:id
```

### Create Patient
```http
POST /api/patients
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "(555) 234-5678",
  "dateOfBirth": "1985-05-15",
  "gender": "female",
  "medicalHistory": {
    "conditions": ["Lower back pain"],
    "allergies": [],
    "medications": []
  }
}
```

---

## Session Endpoints

### Get All Sessions
```http
GET /api/sessions
```

### Get Patient Sessions
```http
GET /api/sessions/patient/:patientId
```

### Create Session
```http
POST /api/sessions
```

**Body:**
```json
{
  "patientId": "...",
  "date": "2025-12-29T10:00:00Z",
  "duration": 60,
  "type": "initial-assessment",
  "chiefComplaint": "Lower back pain radiating to left leg",
  "painScale": {
    "current": 6,
    "best": 3,
    "worst": 9,
    "location": "Lower lumbar spine, L radiating leg"
  },
  "assessment": {
    "subjective": "Patient reports pain started 2 weeks ago...",
    "objective": "Observation reveals antalgic gait...",
    "assessment": "Patient presents with acute lower back pain...",
    "plan": "Manual therapy, therapeutic exercises..."
  }
}
```

### Update Session
```http
PUT /api/sessions/:id
```

---

## AI-Powered Endpoints

### Transcribe Audio (Whisper)
```http
POST /api/ai/transcribe
Content-Type: multipart/form-data
```

**Body (form-data):**
- `audio`: Audio file (mp3, wav, m4a, webm)
- `duration`: Duration in seconds (optional)

**Response:**
```json
{
  "transcription": "Patient reports increased pain in the right shoulder...",
  "duration": 180,
  "timestamp": "2025-12-29T10:30:00Z"
}
```

### Generate SOAP Note (GPT-5-nano)
```http
POST /api/ai/generate-note
```

**Body:**
```json
{
  "transcription": "Patient reports increased pain in right shoulder when reaching overhead. Pain started 3 days ago after playing tennis. Pain is 7 out of 10. On examination, patient has limited shoulder abduction to 120 degrees with pain. Positive impingement test. Strength is 4/5 in external rotation.",
  "context": {
    "patientHistory": "Previous right shoulder injury 2 years ago",
    "previousNotes": "Last visit: Patient was pain-free"
  },
  "template": "soap"
}
```

**Response:**
```json
{
  "note": {
    "template": "soap",
    "content": {
      "subjective": "Patient reports increased pain in right shoulder when reaching overhead. Onset 3 days ago after playing tennis. Current pain level 7/10.",
      "objective": "Limited shoulder abduction to 120°. Positive impingement test. External rotation strength 4/5.",
      "assessment": "Acute rotator cuff tendinopathy, likely supraspinatus involvement. Contributing factors include overhead activity and previous injury.",
      "plan": "Manual therapy for soft tissue release. Strengthening exercises for rotator cuff. Ice post-treatment. Home exercise program. Follow-up in 1 week."
    },
    "rawContent": "...",
    "generatedAt": "2025-12-29T10:35:00Z"
  },
  "generatedBy": "gpt-5-nano",
  "timestamp": "2025-12-29T10:35:00Z"
}
```

### Generate Exercise Program
```http
POST /api/ai/exercise-program
```

**Body:**
```json
{
  "sessionData": {
    "type": "orthopedic",
    "diagnosis": "Rotator cuff tendinopathy",
    "treatments": [
      {
        "name": "Manual therapy",
        "description": "Soft tissue mobilization"
      }
    ]
  },
  "patientGoals": "Return to tennis within 6 weeks, pain-free overhead reaching"
}
```

**Response:**
```json
{
  "exercises": [
    {
      "name": "Pendulum exercises",
      "type": "stretching",
      "sets": 3,
      "reps": 15,
      "duration": null,
      "hold": null,
      "instructions": "Lean forward, let arm hang. Make small circles clockwise, then counterclockwise.",
      "homeProgram": true,
      "frequency": "3 times daily"
    },
    {
      "name": "External rotation with band",
      "type": "strengthening",
      "sets": 3,
      "reps": 12,
      "instructions": "Stand with elbow bent 90°. Pull band outward keeping elbow at side.",
      "homeProgram": true,
      "frequency": "Once daily"
    }
  ],
  "generatedBy": "gpt-5-nano"
}
```

### Suggest Billing Codes
```http
POST /api/ai/billing-codes
```

**Body:**
```json
{
  "sessionData": {
    "type": "follow-up",
    "duration": 60,
    "treatments": [
      {
        "name": "Manual therapy",
        "duration": 15
      },
      {
        "name": "Therapeutic exercises",
        "duration": 30
      }
    ],
    "modalitiesUsed": [
      {
        "type": "Ultrasound",
        "duration": 10,
        "area": "Right shoulder"
      }
    ]
  }
}
```

**Response:**
```json
{
  "billingCodes": [
    {
      "code": "97140",
      "description": "Manual therapy techniques (1 unit = 15 minutes)",
      "units": 1
    },
    {
      "code": "97110",
      "description": "Therapeutic exercises (1 unit = 15 minutes)",
      "units": 2
    },
    {
      "code": "97035",
      "description": "Ultrasound",
      "units": 1
    }
  ],
  "generatedBy": "gpt-5-nano"
}
```

### Combined: Transcribe and Generate
```http
POST /api/ai/transcribe-and-generate
Content-Type: multipart/form-data
```

**Body (form-data):**
- `audio`: Audio file
- `context`: JSON string with patient context (optional)
- `template`: Template type (default: "soap")

**Response:**
```json
{
  "transcription": "Patient reports...",
  "note": {
    "template": "soap",
    "content": { ... }
  },
  "generatedBy": {
    "transcription": "whisper-1",
    "note": "gpt-5-nano"
  }
}
```

---

## Notes Endpoints

### Get All Notes
```http
GET /api/notes
```

### Get Session Notes
```http
GET /api/notes/session/:sessionId
```

### Create Note
```http
POST /api/notes
```

**Body:**
```json
{
  "sessionId": "...",
  "type": "soap",
  "content": "Detailed clinical note content",
  "transcription": "Original voice transcription",
  "tags": ["shoulder", "rotator-cuff"],
  "isFinalized": false
}
```

---

## Error Responses

All endpoints may return standard error responses:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting & Costs

### OpenAI API Costs (GPT-5-nano)
- **Input**: $0.05 per 1M tokens (~750,000 words)
- **Output**: $0.20 per 1M tokens (~750,000 words)
- **Whisper**: $0.006 per minute of audio

### Typical Usage:
- **Transcription** (30 min session): ~$0.18
- **SOAP Note Generation** (500 words in/800 words out): ~$0.0002
- **Exercise Program**: ~$0.0001

**Total cost per session with AI: ~$0.20**

---

## WebSocket Events (Future Feature)

Real-time transcription updates:

```javascript
socket.on('transcription-update', (data) => {
  console.log(data.partialTranscript);
});

socket.on('transcription-complete', (data) => {
  console.log(data.fullTranscript);
});
```

---

## Best Practices

1. **Audio Quality**: Use high-quality microphone, minimize background noise
2. **Session Context**: Always provide patient history in context for better note quality
3. **Review AI Output**: Always review and edit AI-generated notes before finalizing
4. **Error Handling**: Implement retry logic for API failures
5. **Token Management**: Store JWT securely, refresh before expiration
6. **File Uploads**: Limit audio files to 25MB, supported formats: mp3, wav, m4a, webm

---

## Example Workflow

```javascript
// 1. Record session audio
const audioBlob = await recordAudio();

// 2. Transcribe and generate note
const formData = new FormData();
formData.append('audio', audioBlob);
formData.append('context', JSON.stringify({
  patientHistory: 'Previous shoulder injury',
  previousNotes: 'Last visit pain-free'
}));

const response = await fetch('/api/ai/transcribe-and-generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { transcription, note } = await response.json();

// 3. Create session with generated note
await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    patientId: patient._id,
    date: new Date(),
    duration: 60,
    type: 'follow-up',
    audioTranscription: transcription,
    assessment: note.content
  })
});

// 4. Generate exercise program
const exercisesResponse = await fetch('/api/ai/exercise-program', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sessionData: sessionData,
    patientGoals: 'Return to sport'
  })
});

const { exercises } = await exercisesResponse.json();
```
