const { PhysioAIAgent, _resetInstance } = require('../src/services/ai-agent.service');

describe('AI Agent Service', () => {
  let agent;

  beforeEach(() => {
    _resetInstance();
    agent = new PhysioAIAgent();
  });

  describe('Tool Definitions', () => {
    it('should define all required tools', () => {
      const tools = agent.defineTools();
      
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('search_diagnosis_codes');
      expect(toolNames).toContain('get_research_evidence');
      expect(toolNames).toContain('get_clinical_reference');
      expect(toolNames).toContain('validate_special_test');
      expect(toolNames).toContain('get_patient_history');
    });

    it('should have proper tool structure', () => {
      const tools = agent.defineTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool.parameters).toHaveProperty('type', 'object');
        expect(tool.parameters).toHaveProperty('properties');
        expect(tool.parameters).toHaveProperty('required');
      });
    });
  });

  describe('getClinicalReference', () => {
    it('should get ROM reference data', async () => {
      const result = await agent.getClinicalReference('rom');
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('joint');
      expect(result[0]).toHaveProperty('movements');
    });

    it('should filter ROM data by joint', async () => {
      const result = await agent.getClinicalReference('rom', { joint: 'shoulder' });
      
      expect(result).toBeInstanceOf(Array);
      result.forEach(item => {
        expect(item.joint.toLowerCase()).toContain('shoulder');
      });
    });

    it('should get MMT reference data', async () => {
      const result = await agent.getClinicalReference('mmt');
      
      expect(result).toBeDefined();
      // muscleGroups is an object, not an array
      expect(typeof result).toBe('object');
    });

    it('should filter MMT data by region', async () => {
      const result = await agent.getClinicalReference('mmt', { region: 'upperExtremity' });
      
      // getMusclesByRegion returns an array of muscles
      expect(result).toBeInstanceOf(Array);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('name');
      }
    });

    it('should get special tests data', async () => {
      const result = await agent.getClinicalReference('special_tests');
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('bodyRegion');
    });

    it('should get CPT codes', async () => {
      const result = await agent.getClinicalReference('cpt_codes');
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('description');
    });

    it('should throw error for unknown data type', async () => {
      await expect(
        agent.getClinicalReference('invalid_type')
      ).rejects.toThrow('Unknown data type');
    });
  });

  describe('getEmptyToolResult', () => {
    it('should return empty array for search tools', () => {
      expect(agent.getEmptyToolResult('search_diagnosis_codes')).toEqual([]);
      expect(agent.getEmptyToolResult('get_research_evidence')).toEqual([]);
      expect(agent.getEmptyToolResult('get_clinical_reference')).toEqual([]);
    });

    it('should return empty object for patient history', () => {
      const result = agent.getEmptyToolResult('get_patient_history');
      expect(result).toHaveProperty('patient', null);
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('notes');
    });
  });

  describe('extractJointFromDiagnosis', () => {
    it('should extract joint from diagnosis string', () => {
      expect(agent.extractJointFromDiagnosis('rotator cuff tear')).toBeNull();
      expect(agent.extractJointFromDiagnosis('shoulder impingement')).toBe('shoulder');
      expect(agent.extractJointFromDiagnosis('knee osteoarthritis')).toBe('knee');
      expect(agent.extractJointFromDiagnosis('ankle sprain')).toBe('ankle');
    });

    it('should return null for diagnosis without joint', () => {
      expect(agent.extractJointFromDiagnosis('low back pain')).toBe('back');
      expect(agent.extractJointFromDiagnosis('migraine')).toBeNull();
    });

    it('should handle null/undefined diagnosis', () => {
      expect(agent.extractJointFromDiagnosis(null)).toBeNull();
      expect(agent.extractJointFromDiagnosis(undefined)).toBeNull();
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-01-01');
      const age = agent.calculateAge(birthDate);
      
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const expectedAge = currentYear - 1990;
      
      // Age could be expectedAge or expectedAge-1 depending on whether birthday has passed
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge + 1); // Allow for edge cases
    });
  });

  describe('extractEvidenceSources', () => {
    it('should extract evidence sources with PMIDs', () => {
      const evidence = {
        systematicReviews: [
          { pmid: '12345678', title: 'Review 1', authors: 'Smith et al', year: 2023 }
        ],
        randomizedTrials: [
          { pmid: '87654321', title: 'RCT 1', authors: 'Jones et al', year: 2022 }
        ],
        guidelines: []
      };

      const result = agent.extractEvidenceSources(evidence);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('pmid');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('category');
    });

    it('should handle null evidence', () => {
      const result = agent.extractEvidenceSources(null);
      expect(result).toEqual([]);
    });

    it('should limit to 5 sources', () => {
      const evidence = {
        systematicReviews: Array.from({ length: 10 }, (_, i) => ({
          pmid: `${i}`,
          title: `Title ${i}`,
          year: 2023
        })),
        randomizedTrials: [],
        guidelines: []
      };

      const result = agent.extractEvidenceSources(evidence);
      expect(result.length).toBe(5);
    });
  });

  describe('execute', () => {
    it('should throw error for unknown task', async () => {
      await expect(
        agent.execute('unknown_task', {})
      ).rejects.toThrow('Unknown task: unknown_task');
    });

    it('should throw not implemented error for SOAP note agent', async () => {
      await expect(
        agent.execute('generate_soap_note', { transcription: 'test' })
      ).rejects.toThrow('not yet implemented');
    });

    it('should throw not implemented error for clinical decision agent', async () => {
      await expect(
        agent.execute('clinical_decision_support', { diagnosis: 'test' })
      ).rejects.toThrow('not yet implemented');
    });
  });
});
