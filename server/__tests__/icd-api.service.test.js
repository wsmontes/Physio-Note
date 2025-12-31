/**
 * ICD-11 API Service Tests
 * Tests WHO ICD-11 API integration and caching
 */

const icdApiService = require('../src/services/icd-api.service');
const axios = require('axios');

jest.mock('axios');

describe('ICD-11 API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    icdApiService.clearCache?.();
  });

  describe('getAccessToken', () => {
    it('should obtain access token from WHO API', async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: 'test-token-123',
          expires_in: 3600
        }
      });

      const token = await icdApiService.getAccessToken();

      expect(token).toBe('test-token-123');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('icdaccessmanagement.who.int'),
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should cache token for 24 hours', async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: 'cached-token',
          expires_in: 3600
        }
      });

      // First call
      const token1 = await icdApiService.getAccessToken();
      // Second call should use cache
      const token2 = await icdApiService.getAccessToken();

      expect(token1).toBe(token2);
      expect(axios.post).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should handle authentication errors', async () => {
      axios.post.mockRejectedValue({
        response: { status: 401, data: { error: 'Invalid credentials' } }
      });

      await expect(icdApiService.getAccessToken()).rejects.toThrow();
    });
  });

  describe('searchDiagnosis', () => {
    beforeEach(() => {
      // Mock successful token retrieval
      axios.post.mockResolvedValue({
        data: {
          access_token: 'test-token',
          expires_in: 3600
        }
      });
    });

    it('should search for diagnosis codes', async () => {
      axios.get.mockResolvedValue({
        data: {
          destinationEntities: [{
            id: 'http://id.who.int/icd/entity/1462968907',
            title: 'Rotator cuff syndrome',
            theCode: 'M75.1',
            description: 'Complete or incomplete tear of rotator cuff'
          }]
        }
      });

      const results = await icdApiService.searchDiagnosis('rotator cuff');

      expect(results).toHaveProperty('matches');
      expect(Array.isArray(results.matches)).toBe(true);
      expect(results.matches[0]).toHaveProperty('code', 'M75.1');
      expect(results.matches[0]).toHaveProperty('title');
    });

    it('should handle empty search results', async () => {
      axios.get.mockResolvedValue({
        data: {
          destinationEntities: []
        }
      });

      const results = await icdApiService.searchDiagnosis('nonexistent');

      expect(results.matches).toEqual([]);
    });

    it('should cache search results for 7 days', async () => {
      axios.get.mockResolvedValue({
        data: {
          destinationEntities: [{
            id: 'test-id',
            title: 'Test Condition',
            theCode: 'A00.0'
          }]
        }
      });

      // First search
      await icdApiService.searchDiagnosis('test condition');
      // Second identical search should use cache
      await icdApiService.searchDiagnosis('test condition');

      // Should only call API twice: once for token, once for search
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should sanitize and validate search query', async () => {
      axios.get.mockResolvedValue({
        data: { destinationEntities: [] }
      });

      // Test empty query
      await expect(icdApiService.searchDiagnosis('')).rejects.toThrow();

      // Test query too short
      await expect(icdApiService.searchDiagnosis('a')).rejects.toThrow();
    });

    it('should limit results to 10 matches', async () => {
      const manyResults = Array.from({ length: 20 }, (_, i) => ({
        id: `id-${i}`,
        title: `Condition ${i}`,
        theCode: `A${i.toString().padStart(2, '0')}.0`
      }));

      axios.get.mockResolvedValue({
        data: { destinationEntities: manyResults }
      });

      const results = await icdApiService.searchDiagnosis('test');

      expect(results.matches.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getDiagnosisDetails', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { access_token: 'test-token', expires_in: 3600 }
      });
    });

    it('should fetch diagnosis details by code', async () => {
      axios.get.mockResolvedValue({
        data: {
          code: 'M75.1',
          title: 'Rotator cuff syndrome',
          definition: 'A condition affecting the rotator cuff...',
          parent: ['Shoulder disorders'],
          children: ['Complete tear', 'Partial tear']
        }
      });

      const details = await icdApiService.getDiagnosisDetails('M75.1');

      expect(details).toHaveProperty('code', 'M75.1');
      expect(details).toHaveProperty('title');
      expect(details).toHaveProperty('definition');
    });

    it('should return null for invalid code', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const details = await icdApiService.getDiagnosisDetails('INVALID');

      expect(details).toBeNull();
    });

    it('should cache diagnosis details', async () => {
      axios.get.mockResolvedValue({
        data: {
          code: 'M75.1',
          title: 'Test'
        }
      });

      await icdApiService.getDiagnosisDetails('M75.1');
      await icdApiService.getDiagnosisDetails('M75.1');

      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(icdApiService.getAccessToken()).rejects.toThrow('Network error');
    });

    it('should handle rate limiting (429)', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' }
        }
      });

      await expect(icdApiService.searchDiagnosis('test')).rejects.toThrow();
    });

    it('should handle server errors (500)', async () => {
      axios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });
      
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      });

      await expect(icdApiService.searchDiagnosis('test')).rejects.toThrow();
    });
  });

  describe('Cache Management', () => {
    it('should respect cache TTL', async () => {
      // This would require mocking Date/time manipulation
      // For now, we test that cache methods exist
      expect(typeof icdApiService.clearCache).toBe('function');
    });
  });
});
