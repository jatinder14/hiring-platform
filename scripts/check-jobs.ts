import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const jobs = await prisma.job.findMany({
        where: {
            title: {
                contains: 'jgnken'
            }
        }
    });
    console.log(JSON.stringify(jobs, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
