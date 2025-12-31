# Testing Strategy - Physio-Note AI Services

## Philosophy

**Test AI behavior, not implementation**
- Focus on outputs and clinical correctness
- Use contract testing for external APIs
- Keep integration tests separate from unit tests

## Structure

```
__tests__/
├── unit/              # Fast, isolated tests (mocked dependencies)
│   ├── services/
│   └── utils/
├── integration/       # Real API calls (rate-limited, slower)
│   ├── icd-api.integration.test.js
│   ├── pubmed-api.integration.test.js
│   └── openai.integration.test.js
└── e2e/              # End-to-end workflows (full AI agent)
    └── ai-agent.e2e.test.js
```

## Best Practices for AI Testing

### 1. **Contract Testing** (Unit Level)
Test that your code sends correct requests and handles responses properly:
- ✅ Validate request structure
- ✅ Handle expected response formats
- ✅ Error handling for common failures
- ❌ Don't test the AI model itself

### 2. **Integration Testing** (Controlled Environment)
Test real API interactions with rate limiting:
- Use actual credentials from `.env.test`
- Limit concurrent requests
- Cache responses when possible
- Mark with `@integration` tag for selective running

### 3. **End-to-End Testing** (Full Workflows)
Test complete clinical scenarios:
- Real patient data structures
- Multi-step AI workflows
- Clinical correctness validation
- Longer timeouts (5+ minutes)

## Running Tests

```bash
# Unit tests only (fast, default)
npm test

# Integration tests (slower, real APIs)
npm test -- --testPathPattern=integration

# E2E tests (slowest, full workflows)
npm test -- --testPathPattern=e2e

# Specific test file
npm test -- openai.integration.test.js
```

## Writing New AI Tests

### DO ✅
```javascript
// Test your code's behavior
it('should format ICD search query correctly', () => {
  const formatted = formatICDQuery('rotator cuff syndrome');
  expect(formatted).toMatch(/rotator.*cuff/i);
});

// Test error handling
it('should retry on rate limit error', async () => {
  const result = await searchWithRetry('test', { maxRetries: 3 });
  expect(result).toBeDefined();
});

// Test clinical validation
it('should generate safe exercise dosage', () => {
  const exercise = result.exercises[0];
  expect(exercise.sets).toBeGreaterThanOrEqual(1);
  expect(exercise.sets).toBeLessThanOrEqual(5);
});
```

### DON'T ❌
```javascript
// Don't test the AI model's creativity
expect(response).toContain('specific wording'); // Too brittle

// Don't test exact JSON structure from AI
expect(aiResponse).toEqual({ exact: 'object' }); // Will break

// Don't mock OpenAI in integration tests
jest.mock('openai'); // Defeats the purpose
```

## Fixtures

Use realistic clinical data in `__tests__/fixtures/`:
- `clinical-scenarios.js` - Patient cases
- `mock-responses.js` - API response examples
- `test-data.js` - Reference data (ROM, MMT, etc.)

## Timeout Guidelines

- Unit tests: 5 seconds (default)
- Integration tests: 30 seconds
- E2E tests: 300 seconds (5 minutes)

## Environment Variables

Tests use `.env.test` which should have:
- Real API keys for integration/e2e tests
- Test database connection
- Longer timeout configurations
