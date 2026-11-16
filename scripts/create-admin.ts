/**
 * Secure admin provisioning script.
 * Usage: npm run admin:create
 * Reads credentials from: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars.
 * Remove those env vars from your environment after running this script.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  const name = process.env.ADMIN_NAME?.trim() ?? 'Admin'

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set as environment variables.')
    console.error('   Export them in your shell before running this script.')
    console.error('   Remove them from your environment immediately after.')
    process.exit(1)
  }

  if (password.length < 12) {
    console.error('❌ Admin password must be at least 12 characters.')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log('ℹ️  Admin with this email already exists. No changes made.')
    } else {
      console.error('❌ A non-admin user with this email already exists.')
    }
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    select: { id: true, email: true, name: true, role: true },
  })

  console.log(`✅ Admin created: ${admin.name} <${admin.email}> [${admin.id}]`)
  console.log('⚠️  Remove ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME from your environment now.')
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
