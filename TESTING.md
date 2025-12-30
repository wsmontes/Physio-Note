# Testing Guide

This document describes the testing framework and how to write and run tests for the Physio-Note application.

## Testing Stack

### Backend (Server)
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for API testing
- **Cross-env**: Cross-platform environment variables

### Frontend (Client)
- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM implementation for Node.js

## Running Tests

### Backend Tests

```bash
# Run all backend tests
cd server && npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Frontend Tests

```bash
# Run all frontend tests
cd client && npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Run All Tests

```bash
# From project root
npm test
```

## Test Structure

### Backend Test Organization

```
server/
├── __tests__/
│   ├── auth.test.js           # Authentication API tests
│   ├── models/
│   │   ├── patient.test.js    # Patient model tests
│   │   ├── session.test.js    # Session model tests
│   │   └── user.test.js       # User model tests
│   ├── routes/
│   │   ├── patient.test.js    # Patient routes tests
│   │   ├── session.test.js    # Session routes tests
│   │   └── ai.test.js         # AI routes tests
│   └── services/
│       └── openai.test.js     # OpenAI service tests
└── jest.config.js
```

### Frontend Test Organization

```
client/
├── src/
│   └── test/
│       ├── setup.js                    # Test setup and mocks
│       ├── Login.test.jsx              # Login component tests
│       ├── VoiceRecorder.test.jsx      # VoiceRecorder component tests
│       ├── components/
│       │   ├── Navbar.test.jsx
│       │   └── NewSessionModal.test.jsx
│       ├── pages/
│       │   ├── Dashboard.test.jsx
│       │   ├── Patients.test.jsx
│       │   └── Sessions.test.jsx
│       └── services/
│           ├── ai.service.test.js
│           ├── patient.service.test.js
│           └── session.service.test.js
└── vitest.config.js
```

## Writing Tests

### Backend API Test Example

```javascript
const request = require('supertest');
const app = require('../../src/server');

describe('Patient API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup: Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.token;
  });

  describe('GET /api/patients', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/patients')
        .expect(401);
    });

    it('should return list of patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });
});
```

### Backend Model Test Example

```javascript
const Patient = require('../../src/models/patient.model');

describe('Patient Model', () => {
  it('should validate required fields', async () => {
    const patient = new Patient({});
    
    let error;
    try {
      await patient.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });
});
```

### Frontend Component Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should update input on change', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput).toHaveValue('test@example.com');
  });
});
```

### Frontend Service Test Example

```javascript
import { vi } from 'vitest';
import axios from 'axios';
import patientService from '../services/patient.service';

vi.mock('axios');

describe('Patient Service', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ token: 'test-token' }));
  });

  it('should fetch all patients', async () => {
    const mockPatients = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' }
    ];

    axios.get.mockResolvedValue({ data: mockPatients });

    const patients = await patientService.getAllPatients();

    expect(axios.get).toHaveBeenCalledWith(
      '/api/patients',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
    expect(patients).toEqual(mockPatients);
  });
});
```

## Test Coverage Goals

- **Backend**: Aim for 80%+ coverage
  - Models: 90%+
  - Routes: 80%+
  - Services: 85%+

- **Frontend**: Aim for 70%+ coverage
  - Components: 75%+
  - Services: 80%+
  - Utils: 85%+

## Best Practices

### General
1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - describe what is being tested
5. **Mock external dependencies** - APIs, databases, etc.

### Backend
1. **Test all HTTP methods** - GET, POST, PUT, DELETE
2. **Test authentication and authorization**
3. **Test error handling** - validation errors, server errors
4. **Test edge cases** - empty data, invalid data, missing fields
5. **Use separate test database** - never test on production data

### Frontend
1. **Test user interactions** - clicks, typing, form submissions
2. **Test accessibility** - screen reader compatibility
3. **Mock API calls** - don't make real HTTP requests
4. **Test loading and error states**
5. **Test routing and navigation**

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd server && npm install
      - run: cd server && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd client && npm install
      - run: cd client && npm test
```

## Expanding the Test Suite

As the project grows, add tests for:

### Backend
- [ ] Session model tests
- [ ] Note model tests
- [ ] Patient routes (full CRUD)
- [ ] Session routes (full CRUD)
- [ ] OpenAI service integration tests
- [ ] Middleware tests (auth, validation)
- [ ] Database connection tests
- [ ] File upload tests (audio files)

### Frontend
- [ ] SessionDetail component tests
- [ ] PatientDetail component tests
- [ ] Dashboard component tests
- [ ] NewSessionModal tests
- [ ] VoiceRecorder advanced scenarios
- [ ] Form validation tests
- [ ] Context (AuthContext) tests
- [ ] Custom hooks tests
- [ ] Integration tests (full workflows)

## Debugging Tests

### Backend
```bash
# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend
```bash
# Run specific test file
npm test -- Login.test.jsx

# Run tests in UI mode for debugging
npm run test:ui

# Update snapshots
npm test -- -u
```

## Common Issues

### Backend
- **MongoDB connection errors**: Ensure test database is accessible
- **Timeout errors**: Increase timeout in jest.config.js
- **Port conflicts**: Use different port for tests

### Frontend
- **Module not found**: Check import paths and aliases
- **Component not rendering**: Wrap in required providers (Router, AuthContext)
- **Async errors**: Use waitFor() for async operations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Note**: This testing framework is designed to be expanded as the project grows. Add new tests whenever you add new features or fix bugs.
