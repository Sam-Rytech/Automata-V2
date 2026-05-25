import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function establishTrustline() {
    // We dynamically grab the Server class depending on how the SDK exposed it
    const ServerClass = StellarSdk.Horizon?.Server || (StellarSdk as any).Server;
    
    if (!ServerClass) {
        throw new Error("Could not find Server class in the SDK exports.");
    }

    const server = new ServerClass('https://horizon.stellar.org');
    
    // Load the secret from your .env file
    const secret = process.env.AGENT_STELLAR_SECRET;
    if (!secret) throw new Error("Missing AGENT_STELLAR_SECRET in .env");

    const agent = StellarSdk.Keypair.fromSecret(secret);
    
    console.log(`Loading account: ${agent.publicKey()}...`);
    
    try {
        const account = await server.loadAccount(agent.publicKey());
        const usdcAsset = new StellarSdk.Asset(
    'USDC', 
    'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' // <-- The real Mainnet Issuer!
);

        const tx = new StellarSdk.TransactionBuilder(account, { 
            fee: StellarSdk.BASE_FEE, 
            networkPassphrase: StellarSdk.Networks.PUBLIC 
        })
        .addOperation(StellarSdk.Operation.changeTrust({ asset: usdcAsset, limit: '1000000' }))
        .setTimeout(60)
        .build();

        tx.sign(agent);
        
        console.log("⏳ Submitting Trustline Transaction to Mainnet...");
        const res = await server.submitTransaction(tx);
        console.log("✅ SUCCESS! Transaction Hash:", res.hash);
        console.log("✅ USDC Trustline Established! Your agent can now hold USDC.");
        
    } catch (error: any) {
        console.error("❌ FAILED:");
        // This will print the exact reason if it fails (e.g., op_low_reserve)
        if (error.response && error.response.data) {
            console.error("Ledger Reason:", error.response.data.extras?.result_codes || error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

establishTrustline();