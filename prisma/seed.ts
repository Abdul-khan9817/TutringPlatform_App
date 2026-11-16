import { PrismaClient, Language, DeliveryMode } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Business settings
  await prisma.businessSetting.upsert({
    where: { key: 'business_name' },
    update: {},
    create: { key: 'business_name', value: 'WorkSpeak Portugal' },
  })
  await prisma.businessSetting.upsert({
    where: { key: 'business_email' },
    update: {},
    create: { key: 'business_email', value: 'hello@workspeakportugal.com' },
  })
  await prisma.businessSetting.upsert({
    where: { key: 'default_timezone' },
    update: {},
    create: { key: 'default_timezone', value: 'Europe/Lisbon' },
  })

  // Services — PLACEHOLDER PRICES. Admin must set real prices before going live.
  const services = [
    { name: 'Portuguese Lesson (60 min)', slug: 'portuguese-60', language: Language.PORTUGUESE, deliveryMode: DeliveryMode.BOTH, durationMinutes: 60, price: 0, description: 'Individual 60-minute Portuguese lesson. Price to be configured by admin.' },
    { name: 'English Lesson (60 min)', slug: 'english-60', language: Language.ENGLISH, deliveryMode: DeliveryMode.BOTH, durationMinutes: 60, price: 0, description: 'Individual 60-minute English lesson. Price to be configured by admin.' },
    { name: 'Portuguese Lesson (90 min)', slug: 'portuguese-90', language: Language.PORTUGUESE, deliveryMode: DeliveryMode.BOTH, durationMinutes: 90, price: 0, description: 'Individual 90-minute Portuguese lesson. Price to be configured by admin.' },
    { name: 'English Lesson (90 min)', slug: 'english-90', language: Language.ENGLISH, deliveryMode: DeliveryMode.BOTH, durationMinutes: 90, price: 0, description: 'Individual 90-minute English lesson. Price to be configured by admin.' },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, currency: 'EUR', isActive: false }, // isActive false until admin sets prices
    })
  }

  console.log('⚠️  Services created with ZERO prices and isActive=false.')
  console.log('   Admin must set real prices and activate them before accepting bookings.')
  console.log('✅ Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
