import { HeartPulse, Droplets, Sun, Shield, Activity } from "lucide-react"

export const conditions = [
  {
    id: "pneumonia",
    name: "Pneumonia",
    icon: <HeartPulse className="w-6 h-6 text-white" />,
    color: "bg-red-500"
  },
  {
    id: "eczema",
    name: "Eczema",
    icon: <Droplets className="w-6 h-6 text-white" />,
    color: "bg-blue-500"
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    icon: <Sun className="w-6 h-6 text-white" />,
    color: "bg-orange-500"
  },
  {
    id: "melanoma",
    name: "Melanoma",
    icon: <Shield className="w-6 h-6 text-white" />,
    color: "bg-purple-500"
  },
  {
    id: "ringworm",
    name: "Ringworm",
    icon: <Activity className="w-6 h-6 text-white" />,
    color: "bg-green-500"
  },
  {
    id: "acne",
    name: "Acne",
    icon: <Activity className="w-6 h-6 text-white" />,
    color: "bg-pink-500"
  },
  {
    id: "rosacea",
    name: "Rosacea",
    icon: <Sun className="w-6 h-6 text-white" />,
    color: "bg-rose-500"
  },
  {
    id: "vitiligo",
    name: "Vitiligo",
    icon: <Shield className="w-6 h-6 text-white" />,
    color: "bg-gray-500"
  }
]
