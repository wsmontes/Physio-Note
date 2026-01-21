# 🧪 Testing Strategy - Physio-Note

## Overview

Comprehensive testing strategy following industry best practices for both frontend and backend.

---

## 📊 Testing Pyramid

```
         /\
        /E2E\         ← Few (Critical user flows)
       /------\
      /  API   \      ← Some (Integration tests)
     /----------\
    /   Unit     \    ← Many (Components, hooks, utils)
   /--------------\
```

**Distribution:**
- **Unit Tests**: 70% - Fast, isolated, many tests
- **Integration Tests**: 20% - API routes, service integration
- **E2E Tests**: 10% - Critical user journeys

---

## 🎨 Frontend Testing

### Tech Stack

- **Test Runner**: Vitest (faster than Jest, Vite-native)
- **Component Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **API Mocking**: MSW (Mock Service Worker)
- **Assertions**: Vitest + @testing-library/jest-dom

### Test Categories

#### 1. Component Tests (`**/*.test.jsx`)

**Design System Components:**
- ✅ Button.test.jsx - All variants, states, interactions
- ✅ Card.test.jsx - Full component family
- ✅ Input.test.jsx - Validation, icons, error states
- ⏳ Textarea.test.jsx
- ⏳ Badge.test.jsx
- ⏳ Skeleton.test.jsx
- ⏳ Spinner.test.jsx

**Business Components:**
- ⏳ SessionHeader.test.jsx
- ⏳ SOAPNoteEditor.test.jsx
- ⏳ TemplateEditor.test.jsx
- ⏳ LanguageSwitcher.test.jsx

**Test Focus:**
- Rendering correctness
- Props validation
- User interactions (click, type, hover)
- Accessibility (ARIA, keyboard navigation)
- Edge cases (empty state, errors)

**Example:**
```javascript
describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

#### 2. Custom Hook Tests (`**/*.test.js`)

**Hooks to Test:**
- ✅ useSOAPNote.test.js - SOAP state management
- ✅ usePhysioData.test.js - Physiotherapy data
- ⏳ useSession.test.js - Session CRUD
- ⏳ useAudioTranscription.test.js - Audio processing
- ⏳ usePatient.test.js - Patient data

**Test Focus:**
- Initial state
- State updates
- Side effects
- Data transformations
- Error handling

**Example:**
```javascript
describe('useSOAPNote Hook', () => {
  it('initializes with empty values', () => {
    const { result } = renderHook(() => useSOAPNote());
    expect(result.current.subjective).toBe('');
  });

  it('updates subjective field', () => {
    const { result } = renderHook(() => useSOAPNote());
    act(() => result.current.setSubjective('New data'));
    expect(result.current.subjective).toBe('New data');
  });
});
```

---

#### 3. Service Tests (`services/**/*.test.js`)

**Services to Test:**
- ⏳ ai.service.test.js - API calls, error handling
- ⏳ patient.service.test.js
- ⏳ session.service.test.js
- ⏳ template.service.test.js

**Test Focus:**
- API request formatting
- Response parsing
- Error handling
- Retry logic
- Timeout handling

**Using MSW:**
```javascript
const handlers = [
  rest.post('/api/ai/extract-physio-data', (req, res, ctx) => {
    return res(ctx.json({ painScale: {...} }));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

#### 4. Utility Tests (`lib/**/*.test.js`)

**Utils to Test:**
- ⏳ utils.test.js - cn(), formatDate(), debounce()
- ⏳ i18n.test.js - Translation logic

**Test Focus:**
- Input/output correctness
- Edge cases (null, undefined, empty)
- Performance (debounce timing)

---

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test Button.test.jsx

# Run in watch mode
npm test -- --watch

# Run with UI
npm test -- --ui
```

**Coverage Goals:**
- Components: >80%
- Hooks: >90%
- Utils: >95%
- Services: >70%

---

## 🔧 Backend Testing

### Tech Stack

- **Test Runner**: Jest
- **API Testing**: Supertest
- **Database**: MongoDB Memory Server (in-memory)
- **Mocking**: Jest mocks
- **Assertions**: Jest matchers

### Test Categories

#### 1. Route Integration Tests (`__tests__/**/*.test.js`)

**Routes to Test:**
- ✅ template.routes.test.js - Full CRUD + clone
- ✅ auth.test.js (existing)
- ⏳ session.routes.test.js
- ⏳ patient.routes.test.js
- ⏳ ai.routes.test.js

**Test Focus:**
- HTTP status codes
- Request validation
- Response structure
- Authentication/Authorization
- Error responses

**Example:**
```javascript
describe('POST /api/templates', () => {
  it('should create a new template', async () => {
    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${token}`)
      .send(templateData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});
```

---

#### 2. Service Unit Tests (`__tests__/**/*.service.test.js`)

**Services to Test:**
- ✅ openai.service.test.js - AI extraction, validation
- ⏳ email.service.test.js (if exists)

**Test Focus:**
- Business logic
- Data transformations
- External API calls (mocked)
- Error handling
- Data validation

**Example:**
```javascript
describe('extractPhysiotherapyData', () => {
  it('should extract pain scale', async () => {
    const result = await openaiService.extractPhysiotherapyData(transcription);
    expect(result.painScale.current).toBeDefined();
  });
});
```

---

#### 3. Model Tests (`__tests__/models/**/*.test.js`)

**Models to Test:**
- ✅ patient.test.js (existing)
- ⏳ session.model.test.js
- ⏳ template.model.test.js
- ⏳ user.model.test.js

**Test Focus:**
- Schema validation
- Virtual fields
- Model methods
- Pre/post hooks
- Unique constraints

---

### Running Backend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test template.routes.test.js

# Run in watch mode
npm test -- --watch

# Run verbose
npm test -- --verbose
```

**Coverage Goals:**
- Routes: >80%
- Services: >90%
- Models: >85%
- Middleware: >80%

---

## 🎭 E2E Tests (Future)

### Tech Stack

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **CI/CD**: GitHub Actions

### Critical Flows

1. **User Authentication**
   - Register → Login → Dashboard

2. **Session Management**
   - Create patient → Create session → Record audio → Save

3. **Template Usage**
   - Create template → Use in session → Generate note

4. **Multi-language**
   - Switch language → Verify translations

**Example:**
```javascript
test('complete session workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  await expect(page).toHaveURL('/dashboard');
  await page.click('text=New Session');
  // ... continue flow
});
```

---

## 📊 Coverage Reports

### Frontend Coverage

```bash
cd client && npm test -- --coverage
```

**Output:**
```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   75.23 |    68.45 |   80.12 |   76.34 |
 components/ui               |   85.67 |    78.90 |   90.23 |   87.45 |
  Button.jsx                 |   95.00 |    88.00 |  100.00 |   96.00 |
  Card.jsx                   |   92.00 |    85.00 |   95.00 |   93.00 |
 hooks                       |   78.45 |    71.23 |   82.34 |   79.56 |
  useSOAPNote.js             |   90.00 |    85.00 |   92.00 |   91.00 |
-----------------------------|---------|----------|---------|---------|
```

### Backend Coverage

```bash
cd server && npm test -- --coverage
```

**Output:**
```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   82.34 |    75.67 |   85.23 |   83.45 |
 routes                      |   88.90 |    82.34 |   92.45 |   90.12 |
  template.routes.js         |   95.00 |    90.00 |   98.00 |   96.00 |
 services                    |   75.67 |    68.90 |   78.45 |   76.78 |
  openai.service.js          |   85.00 |    80.00 |   87.00 |   86.00 |
-----------------------------|---------|----------|---------|---------|
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd client && npm ci
      - run: cd client && npm test -- --coverage
      - uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd server && npm ci
      - run: cd server && npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

---

## 📝 Testing Best Practices

### ✅ DO

1. **Test behavior, not implementation**
   ```javascript
   // ✅ Good
   expect(screen.getByRole('button')).toBeInTheDocument();
   
   // ❌ Bad
   expect(wrapper.find('.btn-class')).toHaveLength(1);
   ```

2. **Use semantic queries**
   ```javascript
   // ✅ Good (accessible)
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // ❌ Bad (brittle)
   screen.getByTestId('submit-btn')
   ```

3. **Test user interactions**
   ```javascript
   await userEvent.click(button);
   await userEvent.type(input, 'text');
   ```

4. **Mock external dependencies**
   ```javascript
   vi.mock('../services/api');
   ```

5. **Keep tests isolated**
   ```javascript
   afterEach(() => {
     cleanup();
     vi.clearAllMocks();
   });
   ```

### ❌ DON'T

1. Don't test implementation details
2. Don't test third-party libraries
3. Don't duplicate coverage
4. Don't skip edge cases
5. Don't write flaky tests

---

## 🎯 Current Status

### Completed ✅
- [x] Testing infrastructure setup
- [x] Frontend test utils and setup
- [x] Backend test configuration
- [x] 3 Component tests (Button, Card, Input)
- [x] 2 Hook tests (useSOAPNote, usePhysioData)
- [x] 2 Backend tests (template.routes, openai.service)

### In Progress 🚧
- [ ] Complete component test coverage
- [ ] Complete hook test coverage
- [ ] API route test coverage
- [ ] Service test coverage

### Planned 📋
- [ ] E2E test setup (Playwright)
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Performance tests (Lighthouse CI)
- [ ] Accessibility tests (axe-core)

---

## 📚 Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Next Steps:**
1. Run existing tests: `npm test`
2. Review coverage: `npm test -- --coverage`
3. Add missing tests for remaining components
4. Setup E2E tests for critical flows
5. Integrate with CI/CD pipeline
