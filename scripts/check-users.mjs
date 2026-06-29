import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });

    console.log(`✅ Total users found: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users in database!');
      console.log('💡 Run: npx prisma migrate reset --force');
      console.log('   This will reset and seed the database.\n');
    } else {
      console.log('📋 Users:');
      users.forEach(user => {
        console.log(`- ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
        console.log('');
      });
    }

    // Test specific login
    const testEmail = 'budi@admin.uns.ac.id';
    const testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (testUser) {
      console.log(`✅ Test user "${testEmail}" exists!`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Password (should be hashed): ${testUser.password.substring(0, 30)}...`);
    } else {
      console.log(`❌ Test user "${testEmail}" NOT FOUND!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2021') {
      console.log('\n💡 The database table does not exist.');
      console.log('   Run: npx prisma migrate dev\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
