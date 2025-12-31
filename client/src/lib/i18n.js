import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        patients: 'Patients',
        sessions: 'Sessions',
        notes: 'Notes',
        templates: 'Templates',
        logout: 'Logout',
        profile: 'Profile'
      },
      
      navigation: {
        patients: 'patients',
        sessions: 'sessions',
        notes: 'notes',
        session: 'Session',
        note: 'Note'
      },
      
      patient: {
        patient: 'Patient'
      },
      
      // Common actions
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        close: 'Close',
        download: 'Download',
        upload: 'Upload',
        view: 'View',
        clone: 'Clone',
        share: 'Share',
        select: 'Select'
      },
      
      // Status messages
      status: {
        loading: 'Loading...',
        saving: 'Saving...',
        saved: 'Saved successfully',
        error: 'An error occurred',
        success: 'Success',
        warning: 'Warning',
        processing: 'Processing...',
        noData: 'No data available',
        notFound: 'Not found'
      },
      
      // Auth
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        name: 'Full Name',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        loggingIn: 'Logging in...',
        registering: 'Creating account...'
      },
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back',
        overview: 'Overview',
        stats: {
          totalPatients: 'Total Patients',
          totalSessions: 'Total Sessions',
          todaySessions: "Today's Sessions",
          thisWeek: 'This Week',
          thisMonth: 'This Month',
          recentNotes: 'Recent Notes'
        },
        recentActivity: 'Recent Activity',
        recentSessions: 'Recent Sessions',
        recentPatients: 'Recent Patients',
        upcomingAppointments: 'Upcoming Appointments',
        quickActions: 'Quick Actions',
        noActivity: 'No recent activity',
        viewAll: 'View all {{item}}',
        actions: {
          addPatient: 'Add New Patient',
          scheduleSession: 'Schedule Session',
          createNote: 'Create Note'
        }
      },
      
      // Patients
      patients: {
        title: 'Patients',
        newPatient: 'New Patient',
        patientDetails: 'Patient Details',
        searchPlaceholder: 'Search patients...',
        fields: {
          name: 'Name',
          firstName: 'First Name',
          lastName: 'Last Name',
          dateOfBirth: 'Date of Birth',
          gender: 'Gender',
          phone: 'Phone',
          email: 'Email',
          address: 'Address',
          emergencyContact: 'Emergency Contact',
          emergencyPhone: 'Emergency Phone',
          insurance: 'Insurance',
          notes: 'Notes',
          medicalHistory: 'Medical History'
        },
        genders: {
          male: 'Male',
          female: 'Female',
          other: 'Other'
        },
        totalSessions: 'Total Sessions',
        lastSession: 'Last Session',
        noPatients: 'No patients found'
      },
      
      // Sessions
      sessions: {
        title: 'Sessions',
        newSession: 'New Session',
        sessionDetails: 'Session Details',
        selectPatient: 'Select Patient',
        sessionDate: 'Session Date',
        duration: 'Duration',
        status: 'Status',
        type: 'Type',
        noSessions: 'No sessions found',
        filters: {
          all: 'All',
          today: 'Today',
          upcoming: 'Upcoming',
          completed: 'Completed'
        },
        statuses: {
          scheduled: 'Scheduled',
          inProgress: 'In Progress',
          inprogress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled'
        },
        types: {
          evaluation: 'Evaluation',
          treatment: 'Treatment',
          followUp: 'Follow-up',
          discharge: 'Discharge'
        }
      },
      
      // SOAP Note
      soap: {
        title: 'SOAP Note',
        subjective: 'Subjective',
        objective: 'Objective',
        assessment: 'Assessment',
        plan: 'Plan',
        placeholders: {
          subjective: "Patient's complaints and symptoms...",
          objective: 'Physical examination findings...',
          assessment: 'Clinical assessment and diagnosis...',
          plan: 'Treatment plan and recommendations...'
        }
      },
      
      // Physiotherapy Data
      physio: {
        title: 'Physiotherapy Data',
        painScale: 'Pain Scale',
        rangeOfMotion: 'Range of Motion',
        strengthTest: 'Strength Test',
        exercises: 'Exercises',
        modalities: 'Modalities Used',
        billingCodes: 'Billing Codes',
        painFields: {
          current: 'Current Pain',
          best: 'Best (last 24h)',
          worst: 'Worst (last 24h)',
          location: 'Location'
        },
        romFields: {
          joint: 'Joint',
          movement: 'Movement',
          degrees: 'Degrees'
        },
        strengthFields: {
          muscle: 'Muscle Group',
          grade: 'Grade'
        },
        exerciseFields: {
          name: 'Exercise Name',
          sets: 'Sets',
          reps: 'Reps',
          instructions: 'Instructions'
        },
        addEntry: 'Add Entry',
        addExercise: 'Add Exercise',
        noData: 'No data recorded'
      },
      
      // Audio Recording
      audio: {
        title: 'Audio Recording',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        recording: 'Recording...',
        transcription: 'Transcription',
        generating: 'Generating note...',
        extracting: 'Extracting physiotherapy data...',
        processing: 'Processing recording...',
        success: 'Recording processed successfully',
        error: 'Failed to process recording',
        noPermission: 'Microphone access denied',
        notSupported: 'Audio recording not supported'
      },
      
      // Session Detail
      sessionDetail: {
        title: 'Session Documentation',
        voiceRecording: 'Voice Recording',
        painAssessment: 'Pain Assessment',
        rangeOfMotion: 'Range of Motion',
        strengthTesting: 'Strength Testing',
        exercisePrescription: 'Exercise Prescription',
        modalitiesUsed: 'Modalities Used',
        billingCodes: 'Billing Codes',
        saveSession: 'Save Session',
        loadingSession: 'Loading session...',
        sessionNotFound: 'Session not found',
        processingAudio: 'Processing audio and generating SOAP note...',
        transcription: 'Transcription:',
        addROMTest: '+ Add ROM Test',
        addStrengthTest: '+ Add Strength Test',
        addExercise: '+ Add Exercise',
        aiGenerate: '🤖 AI Generate',
        aiSuggestCodes: '🤖 AI Suggest Codes',
        homeProgram: 'Home Program',
        selectGrade: 'Select Grade',
        addBillingCode: 'Add billing code (e.g., 97110)',
        modalities: {
          ultrasound: 'Ultrasound',
          tens: 'TENS',
          heat: 'Heat',
          ice: 'Ice',
          manualTherapy: 'Manual Therapy',
          dryNeedling: 'Dry Needling',
          cupping: 'Cupping',
          taping: 'Taping'
        },
        strengthGrades: {
          normal: '5/5 - Normal',
          good: '4/5 - Good',
          fair: '3/5 - Fair',
          poor: '2/5 - Poor',
          trace: '1/5 - Trace',
          zero: '0/5 - Zero'
        },
        placeholders: {
          joint: 'Joint (e.g., Right Shoulder)',
          movement: 'Movement (e.g., Flexion)',
          measurement: 'Measurement (e.g., 120°)',
          muscleGroup: 'Muscle Group',
          notes: 'Notes',
          exerciseName: 'Exercise Name',
          sets: 'Sets',
          reps: 'Reps',
          instructions: 'Instructions...',
          painLocation: 'e.g., Lower back, Right knee'
        }
      },
      
      // Templates
      templates: {
        title: 'Templates',
        template: 'template',
        newTemplate: 'New Template',
        editTemplate: 'Edit Template',
        myTemplates: 'My Templates',
        publicTemplates: 'Public Templates',
        filters: {
          allSpecialties: 'All Specialties',
          publicOnly: 'Show public templates only'
        },
        fields: {
          name: 'Template Name',
          description: 'Description',
          type: 'Type',
          specialty: 'Specialty',
          sections: 'Sections',
          promptInstructions: 'AI Instructions',
          isPublic: 'Make Public',
          tags: 'Tags'
        },
        types: {
          soap: 'SOAP Note',
          evaluation: 'Evaluation',
          progress: 'Progress Note',
          discharge: 'Discharge Summary',
          custom: 'Custom'
        },
        specialties: {
          orthopedic: 'Orthopedic',
          sports: 'Sports',
          neurological: 'Neurological',
          pediatric: 'Pediatric',
          geriatric: 'Geriatric',
          cardiopulmonary: 'Cardiopulmonary',
          general: 'General'
        },
        section: {
          name: 'Section Name',
          label: 'Display Label',
          placeholder: 'Placeholder Text',
          required: 'Required',
          order: 'Order',
          addSection: 'Add Section',
          removeSection: 'Remove Section'
        },
        noTemplates: 'No templates found',
        usageCount: '{{count}} uses'
      },
      
      // Notes
      notes: {
        title: 'Clinical Notes',
        note: 'Note',
        notesFound: 'notes found',
        noNotes: 'No notes found',
        tryAdjustFilters: 'Try adjusting your filters',
        startCreating: 'Start by creating a new session with documentation',
        searchPlaceholder: 'Search notes...',
        filters: {
          allTypes: 'All Types',
          allPatients: 'All Patients'
        },
        types: {
          soap: 'SOAP Notes',
          progress: 'Progress Notes',
          discharge: 'Discharge Notes',
          initial: 'Initial Evaluation'
        }
      },
      
      // Validation messages
      validation: {
        required: 'This field is required',
        email: 'Invalid email address',
        minLength: 'Must be at least {{min}} characters',
        maxLength: 'Must be at most {{max}} characters',
        passwordMatch: 'Passwords must match',
        invalidDate: 'Invalid date',
        invalidPhone: 'Invalid phone number'
      },
      
      // Errors
      errors: {
        generic: 'Something went wrong',
        network: 'Network error. Please check your connection.',
        unauthorized: 'Unauthorized. Please log in.',
        forbidden: 'You do not have permission to perform this action.',
        notFound: 'Resource not found',
        validation: 'Validation error. Please check your input.',
        server: 'Server error. Please try again later.'
      },
      
      // Dates
      dates: {
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        daysAgo: '{{count}} days ago',
        weeksAgo: '{{count}} weeks ago',
        monthsAgo: '{{count}} months ago',
        yearsAgo: '{{count}} years ago'
      }
    }
  },
  
  'pt-BR': {
    translation: {
      // Navegação
      nav: {
        dashboard: 'Painel',
        patients: 'Pacientes',
        sessions: 'Sessões',
        notes: 'Notas',
        templates: 'Modelos',
        logout: 'Sair',
        profile: 'Perfil'
      },
      
      navigation: {
        patients: 'pacientes',
        sessions: 'sessões',
        notes: 'notas',
        session: 'Sessão',
        note: 'Nota'
      },
      
      patient: {
        patient: 'Paciente'
      },
      
      // Ações comuns
      actions: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        search: 'Buscar',
        filter: 'Filtrar',
        back: 'Voltar',
        next: 'Próximo',
        previous: 'Anterior',
        submit: 'Enviar',
        close: 'Fechar',
        download: 'Baixar',
        upload: 'Enviar',
        view: 'Ver',
        clone: 'Clonar',
        share: 'Compartilhar',
        select: 'Selecionar'
      },
      
      // Mensagens de status
      status: {
        loading: 'Carregando...',
        saving: 'Salvando...',
        saved: 'Salvo com sucesso',
        error: 'Ocorreu um erro',
        success: 'Sucesso',
        warning: 'Aviso',
        processing: 'Processando...',
        noData: 'Nenhum dado disponível',
        notFound: 'Não encontrado'
      },
      
      // Autenticação
      auth: {
        login: 'Entrar',
        register: 'Cadastrar',
        email: 'E-mail',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        name: 'Nome Completo',
        forgotPassword: 'Esqueceu a senha?',
        noAccount: 'Não tem uma conta?',
        hasAccount: 'Já tem uma conta?',
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        loggingIn: 'Entrando...',
        registering: 'Criando conta...'
      },
      
      // Dashboard
      dashboard: {
        title: 'Painel',
        welcome: 'Bem-vindo de volta',
        overview: 'Visão Geral',
        stats: {
          totalPatients: 'Total de Pacientes',
          totalSessions: 'Total de Sessões',
          todaySessions: 'Sessões de Hoje',
          thisWeek: 'Esta Semana',
          thisMonth: 'Este Mês',
          recentNotes: 'Notas Recentes'
        },
        recentActivity: 'Atividade Recente',
        recentSessions: 'Sessões Recentes',
        recentPatients: 'Pacientes Recentes',
        upcomingAppointments: 'Próximos Agendamentos',
        quickActions: 'Ações Rápidas',
        noActivity: 'Nenhuma atividade recente',
        viewAll: 'Ver todos {{item}}',
        actions: {
          addPatient: 'Adicionar Novo Paciente',
          scheduleSession: 'Agendar Sessão',
          createNote: 'Criar Nota'
        }
      },
      
      // Pacientes
      patients: {
        title: 'Pacientes',
        newPatient: 'Novo Paciente',
        patientDetails: 'Detalhes do Paciente',
        searchPlaceholder: 'Buscar pacientes...',
        fields: {
          name: 'Nome',
          firstName: 'Primeiro Nome',
          lastName: 'Sobrenome',
          dateOfBirth: 'Data de Nascimento',
          gender: 'Sexo',
          phone: 'Telefone',
          email: 'E-mail',
          address: 'Endereço',
          emergencyContact: 'Contato de Emergência',
          emergencyPhone: 'Telefone de Emergência',
          insurance: 'Convênio',
          notes: 'Observações',
          medicalHistory: 'Histórico Médico'
        },
        genders: {
          male: 'Masculino',
          female: 'Feminino',
          other: 'Outro'
        },
        totalSessions: 'Total de Sessões',
        lastSession: 'Última Sessão',
        noPatients: 'Nenhum paciente encontrado'
      },
      
      // Sessões
      sessions: {
        title: 'Sessões',
        newSession: 'Nova Sessão',
        sessionDetails: 'Detalhes da Sessão',
        selectPatient: 'Selecionar Paciente',
        sessionDate: 'Data da Sessão',
        duration: 'Duração',
        status: 'Status',
        type: 'Tipo',
        noSessions: 'Nenhuma sessão encontrada',
        filters: {
          all: 'Todas',
          today: 'Hoje',
          upcoming: 'Próximas',
          completed: 'Concluídas'
        },
        statuses: {
          scheduled: 'Agendada',
          inProgress: 'Em Andamento',
          inprogress: 'Em Andamento',
          completed: 'Concluída',
          cancelled: 'Cancelada'
        },
        types: {
          evaluation: 'Avaliação',
          treatment: 'Tratamento',
          followUp: 'Retorno',
          discharge: 'Alta'
        }
      },
      
      // Nota SOAP
      soap: {
        title: 'Nota SOAP',
        subjective: 'Subjetivo',
        objective: 'Objetivo',
        assessment: 'Avaliação',
        plan: 'Plano',
        placeholders: {
          subjective: 'Queixas e sintomas do paciente...',
          objective: 'Achados do exame físico...',
          assessment: 'Avaliação clínica e diagnóstico...',
          plan: 'Plano de tratamento e recomendações...'
        }
      },
      
      // Dados Fisioterapêuticos
      physio: {
        title: 'Dados Fisioterapêuticos',
        painScale: 'Escala de Dor',
        rangeOfMotion: 'Amplitude de Movimento',
        strengthTest: 'Teste de Força',
        exercises: 'Exercícios',
        modalities: 'Modalidades Utilizadas',
        billingCodes: 'Códigos de Faturamento',
        painFields: {
          current: 'Dor Atual',
          best: 'Melhor (últimas 24h)',
          worst: 'Pior (últimas 24h)',
          location: 'Localização'
        },
        romFields: {
          joint: 'Articulação',
          movement: 'Movimento',
          degrees: 'Graus'
        },
        strengthFields: {
          muscle: 'Grupo Muscular',
          grade: 'Grau'
        },
        exerciseFields: {
          name: 'Nome do Exercício',
          sets: 'Séries',
          reps: 'Repetições',
          instructions: 'Instruções'
        },
        addEntry: 'Adicionar Entrada',
        addExercise: 'Adicionar Exercício',
        noData: 'Nenhum dado registrado'
      },
      
      // Gravação de Áudio
      audio: {
        title: 'Gravação de Áudio',
        startRecording: 'Iniciar Gravação',
        stopRecording: 'Parar Gravação',
        recording: 'Gravando...',
        transcription: 'Transcrição',
        generating: 'Gerando nota...',
        extracting: 'Extraindo dados fisioterapêuticos...',
        processing: 'Processando gravação...',
        success: 'Gravação processada com sucesso',
        error: 'Falha ao processar gravação',
        noPermission: 'Acesso ao microfone negado',
        notSupported: 'Gravação de áudio não suportada'
      },
      
      // Detalhes da Sessão
      sessionDetail: {
        title: 'Documentação da Sessão',
        voiceRecording: 'Gravação de Voz',
        painAssessment: 'Avaliação de Dor',
        rangeOfMotion: 'Amplitude de Movimento',
        strengthTesting: 'Teste de Força',
        exercisePrescription: 'Prescrição de Exercícios',
        modalitiesUsed: 'Modalidades Utilizadas',
        billingCodes: 'Códigos de Faturamento',
        saveSession: 'Salvar Sessão',
        loadingSession: 'Carregando sessão...',
        sessionNotFound: 'Sessão não encontrada',
        processingAudio: 'Processando áudio e gerando nota SOAP...',
        transcription: 'Transcrição:',
        addROMTest: '+ Adicionar Teste ADM',
        addStrengthTest: '+ Adicionar Teste de Força',
        addExercise: '+ Adicionar Exercício',
        aiGenerate: '🤖 IA Gerar',
        aiSuggestCodes: '🤖 IA Sugerir Códigos',
        homeProgram: 'Programa Domiciliar',
        selectGrade: 'Selecionar Grau',
        addBillingCode: 'Adicionar código de faturamento (ex: 97110)',
        modalities: {
          ultrasound: 'Ultrassom',
          tens: 'TENS',
          heat: 'Calor',
          ice: 'Gelo',
          manualTherapy: 'Terapia Manual',
          dryNeedling: 'Agulhamento Seco',
          cupping: 'Ventosaterapia',
          taping: 'Bandagem'
        },
        strengthGrades: {
          normal: '5/5 - Normal',
          good: '4/5 - Bom',
          fair: '3/5 - Regular',
          poor: '2/5 - Fraco',
          trace: '1/5 - Traço',
          zero: '0/5 - Zero'
        },
        placeholders: {
          joint: 'Articulação (ex: Ombro Direito)',
          movement: 'Movimento (ex: Flexão)',
          measurement: 'Medida (ex: 120°)',
          muscleGroup: 'Grupo Muscular',
          notes: 'Observações',
          exerciseName: 'Nome do Exercício',
          sets: 'Séries',
          reps: 'Repetições',
          instructions: 'Instruções...',
          painLocation: 'ex: Lombar, Joelho direito'
        }
      },
      
      // Modelos
      templates: {
        title: 'Modelos',
        template: 'modelo',
        newTemplate: 'Novo Modelo',
        editTemplate: 'Editar Modelo',
        myTemplates: 'Meus Modelos',
        publicTemplates: 'Modelos Públicos',
        filters: {
          allSpecialties: 'Todas as Especialidades',
          publicOnly: 'Mostrar apenas modelos públicos'
        },
        fields: {
          name: 'Nome do Modelo',
          description: 'Descrição',
          type: 'Tipo',
          specialty: 'Especialidade',
          sections: 'Seções',
          promptInstructions: 'Instruções para IA',
          isPublic: 'Tornar Público',
          tags: 'Tags'
        },
        types: {
          soap: 'Nota SOAP',
          evaluation: 'Avaliação',
          progress: 'Nota de Evolução',
          discharge: 'Resumo de Alta',
          custom: 'Personalizado'
        },
        specialties: {
          orthopedic: 'Ortopédica',
          sports: 'Esportiva',
          neurological: 'Neurológica',
          pediatric: 'Pediátrica',
          geriatric: 'Geriátrica',
          cardiopulmonary: 'Cardiopulmonar',
          general: 'Geral'
        },
        section: {
          name: 'Nome da Seção',
          label: 'Rótulo de Exibição',
          placeholder: 'Texto de Espaço Reservado',
          required: 'Obrigatório',
          order: 'Ordem',
          addSection: 'Adicionar Seção',
          removeSection: 'Remover Seção'
        },
        noTemplates: 'Nenhum modelo encontrado',
        usageCount: '{{count}} usos'
      },
      
      // Notas
      notes: {
        title: 'Notas Clínicas',
        note: 'Nota',
        notesFound: 'notas encontradas',
        noNotes: 'Nenhuma nota encontrada',
        tryAdjustFilters: 'Tente ajustar seus filtros',
        startCreating: 'Comece criando uma nova sessão com documentação',
        searchPlaceholder: 'Buscar notas...',
        filters: {
          allTypes: 'Todos os Tipos',
          allPatients: 'Todos os Pacientes'
        },
        types: {
          soap: 'Notas SOAP',
          progress: 'Notas de Evolução',
          discharge: 'Notas de Alta',
          initial: 'Avaliação Inicial'
        }
      },
      
      // Mensagens de validação
      validation: {
        required: 'Este campo é obrigatório',
        email: 'Endereço de e-mail inválido',
        minLength: 'Deve ter pelo menos {{min}} caracteres',
        maxLength: 'Deve ter no máximo {{max}} caracteres',
        passwordMatch: 'As senhas devem corresponder',
        invalidDate: 'Data inválida',
        invalidPhone: 'Número de telefone inválido'
      },
      
      // Erros
      errors: {
        generic: 'Algo deu errado',
        network: 'Erro de rede. Verifique sua conexão.',
        unauthorized: 'Não autorizado. Faça login.',
        forbidden: 'Você não tem permissão para realizar esta ação.',
        notFound: 'Recurso não encontrado',
        validation: 'Erro de validação. Verifique sua entrada.',
        server: 'Erro no servidor. Tente novamente mais tarde.'
      },
      
      // Datas
      dates: {
        today: 'Hoje',
        yesterday: 'Ontem',
        tomorrow: 'Amanhã',
        daysAgo: 'há {{count}} dias',
        weeksAgo: 'há {{count}} semanas',
        monthsAgo: 'há {{count}} meses',
        yearsAgo: 'há {{count}} anos'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

export default i18n;
