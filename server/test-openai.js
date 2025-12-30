require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  console.log('=== OpenAI Connection Test ===\n');
  
  console.log('1. Checking API Key...');
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    return;
  }
  console.log('✅ API Key found:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
  
  console.log('\n2. Testing model:', process.env.OPENAI_MODEL || 'gpt-5-nano');
  
  const transcription = 'The patient came to the office with a bruise and complained of a pain in his left knee. Doing the first evaluation, it seems that the pain is on the right side of the left knee. And the pain only happens when he moves his knee. When the knee is still, there is no pain. And he had an accident on the stairs.';
  
  const systemPrompt = `You are an expert physiotherapist creating clinical SOAP notes. Extract information from the transcription and structure it into these four sections:

Subjective:
[Patient's complaints, symptoms, history]

Objective:
[Physical findings, tests, measurements (ROM, strength, gait, posture)]

Assessment:
[Clinical impression, progress, functional status]

Plan:
[Treatment plan, exercises, follow-up, patient education]

Be precise, use medical terminology, and maintain professional clinical documentation standards. Always include all four sections even if some are brief.`;

  const userPrompt = `Transcription of clinical session:

${transcription}

Generate a structured clinical note from this information.`;

  console.log('\n3. Sending request to OpenAI...');
  console.log('   Model:', process.env.OPENAI_MODEL || 'gpt-5-nano');
  console.log('   Transcription length:', transcription.length, 'characters');
  
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 2000
    });

    console.log('\n4. ✅ Response received!');
    console.log('\n=== RAW OPENAI RESPONSE ===');
    console.log(completion.choices[0].message.content);
    console.log('\n=== END RESPONSE ===\n');
    
    console.log('Response stats:');
    console.log('  - Length:', completion.choices[0].message.content?.length, 'characters');
    console.log('  - Model used:', completion.model);
    console.log('  - Tokens used:', completion.usage);
    
    // Test parsing
    console.log('\n5. Testing parsing...');
    const content = completion.choices[0].message.content;
    const sections = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };

    const lines = content.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      const lower = line.toLowerCase().trim();
      
      if (lower.startsWith('subjective') || lower === 's:') {
        currentSection = 'subjective';
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && line.length > colonIndex + 1) {
          sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
        }
      } else if (lower.startsWith('objective') || lower === 'o:') {
        currentSection = 'objective';
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && line.length > colonIndex + 1) {
          sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
        }
      } else if (lower.startsWith('assessment') || lower === 'a:') {
        currentSection = 'assessment';
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && line.length > colonIndex + 1) {
          sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
        }
      } else if (lower.startsWith('plan') || lower === 'p:') {
        currentSection = 'plan';
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && line.length > colonIndex + 1) {
          sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
        }
      } else if (currentSection && line.trim()) {
        sections[currentSection] += line.trim() + '\n';
      }
    });

    console.log('\n=== PARSED SECTIONS ===');
    console.log('Subjective:', sections.subjective ? `✅ (${sections.subjective.length} chars)` : '❌ EMPTY');
    console.log('Objective:', sections.objective ? `✅ (${sections.objective.length} chars)` : '❌ EMPTY');
    console.log('Assessment:', sections.assessment ? `✅ (${sections.assessment.length} chars)` : '❌ EMPTY');
    console.log('Plan:', sections.plan ? `✅ (${sections.plan.length} chars)` : '❌ EMPTY');
    
    if (sections.subjective) console.log('\nSubjective content:\n' + sections.subjective);
    if (sections.objective) console.log('\nObjective content:\n' + sections.objective);
    if (sections.assessment) console.log('\nAssessment content:\n' + sections.assessment);
    if (sections.plan) console.log('\nPlan content:\n' + sections.plan);
    
    console.log('\n✅ ALL TESTS PASSED!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('\nFull error:', error);
  }
}

testOpenAI().catch(console.error);
