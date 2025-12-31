const axios = require('axios');
const xml2js = require('xml2js');

/**
 * PubMed E-utilities API Service
 * NCBI's free API for accessing 39M+ biomedical citations
 * Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 * 
 * Benefits:
 * - FREE, no authentication required
 * - 39 million+ citations
 * - Full-text articles in PubMed Central
 * - Systematic reviews, RCTs, guidelines
 * - Rate limit: 3 requests/second
 */

class PubMedAPIService {
  constructor() {
    this.baseURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    this.tool = 'PhysioNote';
    this.email = process.env.PUBMED_API_EMAIL || 'admin@physionote.com';
    
    // Cache for API responses (7 days for literature searches)
    this.cache = new Map();
    this.cacheTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Rate limiting (3 requests/second max)
    this.lastRequestTime = 0;
    this.minRequestInterval = 334; // ~3 per second
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Search PubMed for articles
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of articles
   */
  async search(query, options = {}) {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('PubMed cache hit:', query);
      return cached;
    }

    try {
      // Step 1: Search for PMIDs
      await this.rateLimit();
      
      const searchResponse = await axios.get(`${this.baseURL}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: this.buildSearchTerm(query, options),
          retmax: options.maxResults || 10,
          sort: options.sort || 'relevance',
          retmode: 'json',
          tool: this.tool,
          email: this.email
        }
      });

      const pmids = searchResponse.data.esearchresult.idlist;
      
      if (!pmids || pmids.length === 0) {
        return [];
      }

      // Step 2: Fetch article details
      await this.rateLimit();
      
      const summaryResponse = await axios.get(`${this.baseURL}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: pmids.join(','),
          retmode: 'json',
          tool: this.tool,
          email: this.email
        }
      });

      const articles = this.formatArticles(summaryResponse.data.result, pmids);
      
      this.setCache(cacheKey, articles);
      
      return articles;
    } catch (error) {
      console.error('PubMed API search error:', error.message);
      return [];
    }
  }

  /**
   * Build search term with filters for physiotherapy research
   */
  buildSearchTerm(query, options = {}) {
    let searchTerm = query;
    
    // Add physiotherapy context if not already in query
    if (!query.toLowerCase().includes('physiotherapy') && 
        !query.toLowerCase().includes('physical therapy')) {
      searchTerm += ' AND (physiotherapy[MeSH] OR physical therapy[MeSH])';
    }
    
    // Filter by article type
    if (options.studyType === 'systematic-review') {
      searchTerm += ' AND systematic review[PT]';
    } else if (options.studyType === 'rct') {
      searchTerm += ' AND randomized controlled trial[PT]';
    } else if (options.studyType === 'guideline') {
      searchTerm += ' AND (guideline[PT] OR practice guideline[PT])';
    }
    
    // Filter by recency
    if (options.yearsBack) {
      const startYear = new Date().getFullYear() - options.yearsBack;
      searchTerm += ` AND ${startYear}:3000[DP]`;
    }
    
    // Free full text only
    if (options.freeFullText) {
      searchTerm += ' AND free full text[SB]';
    }
    
    return searchTerm;
  }

  /**
   * Get evidence summary for a specific condition
   * Optimized for clinical decision support
   */
  async getEvidenceSummary(condition, options = {}) {
    const cacheKey = `evidence:${condition}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Search for systematic reviews first (highest evidence)
    const reviews = await this.search(condition, {
      studyType: 'systematic-review',
      maxResults: 5,
      yearsBack: 5,
      sort: 'relevance'
    });

    // Search for recent RCTs
    const rcts = await this.search(condition, {
      studyType: 'rct',
      maxResults: 5,
      yearsBack: 3,
      sort: 'date'
    });

    // Search for guidelines
    const guidelines = await this.search(condition, {
      studyType: 'guideline',
      maxResults: 3,
      yearsBack: 10
    });

    const summary = {
      condition,
      systematicReviews: reviews,
      randomizedTrials: rcts,
      guidelines: guidelines,
      lastUpdated: new Date().toISOString(),
      source: 'PubMed/MEDLINE'
    };

    this.setCache(cacheKey, summary);
    
    return summary;
  }

  /**
   * Search for intervention effectiveness
   * e.g., "manual therapy for low back pain"
   */
  async searchIntervention(intervention, condition, options = {}) {
    const query = `${intervention} AND ${condition}`;
    
    return await this.search(query, {
      studyType: options.studyType || 'systematic-review',
      maxResults: options.maxResults || 10,
      yearsBack: options.yearsBack || 5
    });
  }

  /**
   * Validate special test (get diagnostic accuracy studies)
   */
  async validateSpecialTest(testName, bodyRegion, options = {}) {
    const query = `${testName} AND (sensitivity OR specificity OR diagnostic accuracy) AND ${bodyRegion}`;
    
    return await this.search(query, {
      maxResults: options.maxResults || 5,
      yearsBack: 10,
      sort: 'relevance'
    });
  }

  /**
   * Get article abstract
   */
  async getAbstract(pmid) {
    const cacheKey = `abstract:${pmid}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/efetch.fcgi`, {
        params: {
          db: 'pubmed',
          id: pmid,
          rettype: 'abstract',
          retmode: 'xml',
          tool: this.tool,
          email: this.email
        }
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      
      const article = result.PubmedArticleSet?.PubmedArticle?.[0];
      if (!article) {
        return null;
      }

      const abstract = this.extractAbstract(article);
      
      this.setCache(cacheKey, abstract);
      
      return abstract;
    } catch (error) {
      console.error('PubMed abstract fetch error:', error.message);
      return null;
    }
  }

  /**
   * Format articles from API response
   */
  formatArticles(result, pmids) {
    return pmids.map(pmid => {
      const article = result[pmid];
      
      if (!article || article.error) {
        return null;
      }

      return {
        pmid: pmid,
        title: article.title,
        authors: article.authors?.map(a => a.name).join(', ') || 'Unknown',
        journal: article.fulljournalname || article.source,
        year: article.pubdate?.substring(0, 4),
        volume: article.volume,
        issue: article.issue,
        pages: article.pages,
        doi: article.elocationid?.match(/doi: (.+)/)?.[1],
        pubType: article.pubtype || [],
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        pmc: article.pmcrefcount > 0 ? `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmid}/` : null,
        source: 'PubMed'
      };
    }).filter(Boolean);
  }

  /**
   * Extract abstract from XML
   */
  extractAbstract(article) {
    const abstractTexts = article.MedlineCitation?.[0]?.Article?.[0]?.Abstract?.[0]?.AbstractText;
    
    if (!abstractTexts) {
      return 'Abstract not available';
    }

    if (Array.isArray(abstractTexts)) {
      return abstractTexts.map(text => {
        if (typeof text === 'object' && text._) {
          const label = text.$.Label || '';
          return label ? `${label}: ${text._}` : text._;
        }
        return text;
      }).join('\n\n');
    }

    return abstractTexts;
  }

  /**
   * Cache helpers
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTTL
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('PubMed API cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new PubMedAPIService();
