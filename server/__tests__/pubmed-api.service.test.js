/**
 * PubMed API Service Tests
 * Tests NCBI E-utilities integration, rate limiting, and caching
 */

const pubmedApiService = require('../src/services/pubmed-api.service');
const axios = require('axios');

jest.mock('axios');

describe('PubMed API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pubmedApiService.clearCache?.();
  });

  describe('searchArticles', () => {
    it('should search PubMed for articles', async () => {
      // Mock esearch response (get PMIDs)
      axios.get.mockResolvedValueOnce({
        data: `<?xml version="1.0"?>
        <eSearchResult>
          <IdList>
            <Id>12345678</Id>
            <Id>87654321</Id>
          </IdList>
        </eSearchResult>`
      });

      // Mock efetch response (get article details)
      axios.get.mockResolvedValueOnce({
        data: `<?xml version="1.0"?>
        <PubmedArticleSet>
          <PubmedArticle>
            <MedlineCitation>
              <PMID>12345678</PMID>
              <Article>
                <ArticleTitle>Exercise for Rotator Cuff</ArticleTitle>
                <AuthorList>
                  <Author><LastName>Smith</LastName><ForeName>John</ForeName></Author>
                </AuthorList>
                <Journal>
                  <JournalIssue><PubDate><Year>2023</Year></PubDate></JournalIssue>
                </Journal>
                <Abstract><AbstractText>Study shows effectiveness...</AbstractText></Abstract>
              </Article>
            </MedlineCitation>
          </PubmedArticle>
        </PubmedArticleSet>`
      });

      const results = await pubmedApiService.searchArticles('rotator cuff exercise');

      expect(results).toHaveProperty('articles');
      expect(Array.isArray(results.articles)).toBe(true);
      expect(results.articles[0]).toHaveProperty('pmid');
      expect(results.articles[0]).toHaveProperty('title');
      expect(results.articles[0]).toHaveProperty('authors');
    });

    it('should filter by study type', async () => {
      axios.get.mockResolvedValueOnce({
        data: `<eSearchResult><IdList><Id>111</Id></IdList></eSearchResult>`
      });

      axios.get.mockResolvedValueOnce({
        data: `<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>111</PMID><Article><ArticleTitle>RCT Study</ArticleTitle></Article></MedlineCitation></PubmedArticle></PubmedArticleSet>`
      });

      await pubmedApiService.searchArticles('test', {
        studyType: 'randomizedTrials'
      });

      // Check that the search query included RCT filter
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('randomized controlled trial'),
        expect.any(Object)
      );
    });

    it('should respect maxResults parameter', async () => {
      const manyPmids = Array.from({ length: 20 }, (_, i) => `<Id>${i}</Id>`).join('');
      
      axios.get.mockResolvedValueOnce({
        data: `<eSearchResult><IdList>${manyPmids}</IdList></eSearchResult>`
      });

      axios.get.mockResolvedValueOnce({
        data: '<PubmedArticleSet></PubmedArticleSet>'
      });

      await pubmedApiService.searchArticles('test', { maxResults: 5 });

      // Should request only 5 results
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('retmax=5'),
        expect.any(Object)
      );
    });

    it('should cache search results for 7 days', async () => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList><Id>123</Id></IdList></eSearchResult>'
      });

      // First search
      await pubmedApiService.searchArticles('shoulder pain');
      // Second identical search
      await pubmedApiService.searchArticles('shoulder pain');

      // Should only call API once (cached)
      expect(axios.get).toHaveBeenCalledTimes(2); // esearch + efetch
    });

    it('should handle empty search results', async () => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList></IdList></eSearchResult>'
      });

      const results = await pubmedApiService.searchArticles('nonexistent term');

      expect(results.articles).toEqual([]);
    });
  });

  describe('getArticleDetails', () => {
    it('should fetch article details by PMID', async () => {
      axios.get.mockResolvedValue({
        data: `<PubmedArticleSet>
          <PubmedArticle>
            <MedlineCitation>
              <PMID>12345678</PMID>
              <Article>
                <ArticleTitle>Test Article</ArticleTitle>
                <AuthorList>
                  <Author><LastName>Doe</LastName><ForeName>Jane</ForeName></Author>
                </AuthorList>
                <Journal>
                  <Title>Test Journal</Title>
                  <JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue>
                </Journal>
                <Abstract><AbstractText>Test abstract text</AbstractText></Abstract>
              </Article>
            </MedlineCitation>
          </PubmedArticle>
        </PubmedArticleSet>`
      });

      const article = await pubmedApiService.getArticleDetails('12345678');

      expect(article).toHaveProperty('pmid', '12345678');
      expect(article).toHaveProperty('title', 'Test Article');
      expect(article).toHaveProperty('authors');
      expect(article).toHaveProperty('year', 2024);
      expect(article).toHaveProperty('abstract');
    });

    it('should handle invalid PMID', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const article = await pubmedApiService.getArticleDetails('invalid');

      expect(article).toBeNull();
    });

    it('should parse multiple authors correctly', async () => {
      axios.get.mockResolvedValue({
        data: `<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>123</PMID>
          <Article><ArticleTitle>Test</ArticleTitle>
          <AuthorList>
            <Author><LastName>Smith</LastName><ForeName>John</ForeName></Author>
            <Author><LastName>Jones</LastName><ForeName>Alice</ForeName></Author>
            <Author><LastName>Brown</LastName><ForeName>Bob</ForeName></Author>
          </AuthorList>
          </Article></MedlineCitation></PubmedArticle></PubmedArticleSet>`
      });

      const article = await pubmedApiService.getArticleDetails('123');

      expect(article.authors).toContain('Smith J');
      expect(article.authors).toContain('Jones A');
      expect(article.authors).toContain('Brown B');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect NCBI rate limit (3 requests/second)', async () => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList></IdList></eSearchResult>'
      });

      const start = Date.now();
      
      // Make 5 rapid requests
      await Promise.all([
        pubmedApiService.searchArticles('query1'),
        pubmedApiService.searchArticles('query2'),
        pubmedApiService.searchArticles('query3'),
        pubmedApiService.searchArticles('query4'),
        pubmedApiService.searchArticles('query5')
      ]);

      const elapsed = Date.now() - start;

      // Should take at least 1 second due to rate limiting
      // (5 requests at 3/sec = ~1.67 seconds minimum)
      expect(elapsed).toBeGreaterThan(1000);
    });
  });

  describe('Study Type Filters', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList></IdList></eSearchResult>'
      });
    });

    it('should filter for systematic reviews', async () => {
      await pubmedApiService.searchArticles('test', {
        studyType: 'systematicReviews'
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('systematic review'),
        expect.any(Object)
      );
    });

    it('should filter for RCTs', async () => {
      await pubmedApiService.searchArticles('test', {
        studyType: 'randomizedTrials'
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('randomized controlled trial'),
        expect.any(Object)
      );
    });

    it('should filter for guidelines', async () => {
      await pubmedApiService.searchArticles('test', {
        studyType: 'guidelines'
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('guideline'),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle XML parsing errors', async () => {
      axios.get.mockResolvedValue({
        data: 'invalid xml content'
      });

      await expect(
        pubmedApiService.searchArticles('test')
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network failure'));

      await expect(
        pubmedApiService.searchArticles('test')
      ).rejects.toThrow('Network failure');
    });

    it('should handle NCBI server errors (500)', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: 'Internal Server Error'
        }
      });

      await expect(
        pubmedApiService.searchArticles('test')
      ).rejects.toThrow();
    });

    it('should handle rate limit errors (429)', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 429,
          data: 'Rate limit exceeded'
        }
      });

      await expect(
        pubmedApiService.searchArticles('test')
      ).rejects.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should reject empty search query', async () => {
      await expect(
        pubmedApiService.searchArticles('')
      ).rejects.toThrow();
    });

    it('should reject query shorter than 3 characters', async () => {
      await expect(
        pubmedApiService.searchArticles('ab')
      ).rejects.toThrow();
    });

    it('should sanitize special characters', async () => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList></IdList></eSearchResult>'
      });

      await pubmedApiService.searchArticles('test & special "chars"');

      // Should encode special characters properly
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('test & special "chars"')),
        expect.any(Object)
      );
    });
  });

  describe('Cache Management', () => {
    it('should have clearCache method', () => {
      expect(typeof pubmedApiService.clearCache).toBe('function');
    });

    it('should cache with query and filters as key', async () => {
      axios.get.mockResolvedValue({
        data: '<eSearchResult><IdList></IdList></eSearchResult>'
      });

      // Same query but different filters should not hit cache
      await pubmedApiService.searchArticles('test', { studyType: 'systematicReviews' });
      await pubmedApiService.searchArticles('test', { studyType: 'randomizedTrials' });

      // Should call API twice (different cache keys)
      expect(axios.get.mock.calls.length).toBeGreaterThan(2);
    });
  });
});
