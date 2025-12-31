const axios = require('axios');

/**
 * WHO ICD-11 API Service
 * Official API for International Classification of Diseases
 * Documentation: https://icd.who.int/icdapi
 * 
 * Benefits:
 * - Official WHO data (always up-to-date)
 * - Full code set with hierarchies
 * - Multi-language support
 * - Free with registration
 */

class ICDAPIService {
  constructor() {
    this.baseURL = 'https://id.who.int/icd';
    this.tokenURL = 'https://icdaccessmanagement.who.int/connect/token';
    this.clientId = process.env.ICD_API_CLIENT_ID;
    this.clientSecret = process.env.ICD_API_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Cache for API responses (24 hours)
    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Get OAuth2 access token
   * Token expires after 1 hour
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('ICD API credentials not configured. Set ICD_API_CLIENT_ID and ICD_API_CLIENT_SECRET in .env');
    }

    try {
      const response = await axios.post(
        this.tokenURL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'icdapi_access'
        }),
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get ICD API token:', error.message);
      throw new Error('Failed to authenticate with WHO ICD API');
    }
  }

  /**
   * Search ICD-11 codes
   * @param {string} searchTerm - Text to search (diagnosis, symptom, condition)
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching ICD codes
   */
  async search(searchTerm, options = {}) {
    const cacheKey = `search:${searchTerm}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('ICD search cache hit:', searchTerm);
      return cached;
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/release/11/2024-01/mms/search`,
        {
          params: {
            q: searchTerm,
            useFlexisearch: options.flexiSearch !== false,
            flatResults: options.flatResults !== false,
            medicalCodingMode: options.medicalCoding !== false
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'API-Version': 'v2',
            'Accept-Language': options.language || 'en'
          }
        }
      );

      const results = this.formatSearchResults(response.data);
      
      // Cache results
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error('ICD API search error:', error.message);
      
      // Return empty array if API fails (fallback to local data handled by caller)
      return [];
    }
  }

  /**
   * Get details for specific ICD code
   * @param {string} codeId - ICD code ID or URI
   * @returns {Promise<Object>} Code details
   */
  async getCodeDetails(codeId) {
    const cacheKey = `code:${codeId}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const token = await this.getAccessToken();
      
      // If codeId is not a full URI, construct it
      const uri = codeId.startsWith('http') 
        ? codeId 
        : `${this.baseURL}/release/11/2024-01/mms/${codeId}`;

      const response = await axios.get(uri, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'API-Version': 'v2',
          'Accept-Language': 'en'
        }
      });

      const details = this.formatCodeDetails(response.data);
      
      this.setCache(cacheKey, details);
      
      return details;
    } catch (error) {
      console.error('ICD API code details error:', error.message);
      throw error;
    }
  }

  /**
   * Get ICD codes by category (e.g., musculoskeletal disorders)
   * @param {string} categoryId - Category/chapter ID
   * @returns {Promise<Array>} Codes in category
   */
  async getByCategory(categoryId) {
    const cacheKey = `category:${categoryId}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/release/11/2024-01/mms/${categoryId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'API-Version': 'v2'
          }
        }
      );

      const codes = this.extractChildCodes(response.data);
      
      this.setCache(cacheKey, codes);
      
      return codes;
    } catch (error) {
      console.error('ICD API category error:', error.message);
      return [];
    }
  }

  /**
   * Format search results to match our application structure
   */
  formatSearchResults(data) {
    if (!data.destinationEntities) {
      return [];
    }

    return data.destinationEntities.map(entity => ({
      code: entity.theCode || entity.code,
      description: entity.title,
      icd11Id: entity.id,
      matchingPVs: entity.matchingPVs || [],
      score: entity.score,
      chapter: entity.chapter,
      source: 'WHO ICD-11 API',
      apiUrl: entity.id
    }));
  }

  /**
   * Format code details
   */
  formatCodeDetails(data) {
    return {
      code: data.code || data.theCode,
      description: data.title,
      definition: data.definition,
      longDefinition: data.longDefinition,
      fullySpecifiedName: data.fullySpecifiedName,
      synonyms: data.synonym || [],
      narrowerTerms: data.narrowerTerm || [],
      broaderTerms: data.parent || [],
      inclusions: data.inclusion || [],
      exclusions: data.exclusion || [],
      source: 'WHO ICD-11 API',
      lastUpdated: data.releaseDate || new Date().toISOString()
    };
  }

  /**
   * Extract child codes from category response
   */
  extractChildCodes(data) {
    if (!data.child) {
      return [];
    }

    return data.child.map(child => ({
      code: child.code,
      description: child.title,
      icd11Id: child.id,
      source: 'WHO ICD-11 API'
    }));
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
   * Clear cache (for testing or manual refresh)
   */
  clearCache() {
    this.cache.clear();
    console.log('ICD API cache cleared');
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

module.exports = new ICDAPIService();
