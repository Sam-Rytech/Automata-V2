import { runAgent } from './src/agent/agent';
import dotenv from 'dotenv';

dotenv.config();

async function testFullAgent() {
    // A natural language prompt that requires the agent to buy data
    const userPrompt = "I have some USDC lying around. Can you check what the current yield rates are across different networks and tell me where I should put it?";
    
    console.log(`🗣️ User: "${userPrompt}"\n`);
    console.log("⏳ Waiting for Gemini AI to process and execute tools...\n");
    
    const result = await runAgent(
        userPrompt,
        process.env.GEMINI_API_KEY!
    );
    
    console.log("\n========================================");
    console.log("🤖 FINAL AI REPLY:");
    console.log("========================================");
    console.log(result.reply);
}

testFullAgent();