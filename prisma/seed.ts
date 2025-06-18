import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')
  
  // Nettoyage des données existantes (optionnel)
  //await prisma.formation.deleteMany()
  //await prisma.user.deleteMany()
  
  // Création des utilisateurs
  await seedUsers()
  
  // Création des formations
  await seedFormations()
  
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
      label: 'Formation React JS',
      description: 'Apprenez React JS de A à Z avec des projets pratiques',
      days: 5,
      maxParticipants: 20,
      amount: 1500.00,
      modules: [
        'Introduction à React',
        'Components et Props',
        'State et Lifecycle',
        'Hooks avancés',
        'Projet final'
      ]
    },
    {
      label: 'Formation Node.js',
      description: 'Développement backend avec Node.js et Express',
      days: 4,
      maxParticipants: 15,
      amount: 1200.00,
      modules: [
        'Bases de Node.js',
        'Express Framework',
        'Base de données',
        'API REST',
        'Déploiement'
      ]
    },
    {
      label: 'Formation TypeScript',
      description: 'Maîtrisez TypeScript pour des applications robustes',
      days: 3,
      maxParticipants: 25,
      amount: 900.00,
      modules: [
        'Types de base',
        'Interfaces et Classes',
        'Génériques',
        'Modules',
        'Configuration avancée'
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

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })