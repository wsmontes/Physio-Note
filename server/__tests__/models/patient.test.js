const Patient = require('../../src/models/patient.model');
const mongoose = require('mongoose');

describe('Patient Model', () => {
  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/physio-note-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
  });

  describe('Patient Creation', () => {
    it('should create a patient with valid data', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        phone: '555-0100',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101'
        },
        therapistId: new mongoose.Types.ObjectId()
      };

      const patient = await Patient.create(patientData);

      expect(patient.firstName).toBe(patientData.firstName);
      expect(patient.lastName).toBe(patientData.lastName);
      expect(patient.email).toBe(patientData.email);
      expect(patient.status).toBe('active'); // Default value
      expect(patient._id).toBeDefined();
    });

    it('should require firstName, lastName and therapistId fields', async () => {
      const invalidPatient = new Patient({
        email: 'test@example.com'
      });

      let error;
      try {
        await invalidPatient.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
      expect(error.errors.therapistId).toBeDefined();
    });

    it('should set default status to active', async () => {
      const patient = await Patient.create({
        firstName: 'Jane',
        lastName: 'Doe',
        therapistId: new mongoose.Types.ObjectId()
      });

      expect(patient.status).toBe('active');
    });

    it('should validate gender enum values', async () => {
      const patientData = {
        firstName: 'Test',
        lastName: 'Patient',
        gender: 'invalid-gender',
        therapistId: new mongoose.Types.ObjectId()
      };

      let error;
      try {
        await Patient.create(patientData);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.gender).toBeDefined();
    });

    it('should store medical history correctly', async () => {
      const patientData = {
        firstName: 'Test',
        lastName: 'Patient',
        therapistId: new mongoose.Types.ObjectId(),
        medicalHistory: {
          conditions: ['Hypertension', 'Diabetes'],
          surgeries: ['ACL Repair'],
          medications: ['Metformin'],
          allergies: ['Penicillin']
        }
      };

      const patient = await Patient.create(patientData);

      expect(patient.medicalHistory.conditions).toHaveLength(2);
      expect(patient.medicalHistory.conditions).toContain('Hypertension');
      expect(patient.medicalHistory.allergies).toContain('Penicillin');
    });

  });

  describe('Patient Updates', () => {
    it('should update patient information', async () => {
      const patient = await Patient.create({
        firstName: 'Original',
        lastName: 'Name',
        therapistId: new mongoose.Types.ObjectId()
      });

      patient.firstName = 'Updated';
      patient.phone = '555-0200';
      await patient.save();

      const updatedPatient = await Patient.findById(patient._id);
      expect(updatedPatient.firstName).toBe('Updated');
      expect(updatedPatient.phone).toBe('555-0200');
    });

    it('should update timestamps automatically', async () => {
      const patient = await Patient.create({
        firstName: 'Test',
        lastName: 'Patient',
        therapistId: new mongoose.Types.ObjectId()
      });

      const originalUpdatedAt = patient.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));

      patient.phone = '555-9999';
      await patient.save();

      expect(patient.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Patient Queries', () => {
    beforeEach(async () => {
      const therapistId = new mongoose.Types.ObjectId();
      await Patient.create([
        { firstName: 'Active', lastName: 'Patient 1', status: 'active', therapistId },
        { firstName: 'Active', lastName: 'Patient 2', status: 'active', therapistId },
        { firstName: 'Inactive', lastName: 'Patient', status: 'inactive', therapistId }
      ]);
    });

    it('should find all patients', async () => {
      const patients = await Patient.find();
      expect(patients).toHaveLength(3);
    });

    it('should find patients by status', async () => {
      const activePatients = await Patient.find({ status: 'active' });
      expect(activePatients).toHaveLength(2);
    });

    it('should find patient by name', async () => {
      const patient = await Patient.findOne({ firstName: 'Active' });
      expect(patient).toBeDefined();
      expect(patient.firstName).toBe('Active');
    });
  });
});
