const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const jobs = await prisma.job.findMany({ take: 1 });
        console.log('Jobs check:', jobs);
        process.exit(0);
    } catch (err) {
        console.error('Prisma Error:', err.message);
        process.exit(1);
    }
}

main();
