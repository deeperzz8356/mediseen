import { notFound } from "next/navigation"
import { conditions } from "../data"
import WellnessDetail from "./WellnessDetail"

export async function generateStaticParams() {
  return conditions.map((condition) => ({
    id: condition.id,
  }))
}

export default async function WellnessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params
  const condition = conditions.find(c => c.id === unwrappedParams.id)
  
  if (!condition) return notFound()

  return <WellnessDetail condition={condition} id={unwrappedParams.id} />
}
