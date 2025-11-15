// src/services/mockData.js
export const mockData = {
  patients: [
    {
      id: 'P001',
      name: 'John Doe',
      idNumber: 'ID123456',
      dateOfBirth: '1979-05-15',
      gender: 'Male',
      contact: 'john.doe@email.com',
      address: '123 Main St, Anytown, USA',
      emergencyContact: 'Jane Doe - (555) 123-4567',
      bloodType: 'A+',
      allergies: 'Penicillin, Peanuts',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      createdAt: '2023-01-15',
      lastVisit: '2024-01-15',
      status: 'Active'
    },
    {
      id: 'P002',
      name: 'Sarah Smith',
      idNumber: 'ID123457',
      dateOfBirth: '1992-08-22',
      gender: 'Female',
      contact: 'sarah.smith@email.com',
      address: '456 Oak Ave, Somewhere, USA',
      emergencyContact: 'Mike Smith - (555) 987-6543',
      bloodType: 'O-',
      allergies: 'None',
      medicalHistory: 'Asthma',
      createdAt: '2023-02-10',
      lastVisit: '2024-01-10',
      status: 'Active'
    },
    {
      id: 'P003',
      name: 'Mike Johnson',
      idNumber: 'ID123458',
      dateOfBirth: '1985-12-03',
      gender: 'Male',
      contact: 'mike.johnson@email.com',
      address: '789 Pine Rd, Nowhere, USA',
      emergencyContact: 'Lisa Johnson - (555) 456-7890',
      bloodType: 'B+',
      allergies: 'Shellfish',
      medicalHistory: 'High Cholesterol',
      createdAt: '2023-03-20',
      lastVisit: '2024-01-08',
      status: 'Inactive'
    }
  ],
  
  visits: [
    {
      id: 'V101',
      patientId: 'P001',
      patientName: 'John Doe',
      visitDate: '2024-01-15',
      diagnosis: ['Hypertension', 'Diabetes Type II'],
      prescribedMedications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Daily',
          duration: '30 days'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice Daily',
          duration: '90 days'
        }
      ],
      notes: 'Patient presents with elevated blood pressure. Recommended lifestyle changes including reduced sodium diet and regular exercise. Follow up in 2 weeks.',
      status: 'completed'
    },
    {
      id: 'V102',
      patientId: 'P002',
      patientName: 'Sarah Smith',
      visitDate: '2024-01-10',
      diagnosis: ['Asthma', 'Upper Respiratory Infection'],
      prescribedMedications: [
        {
          name: 'Albuterol',
          dosage: '2 puffs',
          frequency: 'As needed',
          duration: '30 days'
        },
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '10 days'
        }
      ],
      notes: 'Patient experiencing wheezing and cough. Prescribed antibiotics and inhaler. Advised to use humidifier.',
      status: 'completed'
    },
  {
    id: 'V103',
    patientId: 'P001',
    patientName: 'John Doe',
    visitDate: '2024-01-15',
    status: 'completed',
    duration: '30 minutes',
    diagnosis: ['Hypertension', 'Diabetes Type II'],
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: '72',
      temperature: '36.6',
      oxygenSaturation: '98',
      respiratoryRate: '16',
      weight: '85',
      height: '175',
      bmi: '27.8'
    },
    prescribedMedications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Daily',
        duration: '30 days',
        instructions: 'Take in the morning with food'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice Daily',
        duration: '90 days',
        instructions: 'Take with meals'
      }
    ],
    notes: `Patient presents with elevated blood pressure readings over the past week. Reports compliance with previous medication regimen but experiencing occasional dizziness.\n\nBlood pressure measured at 140/90 mmHg in both arms. Heart rate regular at 72 BPM. No signs of peripheral edema.\n\nDiscussed lifestyle modifications including reduced sodium diet, regular exercise, and stress management techniques. Patient educated about hypertension management and warning signs.`,
    treatmentPlan: `• Continue current antihypertensive medication\n• Start Metformin for glucose control\n• Implement DASH diet principles\n• 30 minutes moderate exercise 5x/week\n• Home BP monitoring twice daily\n• Stress reduction techniques`,
    followUp: `Return in 2 weeks for BP recheck\nFasting blood work in 1 month\nCall if BP > 160/100 or symptoms worsen\nSchedule ophthalmology exam for diabetic screening`
  },
  ],
  
  dashboard: {
    stats: {
      patients: 24,
      visitsToday: 8,
      prescriptions: 12,
      growth: 15
    },
    recentVisits: [
      {
        id: 'V101',
        patientName: 'John Doe',
        visitDate: '2024-01-15',
        diagnosis: ['Hypertension', 'Diabetes'],
        notes: 'Routine checkup, adjusted medication',
        status: 'completed'
      },
      {
        id: 'V102',
        patientName: 'Sarah Smith',
        visitDate: '2024-01-15',
        diagnosis: ['Asthma'],
        notes: 'Follow-up visit, condition improved',
        status: 'completed'
      },
      {
        id: 'V103',
        patientName: 'Mike Johnson',
        visitDate: '2024-01-14',
        diagnosis: ['Common Cold'],
        notes: 'Prescribed rest and fluids',
        status: 'completed'
      }
    ],
    charts: {
      visits: [
        { name: 'Week 1', visits: 12 },
        { name: 'Week 2', visits: 19 },
        { name: 'Week 3', visits: 8 },
        { name: 'Week 4', visits: 15 }
      ],
      diagnosis: [
        { name: 'Hypertension', value: 45 },
        { name: 'Diabetes', value: 32 },
        { name: 'Asthma', value: 18 },
        { name: 'Other', value: 5 }
      ],
      medications: [
        { name: 'Lisinopril', prescriptions: 28 },
        { name: 'Metformin', prescriptions: 22 },
        { name: 'Albuterol', prescriptions: 15 },
        { name: 'Amoxicillin', prescriptions: 12 },
        { name: 'Atorvastatin', prescriptions: 8 }
      ]
    }
  }
};