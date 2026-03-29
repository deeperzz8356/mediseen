import React from "react"
import { 
  HeartPulse, 
  Sun, 
  Activity, 
  Shield, 
  Smile
} from "lucide-react"

export const conditions = [
  { id: "pneumonia", name: "Pneumonia", icon: React.createElement(Activity), color: "bg-pastel-blue" },
  { id: "eczema", name: "Eczema (Atopic Dermatitis)", icon: React.createElement(Smile), color: "bg-pastel-pink" },
  { id: "psoriasis", name: "Psoriasis", icon: React.createElement(Shield), color: "bg-pastel-violet" },
  { id: "melanoma", name: "Melanoma", icon: React.createElement(Sun), color: "bg-pastel-yellow" },
  { id: "ringworm", name: "Ringworm", icon: React.createElement(HeartPulse), color: "bg-pastel-green" },
  { id: "warts", name: "Warts", icon: React.createElement(Shield), color: "bg-pastel-blue" },
  { id: "molluscum-contagiosum", name: "Molluscum Contagiosum", icon: React.createElement(Smile), color: "bg-pastel-pink" },
  { id: "acne", name: "Acne", icon: React.createElement(Smile), color: "bg-pastel-violet" },
  { id: "rosacea", name: "Rosacea", icon: React.createElement(Smile), color: "bg-pastel-yellow" },
  { id: "vitiligo", name: "Vitiligo", icon: React.createElement(Sun), color: "bg-pastel-green" },
  { id: "impetigo", name: "Impetigo", icon: React.createElement(Shield), color: "bg-pastel-blue" },
  { id: "contact-dermatitis", name: "Contact Dermatitis", icon: React.createElement(Smile), color: "bg-pastel-pink" },
]
