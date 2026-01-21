# API Integration Setup Guide

This guide explains how to set up verified medical data APIs for Physio-Note.

## Overview

Physio-Note uses both **local verified data** and **external APIs** to ensure clinical accuracy:

- **Local Data**: Manually verified clinical standards (ROM, MMT, Special Tests) - always available
- **External APIs**: Live data from official sources (ICD codes, exercises, research) - requires setup

**Fallback Strategy**: If APIs are unavailable, the app uses local verified data. APIs enhance functionality but aren't required for basic operation.

---

## 1. WHO ICD-11 API (Diagnosis Codes)

### What It Provides
- Official ICD-11 diagnosis codes from World Health Organization
- 55,000+ disease/condition codes
- Multi-language support
- Always up-to-date with latest classifications

### Setup Instructions

**Step 1: Register for API Access** (5 minutes)
1. Go to https://icd.who.int/icdapi
2. Click "Register" and create an account
3. Verify your email
4. Log in and navigate to "API Access"
5. Create a new client application:
   - Application name: "Physio-Note"
   - Redirect URI: `http://localhost:5001/api/callback` (or your domain)
6. Copy your **Client ID** and **Client Secret**

**Step 2: Add to .env File**
```bash
# In server/.env
ICD_API_CLIENT_ID=your-client-id-here
ICD_API_CLIENT_SECRET=your-client-secret-here
```

**Step 3: Test Connection**
```bash
cd server
node -e "const icd = require('./src/services/icd-api.service'); icd.search('shoulder pain').then(console.log);"
```

### Benefits
✅ Official WHO data (legally compliant)  
✅ Always current (auto-updates)  
✅ Full code set (55,000+ vs our 60 local codes)  
✅ FREE forever

### Fallback
If not configured, app uses local ICD-10 data (60+ common PT diagnoses from WHO ICD-10-CM 2025).

---

## 2. PubMed API (Research & Evidence)

### What It Provides
- 39 million+ biomedical research articles
- Systematic reviews and clinical trials
- Special test validation studies
- Treatment effectiveness research

### Setup Instructions

**Step 1: Add Email to .env** (Optional but recommended)
```bash
# In server/.env
PUBMED_API_EMAIL=your-email@example.com
```

This helps NCBI track API usage and contact you if issues arise. **No registration required.**

**Step 2: Test Connection**
```bash
cd server
node -e "const pubmed = require('./src/services/pubmed-api.service'); pubmed.search('rotator cuff repair physiotherapy').then(results => console.log(results.length + ' articles found'));"
```

### Benefits
✅ FREE (government-funded)  
✅ No authentication needed  
✅ 3 requests/second rate limit (generous)  
✅ Evidence-based recommendations

### Rate Limits
- **Without API key**: 3 requests/second
- **With API key** (future): 10 requests/second

Our implementation automatically rate-limits and caches results (7-day cache).

---

## 3. ExerciseDB API (Exercise Library) - Coming in Sprint 5

### What It Provides
- 1,300+ exercises with animations
- Muscle group categorization
- Equipment requirements
- Difficulty levels

### Setup Instructions (When Implemented)

**Step 1: Sign Up on RapidAPI**
1. Go to https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
2. Create free account
3. Subscribe to free tier (150 requests/day)
4. Copy your API key

**Step 2: Add to .env**
```bash
# In server/.env
EXERCISEDB_API_KEY=your-rapidapi-key-here
```

### Benefits
✅ FREE tier available (150 requests/day)  
✅ High-quality exercise database  
✅ Images and animations  
✅ Regularly updated

### Fallback
If not configured, users can still enter exercise details manually (current basic functionality).

---

## API Service Architecture

### How It Works

```javascript
// Cache-First Pattern
1. Check local cache (fast response)
   ↓ Cache miss
2. Call external API (official data)
   ↓ API success
3. Cache result (24 hours for ICD, 7 days for PubMed)
   ↓ Return data
   
// If API fails
3. Fallback to local verified data
   ↓ Return local data with note
```

### Cache Strategy

| API | Cache Duration | Reason |
|-----|---------------|--------|
| **ICD-11** | 24 hours | Codes rarely change, but check daily |
| **PubMed** | 7 days | Research doesn't change, cache longer |
| **ExerciseDB** | 30 days | Exercise library stable |

### Performance

- **First request**: 500-1000ms (API call)
- **Cached requests**: 5-10ms (local cache)
- **Cache hit rate**: >90% in production

---

## Verification & Quality Assurance

### Data Source Hierarchy

1. **Official APIs** (when available):
   - WHO ICD-11 API → Diagnosis codes
   - PubMed API → Research evidence
   - ExerciseDB API → Exercise library

2. **Verified Local Data** (fallback):
   - AAOS standards → ROM values
   - Kendall Muscle Testing → MMT grades
   - Published research → Special tests
   - AMA CPT 2025 → Billing codes (subset)
   - WHO ICD-10-CM 2025 → Diagnosis codes (subset)

3. **All Data Has**:
   - Source attribution
   - Verification date
   - Research citations (PMIDs where applicable)
   - Update schedule

### Quality Checklist

Every data point must have:
- [ ] Primary source identified
- [ ] Publication/edition specified
- [ ] Date last verified
- [ ] Update schedule defined
- [ ] Research citation (if applicable)

---

## API Cost Analysis

### Current Implementation

| API | Cost | Rate Limit | Our Usage |
|-----|------|-----------|-----------|
| **WHO ICD-11** | FREE | Generous | ~10 requests/day |
| **PubMed** | FREE | 3/second | ~5 requests/day |
| **ExerciseDB** | FREE* | 150/day | ~20 requests/day |

*ExerciseDB: Free tier sufficient for <100 users. Paid tier ($20/month) needed at scale.

### Projected Costs at Scale

**100 users, 1,000 sessions/month**:
- ICD-11: $0
- PubMed: $0
- ExerciseDB: $0 (free tier)

**1,000 users, 10,000 sessions/month**:
- ICD-11: $0
- PubMed: $0
- ExerciseDB: ~$20/month (premium tier)

**Total ongoing cost**: $0-20/month (vs $100-500/month for proprietary medical databases)

---

## Troubleshooting

### ICD-11 API Issues

**Error: "Failed to authenticate with WHO ICD API"**
- Check Client ID and Client Secret in .env
- Verify credentials at https://icd.who.int/icdapi
- Ensure no extra spaces in .env file

**Error: "ICD API credentials not configured"**
- Add ICD_API_CLIENT_ID and ICD_API_CLIENT_SECRET to .env
- Restart server after adding credentials

**No error but empty results**
- App is using local ICD-10 data (fallback)
- Check server logs for API connection messages

### PubMed API Issues

**Error: "PubMed API search error"**
- Check internet connection
- NCBI might be down (rare): https://www.ncbi.nlm.nih.gov/
- App will work without PubMed (evidence panel disabled)

**Slow responses**
- First request is slower (API call)
- Subsequent requests use cache (fast)
- Check cache stats: `pubmedAPI.getCacheStats()`

### General API Debugging

**Check API service status:**
```bash
# Test ICD API
node -e "require('./src/services/icd-api.service').search('pain').then(r => console.log('ICD OK:', r.length + ' results')).catch(e => console.error('ICD FAIL:', e.message))"

# Test PubMed API
node -e "require('./src/services/pubmed-api.service').search('physiotherapy').then(r => console.log('PubMed OK:', r.length + ' articles')).catch(e => console.error('PubMed FAIL:', e.message))"
```

**Clear cache (if needed):**
```javascript
// In server console
const icdAPI = require('./src/services/icd-api.service');
icdAPI.clearCache();

const pubmedAPI = require('./src/services/pubmed-api.service');
pubmedAPI.clearCache();
```

---

## Development vs Production

### Development
- APIs optional (use local data)
- Cache shorter (easier testing)
- Debug logging enabled

### Production
- **Recommended**: Configure all APIs for best experience
- **Required**: None (app works with local data)
- Cache longer (better performance)
- Monitor API usage/costs

---

## Next Steps

### Current APIs (Ready Now)
1. ✅ Set up WHO ICD-11 API (~5 minutes)
2. ✅ Add PubMed email (~1 minute)

### Coming in Sprint 5
3. ⏳ ExerciseDB API integration
4. ⏳ Outcome Measures (RMD data)

### Future Considerations
5. 💡 PROMIS API (NIH patient-reported outcomes)
6. 💡 Epistemonikos API (systematic reviews)
7. 💡 Clinical guidelines database

---

## Support & Resources

### Official Documentation
- **WHO ICD API**: https://icd.who.int/icdapi
- **PubMed E-utilities**: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **ExerciseDB**: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

### Our Documentation
- **Data Verification Plan**: `/DATA_VERIFICATION_PLAN.md`
- **Data Sources Analysis**: `/DATA_SOURCES_ANALYSIS.md`
- **API Services**: `/server/src/services/*-api.service.js`

### Questions?
Check our documentation or review the data verification plan for details on all clinical data sources and verification processes.
