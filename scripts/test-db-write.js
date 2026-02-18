
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Starting DB write test...');
    try {
        const email = `testuser_${Date.now()}@example.com`;
        console.log(`Attempting to create user with email: ${email}`);

        // Try reading first
        const count = await prisma.user.count();
        console.log(`Current user count: ${count}`);

        const user = await prisma.user.create({
            data: {
                email: email,
                name: 'Test User',
                userRole: 'CANDIDATE'
            },
        });

        console.log('User created successfully:', user);
    } catch (e) {
        console.error('Error creating user:', e);
    } finally {
        await prisma.$disconnect();
        console.log('Disconnected');
    }
}

main();
