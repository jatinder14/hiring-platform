
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start migrating users from CLIENT to RECRUITER...');

    // 1. Update all users where userRole is 'CLIENT' to 'RECRUITER'
    // Note: Since 'CLIENT' might not be in the generated client types if we haven't run generate yet with it,
    // or if we are about to remove it, passing the string directly or using updateMany is safest.
    // However, Prisma types are strict.

    // We will try raw update or updateMany.
    // updateMany is safer as it doesn't require fetching.

    const result = await prisma.user.updateMany({
        where: {
            userRole: 'CLIENT'
        },
        data: {
            userRole: 'RECRUITER'
        }
    });
    console.log(`Migrated ${result.count} users.`);
    console.log('Migration finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
