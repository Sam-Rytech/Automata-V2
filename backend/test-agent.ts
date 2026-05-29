import { X402PaymentHandler } from './src/services/X402PaymentHandler'; // adjust path if needed
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
    const handler = new X402PaymentHandler();
    // Replace with your actual Railway URL
    const url = 'https://automata-x402-production.up.railway.app/api/yield'; 
    
    try {
        console.log("🚀 Starting End-to-End Agent Test...");
        const data = await handler.fetchProtectedData(url);
        
        console.log("\n🎉 SUCCESS! Agent successfully unlocked the data:");
        console.log(JSON.stringify(data, null, 2));
    } catch (err: any) {
        console.error("❌ Test Failed:", err.message);
    }
}

runTest();