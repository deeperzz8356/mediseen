// Data layer for diseases
// Separating content from UI to make updating easy

export type DiseaseId = "pneumonia" | "skin-rash" | string;

export interface Disease {
  id: DiseaseId;
  name: string;
  description: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  illustration: string; // Identifier for the icon/graphic to render on the frontend (e.g., 'Lungs')
}

export const diseases: Disease[] = [
  {
    id: "pneumonia",
    name: "Pneumonia",
    description: "An infection that inflames the air sacs in one or both lungs.",
    illustration: "Lungs", // Maps to the Lungs icon from lucide-react
    symptoms: [
      "Cough, which may produce greenish, yellow or even bloody mucus",
      "Fever, sweating and shaking chills",
      "Shortness of breath",
      "Rapid, shallow breathing",
      "Sharp or stabbing chest pain that gets worse when you breathe deeply or cough",
      "Loss of appetite, low energy, and fatigue"
    ],
    prevention: [
      "Get vaccinated (pneumococcal vaccine, flu shot)",
      "Practice good hygiene (wash hands regularly)",
      "Don't smoke, as it damages your lungs' natural defenses",
      "Keep your immune system strong with sleep, exercise, and a healthy diet"
    ],
    treatment: [
      "Antibiotics for bacterial pneumonia",
      "Rest and plenty of fluids",
      "Over-the-counter pain relievers and fever reducers",
      "Cough medicine to help you rest"
    ]
  },
  {
    id: "skin-rash",
    name: "Skin Rash",
    description: "Skin irritation that causes changes in color or texture.",
    illustration: "Activity", // Maps to the Activity icon from lucide-react
    symptoms: [
      "Redness or discoloration of the skin",
      "Itching, tingling or burning sensation",
      "Bumps, blisters, or lesions",
      "Dry, scaly, or crusted skin",
      "Swelling in the affected area",
      "Warmth around the rash"
    ],
    prevention: [
      "Avoid known triggers and allergens",
      "Keep skin moisturized",
      "Use gentle, fragrance-free soaps and detergents",
      "Wear loose-fitting, breathable clothing (cotton is best)",
      "Protect skin from extreme temperatures and excessive sun exposure"
    ],
    treatment: [
      "Over-the-counter hydrocortisone cream for itching",
      "Cool compresses to soothe the area",
      "Oatmeal baths",
      "Antihistamines for allergic reactions",
      "Prescription medications for severe cases"
    ]
  }
];
