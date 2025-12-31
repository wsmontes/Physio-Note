/**
 * ICD-11 API Integration Tests
 * 
 * Tests REAL interactions with WHO ICD-11 API
 * These tests make actual API calls and should be run selectively
 * 
 * Run with: npm test __tests__/integration/icd-api.integration.test.js
 */

require('dotenv').config({ path: '.env.test' });
const axios = require('axios');

describe('ICD-11 API Integration Tests', () => {
  const ICD_API_URL = 'https://icdaccessmanagement.who.int';
  const ICD_API_BASE = 'https://id.who.int/icd';
  let accessToken;

  beforeAll(async () => {
    if (!process.env.ICD_API_CLIENT_ID || !process.env.ICD_API_CLIENT_SECRET) {
      throw new Error('ICD API credentials not configured in .env.test');
    }
  });

  describe('Authentication', () => {
    it('should obtain access token with valid credentials', async () => {
      const response = await axios.post(
        `${ICD_API_URL}/connect/token`,
        'grant_type=client_credentials&scope=icdapi_access',
        {
          auth: {
            username: process.env.ICD_API_CLIENT_ID,
            password: process.env.ICD_API_CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('token_type', 'Bearer');
      expect(response.data).toHaveProperty('expires_in');
      
      accessToken = response.data.access_token;
      expect(accessToken.length).toBeGreaterThan(50);
    }, 30000);

    it('should reject invalid credentials', async () => {
      await expect(async () => {
        await axios.post(
          `${ICD_API_URL}/connect/token`,
          'grant_type=client_credentials&scope=icdapi_access',
          {
            auth: {
              username: 'invalid-client-id',
              password: 'invalid-secret'
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      }).rejects.toThrow();
    }, 30000);
  });

  describe('Diagnosis Search', () => {
    beforeAll(async () => {
      if (!accessToken) {
        const response = await axios.post(
          `${ICD_API_URL}/connect/token`,
          'grant_type=client_credentials&scope=icdapi_access',
          {
            auth: {
              username: process.env.ICD_API_CLIENT_ID,
              password: process.env.ICD_API_CLIENT_SECRET
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        accessToken = response.data.access_token;
      }
    });

    it('should search for rotator cuff syndrome', async () => {
      const response = await axios.get(
        `${ICD_API_BASE}/release/11/2024-01/mms/search`,
        {
          params: {
            q: 'rotator cuff syndrome',
            flatResults: true,
            useFlexisearch: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'API-Version': 'v2',
            'Accept-Language': 'en'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('destinationEntities');
      expect(Array.isArray(response.data.destinationEntities)).toBe(true);
      expect(response.data.destinationEntities.length).toBeGreaterThan(0);
      
      const firstResult = response.data.destinationEntities[0];
      expect(firstResult).toHaveProperty('title');
      expect(firstResult.title.toLowerCase()).toContain('rotator');
    }, 30000);

    it('should search for knee osteoarthritis', async () => {
      const response = await axios.get(
        `${ICD_API_BASE}/release/11/2024-01/mms/search`,
        {
          params: {
            q: 'knee osteoarthritis',
            flatResults: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'API-Version': 'v2',
            'Accept-Language': 'en'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.destinationEntities.length).toBeGreaterThan(0);
      
      const results = response.data.destinationEntities;
      const hasKneeResult = results.some(r => 
        r.title.toLowerCase().includes('knee') || 
        r.title.toLowerCase().includes('osteoarthritis')
      );
      expect(hasKneeResult).toBe(true);
    }, 30000);

    it('should handle empty search results gracefully', async () => {
      const response = await axios.get(
        `${ICD_API_BASE}/release/11/2024-01/mms/search`,
        {
          params: {
            q: 'xyznonexistentcondition12345',
            flatResults: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'API-Version': 'v2',
            'Accept-Language': 'en'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('destinationEntities');
      // May return empty array or no matches
    }, 30000);
  });

  describe('Entity Details', () => {
    beforeAll(async () => {
      if (!accessToken) {
        const response = await axios.post(
          `${ICD_API_URL}/connect/token`,
          'grant_type=client_credentials&scope=icdapi_access',
          {
            auth: {
              username: process.env.ICD_API_CLIENT_ID,
              password: process.env.ICD_API_CLIENT_SECRET
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        accessToken = response.data.access_token;
      }
    });

    it('should retrieve details for a specific diagnosis code', async () => {
      // First search to get a valid entity URI
      const searchResponse = await axios.get(
        `${ICD_API_BASE}/release/11/2024-01/mms/search`,
        {
          params: {
            q: 'rotator cuff',
            flatResults: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'API-Version': 'v2',
            'Accept-Language': 'en'
          }
        }
      );

      expect(searchResponse.data.destinationEntities.length).toBeGreaterThan(0);
      const entityUri = searchResponse.data.destinationEntities[0].id;
      
      // Now get details for that entity
      const detailsResponse = await axios.get(entityUri, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'API-Version': 'v2',
          'Accept-Language': 'en'
        }
      });

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.data).toHaveProperty('title');
      expect(detailsResponse.data).toHaveProperty('@id');
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid access token', async () => {
      await expect(async () => {
        await axios.get(
          `${ICD_API_BASE}/release/11/2024-01/mms/search`,
          {
            params: { q: 'test' },
            headers: {
              'Authorization': 'Bearer invalid-token-12345',
              'Accept': 'application/json',
              'API-Version': 'v2'
            }
          }
        );
      }).rejects.toThrow();
    }, 30000);
  });
});
