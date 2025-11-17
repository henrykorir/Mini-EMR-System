const API_BASE_URL = 'https://stunning-space-sniffle-7wj9j4rg4x3w69w-8080.app.github.dev/api';

// SWR Fetcher function
const fetcher = async (url, options = {}) => {
  const token = localStorage.getItem('emr_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.status = response.status;
    error.info = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

// SWR mutation function for POST/PUT/DELETE requests
const mutator = async (url, data, method = 'POST') => {
  const token = localStorage.getItem('emr_token');
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = new Error('An error occurred while making the request.');
    error.status = response.status;
    error.info = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

export const authAPI = {
  async login(email, password) {
    return mutator('/auth/login', { email, password });
  },

  async register(userData) {
    return mutator('/auth/register', userData, 'POST');
  },

  async validateToken(token) {
    // For token validation, we'll use the fetcher which automatically includes the token
    return fetcher('/auth/validate');
  }
};

export const patientsAPI = {
  async getAll() {
    return fetcher('/patients');
  },

  async getById(id) {
    return fetcher(`/patients/${id}`);
  },

  async create(patientData) {
    return mutator('/patients', patientData);
  },

  async update(id, patientData) {
    return mutator(`/patients/${id}`, patientData, 'PUT');
  },

  async delete(id) {
    return mutator(`/patients/${id}`, {}, 'DELETE');
  },

  async search(query) {
    return fetcher(`/patients/search?q=${encodeURIComponent(query)}`);
  }
};

export const visitsAPI = {
  async getAll() {
    return fetcher('/visits');
  },

  async getByPatientId(patientId) {
    return fetcher(`/visits/patient/${patientId}`);
  },

  async create(visitData) {
    return mutator('/visits', visitData);
  },

  async update(id, visitData) {
    return mutator(`/visits/${id}`, visitData, 'PUT');
  },

  async delete(id) {
    return mutator(`/visits/${id}`, {}, 'DELETE');
  },

  async getById(id) {
    return fetcher(`/visits/${id}`);
  },

  async getRecent(limit = 10) {
    return fetcher(`/visits/recent?limit=${limit}`);
  }
};

export const dashboardAPI = {
  async getDashboardData() {
    return fetcher('/dashboard');
  },

  async getDashboardStats() {
    return fetcher('/dashboard/stats');
  }
};

// SWR Hooks for React components (additional utilities)
export const patientsHooks = {
  usePatients() {
    const { data, error, isLoading, mutate } = useSWR(
      '/patients',
      fetcher,
      {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
      }
    );

    return {
      patients: data || [],
      isLoading,
      isError: error,
      refetch: mutate,
    };
  },

  usePatient(id) {
    const { data, error, isLoading, mutate } = useSWR(
      id ? `/patients/${id}` : null,
      fetcher
    );

    return {
      patient: data,
      isLoading,
      isError: error,
      refetch: mutate,
    };
  }
};

export const visitsHooks = {
  useVisits() {
    const { data, error, isLoading, mutate } = useSWR(
      '/visits',
      fetcher,
      {
        revalidateOnFocus: true,
        dedupingInterval: 30000,
      }
    );

    return {
      visits: data || [],
      isLoading,
      isError: error,
      refetch: mutate,
    };
  },

  useVisitsByPatient(patientId) {
    const { data, error, isLoading, mutate } = useSWR(
      patientId ? `/visits/patient/${patientId}` : null,
      fetcher
    );

    return {
      visits: data || [],
      isLoading,
      isError: error,
      refetch: mutate,
    };
  }
};

export const dashboardHooks = {
  useDashboard() {
    const { data, error, isLoading, mutate } = useSWR(
      '/dashboard',
      fetcher,
      {
        revalidateOnFocus: true,
        refreshInterval: 60000,
      }
    );

    return {
      dashboard: data,
      isLoading,
      isError: error,
      refetch: mutate,
    };
  }
};

// Utility hooks for common operations
export const apiHooks = {
  // Combined patient with their visits
  usePatientWithVisits(patientId) {
    const { patient, isLoading: patientLoading, error: patientError } = patientsHooks.usePatient(patientId);
    const { visits, isLoading: visitsLoading, error: visitsError } = visitsHooks.useVisitsByPatient(patientId);

    return {
      patient,
      visits: visits || [],
      isLoading: patientLoading || visitsLoading,
      isError: patientError || visitsError,
    };
  },

  // Search with debouncing
  useDebouncedSearch(query, delay = 300) {
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedQuery(query);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [query, delay]);

    const { patients, isLoading, isError } = patientsHooks.usePatients();

    // Filter patients based on debounced query
    const filteredPatients = patients.filter(patient => 
      patient.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      patient.idNumber.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    return {
      patients: debouncedQuery ? filteredPatients : patients,
      isLoading,
      isError,
    };
  }
};

// Export the base fetcher and mutator for direct use
export { fetcher, mutator };