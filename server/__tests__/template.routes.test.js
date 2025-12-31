const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./test-app');
const User = require('../src/models/user.model');
const Template = require('../src/models/template.model');

let mongoServer;
let authToken;
let userId;

describe('Template API Integration Tests', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // Create test user and get auth token
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    });
    
    userId = user._id;
    
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Template.deleteMany({});
  });

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'Orthopedic Evaluation',
        description: 'Initial evaluation for orthopedic patients',
        type: 'evaluation',
        specialty: 'orthopedic',
        structure: {
          sections: [
            {
              name: 'chief_complaint',
              label: 'Chief Complaint',
              placeholder: 'Patient main concern',
              order: 1,
              required: true,
            },
          ],
        },
        promptInstructions: 'Focus on biomechanics',
        isPublic: false,
        tags: ['orthopedic', 'evaluation'],
      };

      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(templateData.name);
      expect(res.body.userId.toString()).toBe(userId.toString());
      expect(res.body.structure.sections).toHaveLength(1);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/templates')
        .send({ name: 'Test Template' });

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing name' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/templates', () => {
    beforeEach(async () => {
      // Create test templates
      await Template.create([
        {
          name: 'My Private Template',
          userId,
          isPublic: false,
          type: 'soap',
          specialty: 'general',
        },
        {
          name: 'Public Template',
          userId,
          isPublic: true,
          type: 'evaluation',
          specialty: 'sports',
        },
        {
          name: 'Other User Public',
          userId: new mongoose.Types.ObjectId(),
          isPublic: true,
          type: 'progress',
          specialty: 'orthopedic',
        },
      ]);
    });

    it('should return user templates and public templates', async () => {
      const res = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(3); // 2 own + 1 public from others
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/templates?type=evaluation')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].type).toBe('evaluation');
    });

    it('should filter by specialty', async () => {
      const res = await request(app)
        .get('/api/templates?specialty=sports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].specialty).toBe('sports');
    });
  });

  describe('GET /api/templates/:id', () => {
    let templateId;

    beforeEach(async () => {
      const template = await Template.create({
        name: 'Test Template',
        userId,
        type: 'soap',
        specialty: 'general',
      });
      templateId = template._id;
    });

    it('should get template by id', async () => {
      const res = await request(app)
        .get(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(templateId.toString());
      expect(res.body.name).toBe('Test Template');
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/templates/:id', () => {
    let templateId;

    beforeEach(async () => {
      const template = await Template.create({
        name: 'Original Name',
        userId,
        type: 'soap',
        specialty: 'general',
      });
      templateId = template._id;
    });

    it('should update template', async () => {
      const updates = {
        name: 'Updated Name',
        description: 'New description',
      };

      const res = await request(app)
        .put(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.description).toBe('New description');
    });

    it('should not allow updating other user template', async () => {
      const otherTemplate = await Template.create({
        name: 'Other User Template',
        userId: new mongoose.Types.ObjectId(),
        type: 'soap',
        specialty: 'general',
      });

      const res = await request(app)
        .put(`/api/templates/${otherTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    let templateId;

    beforeEach(async () => {
      const template = await Template.create({
        name: 'To Delete',
        userId,
        type: 'soap',
        specialty: 'general',
      });
      templateId = template._id;
    });

    it('should delete template', async () => {
      const res = await request(app)
        .delete(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted');

      const deletedTemplate = await Template.findById(templateId);
      expect(deletedTemplate).toBeNull();
    });

    it('should not allow deleting other user template', async () => {
      const otherTemplate = await Template.create({
        name: 'Other User Template',
        userId: new mongoose.Types.ObjectId(),
        type: 'soap',
        specialty: 'general',
      });

      const res = await request(app)
        .delete(`/api/templates/${otherTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/templates/:id/clone', () => {
    let publicTemplateId;

    beforeEach(async () => {
      const template = await Template.create({
        name: 'Public Template',
        userId: new mongoose.Types.ObjectId(),
        isPublic: true,
        type: 'evaluation',
        specialty: 'sports',
        structure: {
          sections: [{ name: 'test', label: 'Test', order: 1 }],
        },
      });
      publicTemplateId = template._id;
    });

    it('should clone public template', async () => {
      const res = await request(app)
        .post(`/api/templates/${publicTemplateId}/clone`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toContain('Copy of');
      expect(res.body.userId.toString()).toBe(userId.toString());
      expect(res.body.isPublic).toBe(false);
      expect(res.body._id).not.toBe(publicTemplateId.toString());
    });

    it('should not clone private template from other user', async () => {
      const privateTemplate = await Template.create({
        name: 'Private Template',
        userId: new mongoose.Types.ObjectId(),
        isPublic: false,
        type: 'soap',
        specialty: 'general',
      });

      const res = await request(app)
        .post(`/api/templates/${privateTemplate._id}/clone`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
