import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@kuisto.ca'
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: adminEmail }
  })
  
  if (!user) {
    console.log(`❌ User ${adminEmail} not found. Please create the account first.`)
    return
  }
  
  console.log(`✅ Found user: ${user.email} (current role: ${user.role})`)
  
  // Check existing admins
  const existingAdmins = await prisma.user.findMany({
    where: { role: 'admin' }
  })
  
  console.log(`\n📊 Current admins: ${existingAdmins.length}`)
  existingAdmins.forEach(a => console.log(`   - ${a.email}`))
  
  // Check existing admin keys
  const existingKeys = await prisma.adminKey.findMany()
  console.log(`\n🔑 Existing admin keys: ${existingKeys.length}`)
  
  // Delete any keys matching known default patterns (security cleanup)
  const defaultPatterns = ['kuisto-admin-2024', 'akanut-admin-2024', 'kuisto-init-2024']
  for (const key of existingKeys) {
    if (defaultPatterns.some(p => key.key.includes(p))) {
      console.log(`   ⚠️ Deleting insecure key: ${key.key}`)
      await prisma.adminKey.delete({ where: { id: key.id } })
    } else {
      console.log(`   - ${key.key} (${key.name || 'unnamed'})`)
    }
  }
  
  // Promote user to admin
  const updatedUser = await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'admin' }
  })
  
  console.log(`\n✅ User ${updatedUser.email} promoted to admin!`)
  
  // Log this action
  await prisma.adminLog.create({
    data: {
      adminId: user.id,
      action: 'direct_promotion',
      targetType: 'user',
      targetId: user.id,
      details: JSON.stringify({ 
        email: adminEmail, 
        method: 'direct_database_promotion',
        note: 'First admin promoted via setup script'
      })
    }
  })
  
  console.log('\n📝 Admin log created')
  console.log('\n🎉 Setup complete! The user can now access the admin dashboard.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
