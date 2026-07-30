const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'kowaguru.info@gmail.com';
  const password = 'manx heps arcm clcy';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Find existing super admin
  const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  
  if (admins.length > 0) {
    console.log('Existing SUPER_ADMIN found. Updating email and password...');
    const admin = admins[0];
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: email,
        password: hashedPassword
      }
    });
    console.log(`Updated existing SUPER_ADMIN to use email: ${email}`);
  } else {
    console.log('No SUPER_ADMIN found. Creating one...');
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        shopName: 'Kowaguru Tech',
        email: email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        settings: {
          create: {
            businessName: 'Kowaguru TCMS Admin',
            businessAddress: '',
            phone: '07047495488',
            receiptFooter: '',
            measurementUnit: 'inches',
          }
        }
      }
    });
    console.log(`Created new SUPER_ADMIN with email: ${email}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
