/**
 * PubMed API Integration Tests
 * 
 * Tests REAL interactions with NCBI PubMed E-utilities API
 * These tests make actual API calls and should be run selectively
 * 
 * Run with: npm test __tests__/integration/pubmed-api.integration.test.js
 * 
 * IMPORTANT: PubMed rate limit is 3 requests/second without API key
 * Tests include 400ms delays between requests to avoid 429 errors
 */

require('dotenv').config({ path: '.env.test' });
const axios = require('axios');

// Helper to avoid rate limiting (3 req/sec = ~333ms minimum)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('PubMed API Integration Tests', () => {
  const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const email = process.env.PUBMED_API_EMAIL || 'test@example.com';
  const RATE_LIMIT_DELAY = 400; // ms between requests

  // Add delay after each test to avoid rate limiting
  afterEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('Article Search', () => {
    it('should search for rotator cuff exercise articles', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'rotator cuff exercise',
          retmode: 'json',
          retmax: 10,
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('esearchresult');
      expect(response.data.esearchresult).toHaveProperty('idlist');
      expect(Array.isArray(response.data.esearchresult.idlist)).toBe(true);
      expect(response.data.esearchresult.idlist.length).toBeGreaterThan(0);
      
      // Should have reasonable count
      const count = parseInt(response.data.esearchresult.count);
      expect(count).toBeGreaterThan(100); // Should find many articles
    }, 30000);

    it('should search with study type filter (systematic reviews)', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'rotator cuff exercise AND systematic[sb]',
          retmode: 'json',
          retmax: 5,
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.esearchresult.idlist.length).toBeGreaterThan(0);
    }, 30000);

    it('should search for knee osteoarthritis treatment', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'knee osteoarthritis treatment exercise',
          retmode: 'json',
          retmax: 10,
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.esearchresult.idlist.length).toBeGreaterThan(0);
      
      const count = parseInt(response.data.esearchresult.count);
      expect(count).toBeGreaterThan(50);
    }, 30000);
  });

  describe('Article Details', () => {
    let pmids = [];

    beforeAll(async () => {
      // Get some PMIDs first
      await delay(RATE_LIMIT_DELAY);
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'physical therapy',
          retmode: 'json',
          retmax: 3,
          email: email
        }
      });
      pmids = response.data.esearchresult.idlist;
      await delay(RATE_LIMIT_DELAY);
    });

    it('should fetch article details by PMID', async () => {
      expect(pmids.length).toBeGreaterThan(0);
      
      const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi`;
      const response = await axios.get(summaryUrl, {
        params: {
          db: 'pubmed',
          id: pmids.join(','),
          retmode: 'json',
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('result');
      
      const firstPmid = pmids[0];
      expect(response.data.result).toHaveProperty(firstPmid);
      
      const article = response.data.result[firstPmid];
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('authors');
      expect(article.title.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle multiple article fetches', async () => {
      expect(pmids.length).toBeGreaterThanOrEqual(2);
      
      const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi`;
      const response = await axios.get(summaryUrl, {
        params: {
          db: 'pubmed',
          id: pmids.slice(0, 3).join(','),
          retmode: 'json',
          email: email
        }
      });

      expect(response.status).toBe(200);
      
      // Should have results for all requested PMIDs
      pmids.slice(0, 3).forEach(pmid => {
        expect(response.data.result).toHaveProperty(pmid);
      });
    }, 30000);
  });

  describe('Complex Queries', () => {
    it('should search with date range filter', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      const currentYear = new Date().getFullYear();
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: `rotator cuff AND ${currentYear - 2}:${currentYear}[dp]`,
          retmode: 'json',
          retmax: 10,
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.esearchresult.idlist.length).toBeGreaterThan(0);
    }, 30000);

    it('should search with multiple filters (RCT + recent)', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'shoulder pain AND randomized controlled trial[pt] AND 2020:2025[dp]',
          retmode: 'json',
          retmax: 10,
          email: email
        }
      });

      expect(response.status).toBe(200);
      // May or may not have results depending on the specific query
      expect(response.data).toHaveProperty('esearchresult');
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle empty search results', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      
      const response = await axios.get(searchUrl, {
        params: {
          db: 'pubmed',
          term: 'xyznonexistentcondition98765',
          retmode: 'json',
          retmax: 10,
          email: email
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.esearchresult.idlist).toEqual([]);
      expect(parseInt(response.data.esearchresult.count)).toBe(0);
    }, 30000);

    it('should handle invalid PMID gracefully', async () => {
      const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi`;
      
      const response = await axios.get(summaryUrl, {
        params: {
          db: 'pubmed',
          id: '999999999999', // Invalid PMID
          retmode: 'json',
          email: email
        }
      });

      // Should return 200 but with error in result
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('result');
    }, 30000);
  });

  describe('Rate Limiting Awareness', () => {
    it('should respect API rate limits with sequential requests', async () => {
      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Make 3 requests with small delay
      for (let i = 0; i < 3; i++) {
        const response = await axios.get(searchUrl, {
          params: {
            db: 'pubmed',
            term: `test query ${i}`,
            retmode: 'json',
            retmax: 1,
            email: email
          }
        });
        
        expect(response.status).toBe(200);
        
        // Wait 340ms between requests (NCBI recommends 3 requests/second)
        if (i < 2) await delay(340);
      }
    }, 30000);
  });
});
