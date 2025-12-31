import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiUser, FiX } from 'react-icons/fi';
import { usePatients, useCreatePatient } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

const Patients = () => {
  const { t } = useTranslation();
  const { data: patients = [], isLoading } = usePatients();
  const createPatient = useCreatePatient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, patients]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    
    // Clean up the data - remove empty optional fields
    const patientData = {
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
    };
    
    // Only add optional fields if they have values
    if (newPatient.dateOfBirth) patientData.dateOfBirth = newPatient.dateOfBirth;
    if (newPatient.gender) patientData.gender = newPatient.gender;
    if (newPatient.phone) patientData.phone = newPatient.phone;
    if (newPatient.email) patientData.email = newPatient.email;
    if (newPatient.address) patientData.address = newPatient.address;

    createPatient.mutate(patientData, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewPatient({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          email: '',
          address: ''
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('patients.title')}</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('patients.newPatient')}</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t('patients.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Link
            key={patient._id}
            to={`/patients/${patient._id}`}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FiUser className="text-primary-600 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    {patient.email && (
                      <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                    )}
                    {patient.phone && (
                      <p className="text-sm text-gray-600">{patient.phone}</p>
                    )}
                    <div className="mt-2">
                      <Badge
                        variant={
                          patient.status === 'active' ? 'success' :
                          patient.status === 'inactive' ? 'default' :
                          'warning'
                        }
                      >
                        {patient.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FiUser className="mx-auto text-5xl text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? t('patients.noPatients') : t('patients.noPatients')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('patients.newPatient')}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <FiX className="w-6 h-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>

              <form onSubmit={handleAddPatient}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={`${t('patients.fields.firstName')} *`}
                      type="text"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label={`${t('patients.fields.lastName')} *`}
                      type="text"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('patients.fields.dateOfBirth')}
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('patients.fields.gender')}
                      </label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('actions.select')}</option>
                        <option value="male">{t('patients.genders.male')}</option>
                        <option value="female">{t('patients.genders.female')}</option>
                        <option value="other">{t('patients.genders.other')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('patients.fields.phone')}
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                    <Input
                      label={t('patients.fields.email')}
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('patients.fields.address')}
                    </label>
                    <textarea
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button type="submit">
                    {t('patients.newPatient')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Patients;
