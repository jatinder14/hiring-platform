// scripts/test-db-connection.mjs
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.DATABASE_URL;

if (!uri) {
    console.error("❌ DATABASE_URL is missing in .env.local");
    process.exit(1);
}

console.log("🔍 Testing MongoDB Connection...");
console.log(`📡 Connecting to: ${uri.replace(/:[^:]*@/, ":****@")}`); // Hide password

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
});

async function run() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
        await client.db("admin").command({ ping: 1 });
        console.log("🏓 Ping successful!");
    } catch (error) {
        console.error("❌ Connection failed:", error);
    } finally {
        await client.close();
    }
}

run();
