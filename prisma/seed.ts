import { News, PrismaClient, Service } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')
  
  // Nettoyage des données existantes (optionnel)
  await prisma.formation.deleteMany()
  await prisma.service.deleteMany()
  await prisma.news.deleteMany()
  //await prisma.user.deleteMany()
  
  // Création des utilisateurs
  await seedUsers()
  
  // Création des formations
  await seedFormations()

  await seedServices()

  await seedNews()
  
  console.log('✅ Seeding terminé!')
}

async function seedUsers() {
  console.log('👥 Création des utilisateurs...')
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'super@admin.com' }
  })
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'super@admin.com',
        name: 'Super Admin',
        password: await bcrypt.hash('Azertyuiop123', 10),
        role: 'super_admin'
      }
    })
    console.log('✅ Admin créé')
  } else {
    console.log('ℹ️ Admin existe déjà')
  }
  
}

async function seedFormations() {
  console.log('📚 Création des formations...')
  
  const formations = [
    {
      label: 'Formation ERP',
      description: 'Formation aux risques dans les Établissements Recevant du Public',
      days: 3,
      maxParticipants: 12,
      amount: 150000,
      modules: [
        'Réglementation ERP',
        'Évacuation',
        'Premiers secours',
        'Exercices pratiques'
      ]
    },
    {
      label: 'Formation IGH',
      description: 'Sécurité incendie dans les Immeubles de Grande Hauteur',
      days: 5,
      maxParticipants: 10,
      amount: 250000,
      modules: [
        'Spécificités IGH',
        'Systèmes de sécurité',
        'Gestion de crise',
        'Simulations'
      ]
    },
    {
      label: 'SST Initial',
      description: 'Formation initiale Sauveteur Secouriste du Travail',
      days: 2,
      maxParticipants: 15,
      amount: 100000,
      modules: [
        'Prévention',
        'Secours',
        'Protection',
        'Alerte'
      ]
    }
  ]

  const existingFormations = await prisma.formation.findMany()

  if (!existingFormations.length) {
    for (const formation of formations) {
      await prisma.formation.create({
        data: formation
      })
    }
    
    console.log(`✅ ${formations.length} formations créées`)
  } else {
    console.log('ℹ️ formations existent déjà')
  }
}

async function seedServices() {
  console.log('📚 Création des services...')
  
  const services = [
    {
      label: 'Sécurité Incendie',
      description: 'Installation et maintenance des systèmes de sécurité incendie',
      content: [
        'Audit de sécurité',
        "Installation d'extincteurs",
        "Systèmes de détection",
        "Plans d'évacuation"
      ]
    },
    {
      label: 'Secours Événementiels',
      description: 'Dispositifs de secours pour vos événements',
      content: [
        'Événements sportifs',
        'Concerts et festivals',
        'Conférences',
        'Manifestations publiques'
      ]
    },
    {
      label: 'Vente de Matériel',
      description: 'Équipements de sécurité professionnels',
      content: [
        "Extincteurs",
        "Défibrillateurs",
        "Équipements de protection",
        "Signalisation"
      ]
    },
    {
      label: 'Escorte de Convois',
      description: 'Sécurisation de vos transports sensibles',
      content: [
        "Convois exceptionnels",
        "Transport de valeurs",
        "Escorte VIP",
        "Assistance routière"
      ]
    }
  ]

  const existingServices = await prisma.service.findMany()

  if (!existingServices.length) {
    for (const service of services) {
      await prisma.service.create({
        data: service
      })
    }
    
    console.log(`✅ ${services.length} servies créées`)
  } else {
    console.log('ℹ️ services existent déjà')
  }
}


async function seedNews() {
  console.log('📚 Création des news...')
  
  const news = [
    {
      label: "Nouvelles normes de sécurité incendie en Côte d'Ivoire",
      type: "Réglementation",
      description: "Les dernières mises à jour des normes de sécurité incendie pour les établissements recevant du public.",
      content: "",
      eventDate: new Date("2024-04-10")
    },
    {
      label: "SSISPRO obtient la certification ISO 9001",
      type: "Entreprise",
      description: "Une reconnaissance internationale de notre engagement pour la qualité.",
      content: "",
      eventDate: new Date("2024-04-05")
    },
    {
      label: "Guide : Préparer son établissement aux risques d'incendie",
      type: "Prévention",
      description: "Les étapes essentielles pour sécuriser votre établissement.",
      content: "",
      eventDate: new Date("2024-04-01")
    },
    {
      label: "Succès de notre dernière formation ERP",
      type: "Formation",
      description: "Retour sur la session de formation qui a réuni 15 professionnels.",
      content: "",
      eventDate: new Date("2024-03-28")
    },
  ]

  const existingNews = await prisma.news.findMany()

  if (!existingNews.length) {
    for (const _ of news) {
      await prisma.news.create({
        data: _
      })
    }
    
    console.log(`✅ ${news.length} actualités créées`)
  } else {
    console.log('ℹ️ actualité existent déjà')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })