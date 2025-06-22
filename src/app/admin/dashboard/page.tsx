"use client"

import AppHeader from "@/components/app-header"
import DashboardCard from "@/components/ui/dashboard-card"
import {
  newsServices,
  formationsService,
  servicesServices,
} from "@/lib/api-service"
import { SearchCheck, Signature } from "lucide-react"
import { useEffect, useState } from "react"

export default function Page() {
  const [news, setNews] = useState<number | undefined>()
  const [formations, setFormations] = useState<number | undefined>()
  const [services, setService] = useState<number | undefined>()

  const fetchNews = async () => {
    const news = await newsServices.getAll()
    setNews(news.length)
  }

  const fetchFormations = async () => {
    const formations = await formationsService.getAll()
    setFormations(formations.length)
  }

  const fetchService = async () => {
    const services = await servicesServices.getAll()
    setService(services.length)
  }

  useEffect(() => {
    fetchNews()
    fetchFormations()
    fetchService()
  }, [])

  return (
    <div>
      <AppHeader parent="Dashboard" child="" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <DashboardCard
            icon={<SearchCheck />}
            title="Actualités"
            titleClassName="text-2xl font-medium text-muted-foreground"
            total={news ?? 0}
          />
          <DashboardCard
            icon={<Signature />}
            title="Formations"
            titleClassName="text-2xl font-medium text-muted-foreground"
            total={formations ?? 0}
          />
          <DashboardCard
            icon={<Signature />}
            title="Services"
            titleClassName="text-2xl font-medium text-muted-foreground"
            total={services ?? 0}
          />
        </div>
      </div>
    </div>
  )
}
