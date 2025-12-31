# Copilot Instructions - Physio-Note

## Architecture Patterns

**Stack**: MERN (MongoDB, Express, React, Node.js)  
**Deployment**: Render.com (Backend + Frontend static site)  
**Database**: MongoDB Atlas

```
client/                 # Frontend (React + Vite)
├── src/
│   ├── components/    # Reusable UI components
│   │   └── ui/        # Design System components
│   ├── pages/         # Route-level components
│   ├── services/      # API communication layer
│   ├── hooks/         # Custom React hooks
│   └── context/       # React Context providers

server/                # Backend (Express + MongoDB)
├── src/
│   ├── routes/        # API route handlers
│   ├── models/        # Mongoose schemas
│   ├── services/      # Business logic layer
│   └── middleware/    # Auth, validation, error handling
```

**Key Principles**:
- Service layer handles business logic (don't put logic in routes)
- Custom hooks encapsulate state + side effects
- Context for global state (Auth, Toast)
- API calls isolated in service files
- Design System for consistent UI

**API Patterns**:
- Base URL from environment: `VITE_API_URL` (client) / `PORT` (server)
- All endpoints prefixed with `/api`
- JWT auth via `Authorization: Bearer <token>` header
- RESTful conventions: GET (list/detail), POST (create), PUT (update), DELETE (remove)
- Standard responses: `{ data }` (success) or `{ message, userMessage }` (error)

## Design Patterns

### Backend
```javascript
// Route → Service → Model pattern
router.post('/patients', auth, validate(schema), async (req, res, next) => {
  try {
    const patient = await patientService.create(req.body, req.user.id);
    res.status(201).json(patient);
  } catch (error) {
    next(error); // Centralized error handler
  }
});
```

### API Service Layer (Frontend)
```javascript
// services/patient.service.js
import axios from './axios.config';

const getPatients = async () => {
  const { data } = await axios.get('/patients');
  return data;
};

const createPatient = async (patientData) => {
  const { data } = await axios.post('/patients', patientData);
  return data;
};
```

### Frontend Components
```jsx
// Design System usage
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">{t('actions.save')}</Button>
      </CardContent>
    </Card>
  );
};
```

### Custom Hooks
```javascript
// Encapsulate state + logic
const usePatient = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchPatient = async () => {
    // fetch logic
  };
  
  return { patient, loading, fetchPatient, updatePatient };
};
```

## Documentation Patterns

**Keep it concise**:
- Code comments: Only for "why", not "what"
- Function docs: Purpose + parameters + return (1-2 lines)
- README sections: Short paragraphs, bullet lists
- API docs: Request/response examples, not prose

```javascript
// ❌ Bad: Obvious comment
// This function creates a patient
const createPatient = async (data) => { ... }

// ✅ Good: Explains non-obvious logic
// Validate insurance info only for US patients
if (data.country === 'US' && !data.insurance) { ... }

/**
 * Generate SOAP note from audio transcription using OpenAI
 * @param {string} transcription - Audio text
 * @param {Object} context - Session context (patient history, previous notes)
 * @returns {Promise<Object>} Structured SOAP note {subjective, objective, assessment, plan}
 */
```

## Test Patterns

### Frontend (Vitest + React Testing Library)
```javascript
import { render, screen, act, waitFor } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render with props', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('should handle async state updates', async () => {
    const { result } = renderHook(() => useCustomHook());
    await act(async () => {
      await result.current.fetchData();
    });
    expect(result.current.data).toBeDefined();
  });
});
```

### Backend (Jest + Supertest)
```javascript
describe('POST /api/patients', () => {
  it('should create patient with valid data', async () => {
    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'John', lastName: 'Doe' })
      .expect(201);
    
    expect(response.body).toHaveProperty('_id');
    expect(response.body.firstName).toBe('John');
  });
  
  it('should return 400 for missing required fields', async () => {
    await request(app)
      .post('/api/patients')
      .send({ firstName: 'John' }) // missing lastName
      .expect(400);
  });
});
```

**Key Practices**:
- Wrap state updates in `act()`
- Use `waitFor()` for async assertions
- Mock external services (OpenAI, MongoDB in tests)
- Test user behavior, not implementation details
- One assertion per test (focused tests)

## Git Patterns

### Commit Messages
```
type(scope): brief description

feat(auth): add JWT refresh token endpoint
fix(patient): resolve duplicate email validation
refactor(ui): migrate Dashboard to Design System
test(hooks): add useSOAPNote integration tests
docs(api): update template routes documentation
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

### Branch Strategy
- `main` - production-ready code
- Feature branches: `feature/template-system`, `fix/auth-bug`
- Keep branches short-lived (1-3 days)

### PR Guidelines
- Title: Clear description of change
- Description: What changed, why, testing done
- Link related issues
- Keep PRs focused (1 feature/fix)
- Request review when tests pass

## Code Style

**React**:
- Functional components with hooks
- Named exports for components
- Props destructuring in function signature
- Early returns for loading/error states

**JavaScript**:
- `const` over `let`, avoid `var`
- Arrow functions for callbacks
- Async/await over promises
- Optional chaining: `user?.profile?.name`
- Template literals for strings

**File Naming**:
- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Services: `camelCase.service.js`
- Tests: `*.test.js` or `*.test.jsx`

## Common Commands

```bash
# Development
npm run dev              # Start both client + server
npm test                # Run all tests
npm test -- useSOAPNote # Run specific test

# Frontend only
cd client && npm run dev
npm test

# Backend only  
cd server && npm run dev
npm test
```
