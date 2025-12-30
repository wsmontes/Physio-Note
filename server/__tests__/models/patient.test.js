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
        name: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        phone: '555-0100',
        email: 'john@example.com',
        address: '123 Main St',
        therapist: new mongoose.Types.ObjectId()
      };

      const patient = await Patient.create(patientData);

      expect(patient.name).toBe(patientData.name);
      expect(patient.email).toBe(patientData.email);
      expect(patient.status).toBe('active'); // Default value
      expect(patient._id).toBeDefined();
    });

    it('should require name and therapist fields', async () => {
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
      expect(error.errors.name).toBeDefined();
      expect(error.errors.therapist).toBeDefined();
    });

    it('should set default status to active', async () => {
      const patient = await Patient.create({
        name: 'Jane Doe',
        therapist: new mongoose.Types.ObjectId()
      });

      expect(patient.status).toBe('active');
    });

    it('should validate gender enum values', async () => {
      const patientData = {
        name: 'Test Patient',
        gender: 'invalid-gender',
        therapist: new mongoose.Types.ObjectId()
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
        name: 'Test Patient',
        therapist: new mongoose.Types.ObjectId(),
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

    it('should store insurance information correctly', async () => {
      const patientData = {
        name: 'Test Patient',
        therapist: new mongoose.Types.ObjectId(),
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'BC12345',
          groupNumber: 'GRP001'
        }
      };

      const patient = await Patient.create(patientData);

      expect(patient.insurance.provider).toBe('Blue Cross');
      expect(patient.insurance.policyNumber).toBe('BC12345');
    });
  });

  describe('Patient Updates', () => {
    it('should update patient information', async () => {
      const patient = await Patient.create({
        name: 'Original Name',
        therapist: new mongoose.Types.ObjectId()
      });

      patient.name = 'Updated Name';
      patient.phone = '555-0200';
      await patient.save();

      const updatedPatient = await Patient.findById(patient._id);
      expect(updatedPatient.name).toBe('Updated Name');
      expect(updatedPatient.phone).toBe('555-0200');
    });

    it('should update timestamps automatically', async () => {
      const patient = await Patient.create({
        name: 'Test Patient',
        therapist: new mongoose.Types.ObjectId()
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
        { name: 'Active Patient 1', status: 'active', therapist: therapistId },
        { name: 'Active Patient 2', status: 'active', therapist: therapistId },
        { name: 'Inactive Patient', status: 'inactive', therapist: therapistId }
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
      const patient = await Patient.findOne({ name: 'Active Patient 1' });
      expect(patient).toBeDefined();
      expect(patient.name).toBe('Active Patient 1');
    });
  });
});
