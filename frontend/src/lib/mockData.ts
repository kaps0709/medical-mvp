// Mock data for the AI Medical Scribe application

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  lastVisit: string;
  visits: Visit[];
}

export interface Visit {
  id: string;
  date: string;
  chiefComplaint: string;
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  prescriptionId?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medicines: Medicine[];
  advice: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "John Smith",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    lastVisit: "2024-01-15",
    visits: [
      {
        id: "v1",
        date: "2024-01-15",
        chiefComplaint: "Persistent cough and fever",
        soapNote: {
          subjective: "Patient complains of persistent dry cough for 5 days, accompanied by fever (101°F). Reports mild fatigue and loss of appetite.",
          objective: "Temperature: 100.8°F, BP: 120/80, Pulse: 82 bpm. Chest auscultation reveals mild wheezing in lower lobes.",
          assessment: "Upper respiratory tract infection with bronchial irritation.",
          plan: "Prescribed antibiotic course, cough suppressant, and advised rest. Follow-up in 5 days if symptoms persist."
        },
        prescriptionId: "rx1"
      },
      {
        id: "v2",
        date: "2023-12-10",
        chiefComplaint: "Annual health checkup",
        soapNote: {
          subjective: "Patient reports feeling generally well. No specific complaints.",
          objective: "Vitals normal. BMI 24.5. Blood work shows normal CBC and lipid panel.",
          assessment: "Healthy adult, no acute concerns.",
          plan: "Continue healthy lifestyle. Annual follow-up recommended."
        }
      }
    ]
  },
  {
    id: "p2",
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    email: "sarah.j@email.com",
    lastVisit: "2024-01-18",
    visits: [
      {
        id: "v3",
        date: "2024-01-18",
        chiefComplaint: "Headache and dizziness",
        soapNote: {
          subjective: "Patient reports recurring headaches for 2 weeks, primarily in the afternoon. Experiencing occasional dizziness.",
          objective: "BP: 118/75, Pulse: 78 bpm. Neurological exam normal. No visual disturbances.",
          assessment: "Tension-type headaches, possibly stress-related.",
          plan: "Prescribed analgesics, recommended stress management techniques and adequate hydration. Follow-up in 2 weeks."
        },
        prescriptionId: "rx2"
      }
    ]
  },
  {
    id: "p3",
    name: "Michael Brown",
    age: 58,
    gender: "Male",
    phone: "+1 (555) 345-6789",
    email: "m.brown@email.com",
    lastVisit: "2024-01-12",
    visits: [
      {
        id: "v4",
        date: "2024-01-12",
        chiefComplaint: "Diabetes follow-up",
        soapNote: {
          subjective: "Patient with Type 2 diabetes for follow-up. Reports good medication compliance.",
          objective: "Fasting glucose: 125 mg/dL, HbA1c: 6.8%. Weight stable. BP: 128/82.",
          assessment: "Type 2 Diabetes Mellitus, well-controlled.",
          plan: "Continue current medication regimen. Dietary counseling reinforced. Follow-up in 3 months."
        },
        prescriptionId: "rx3"
      }
    ]
  },
  {
    id: "p4",
    name: "Emily Davis",
    age: 28,
    gender: "Female",
    phone: "+1 (555) 456-7890",
    email: "emily.d@email.com",
    lastVisit: "2024-01-19",
    visits: [
      {
        id: "v5",
        date: "2024-01-19",
        chiefComplaint: "Skin rash",
        soapNote: {
          subjective: "Patient presents with itchy rash on arms for 3 days. No known allergies.",
          objective: "Erythematous macular rash on bilateral forearms. No signs of infection.",
          assessment: "Contact dermatitis, likely allergic reaction.",
          plan: "Prescribed topical steroid cream and oral antihistamine. Avoid potential allergens. Follow-up in 1 week if no improvement."
        },
        prescriptionId: "rx4"
      }
    ]
  }
];

export const mockPrescriptions: Prescription[] = [
  {
    id: "rx1",
    patientId: "p1",
    patientName: "John Smith",
    date: "2024-01-15",
    medicines: [
      {
        id: "m1",
        name: "Azithromycin 500mg",
        dosage: "500mg",
        frequency: "Once daily",
        duration: "5 days"
      },
      {
        id: "m2",
        name: "Dextromethorphan",
        dosage: "10ml",
        frequency: "Three times daily",
        duration: "7 days"
      },
      {
        id: "m3",
        name: "Paracetamol 650mg",
        dosage: "650mg",
        frequency: "As needed (max 4x daily)",
        duration: "5 days"
      }
    ],
    advice: "Take complete antibiotic course. Rest adequately. Drink plenty of fluids. Avoid cold beverages."
  },
  {
    id: "rx2",
    patientId: "p2",
    patientName: "Sarah Johnson",
    date: "2024-01-18",
    medicines: [
      {
        id: "m4",
        name: "Ibuprofen 400mg",
        dosage: "400mg",
        frequency: "Twice daily after meals",
        duration: "7 days"
      }
    ],
    advice: "Practice stress management. Ensure 7-8 hours of sleep. Stay hydrated. Avoid excessive screen time."
  },
  {
    id: "rx3",
    patientId: "p3",
    patientName: "Michael Brown",
    date: "2024-01-12",
    medicines: [
      {
        id: "m5",
        name: "Metformin 500mg",
        dosage: "500mg",
        frequency: "Twice daily with meals",
        duration: "90 days"
      }
    ],
    advice: "Continue low-carb diet. Regular exercise 30 mins daily. Monitor blood glucose weekly."
  },
  {
    id: "rx4",
    patientId: "p4",
    patientName: "Emily Davis",
    date: "2024-01-19",
    medicines: [
      {
        id: "m6",
        name: "Hydrocortisone 1% cream",
        dosage: "Apply thin layer",
        frequency: "Twice daily",
        duration: "7 days"
      },
      {
        id: "m7",
        name: "Cetirizine 10mg",
        dosage: "10mg",
        frequency: "Once daily at bedtime",
        duration: "7 days"
      }
    ],
    advice: "Avoid scratching affected areas. Keep skin moisturized. Identify and avoid potential allergens."
  }
];

export const dashboardStats = {
  patientsToday: 12,
  avgConsultationTime: "18 mins",
  prescriptionsGenerated: 8,
  totalPatients: 247
};
