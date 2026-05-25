import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

export class X402PaymentHandler {
    private server: any;
    private keypair: StellarSdk.Keypair;

    constructor() {
        // Using the bulletproof Horizon server
        const ServerClass = StellarSdk.Horizon?.Server || (StellarSdk as any).Server;
        this.server = new ServerClass('https://horizon.stellar.org');
        
        const secret = process.env.AGENT_STELLAR_SECRET;
        if (!secret) throw new Error("Missing AGENT_STELLAR_SECRET in .env");
        this.keypair = StellarSdk.Keypair.fromSecret(secret);
    }

    /**
     * Attempts to fetch data. If a 402 is returned, it pays autonomously and retries.
     */
    async fetchProtectedData(url: string): Promise<any> {
        try {
            console.log(`🤖 Agent requesting data from: ${url}`);
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 402) {
                console.log("[x402] 402 Payment Required detected!");
                const challenge = error.response.data.accepts[0];
                
                // 1. Pay the invoice
                const txHash = await this.payInvoice(challenge);
                console.log(`[x402] Payment Sent! Hash: ${txHash}`);

                // 2. Wait 3 seconds for the network to fully index the payment
                console.log("Waiting for ledger confirmation...");
                await new Promise(resolve => setTimeout(resolve, 3000));

                // 3. Retry the request with the transaction receipt in the header
                console.log("Retrying request with payment receipt...");
                const retryResponse = await axios.get(url, {
                    headers: { 'x-payment': txHash }
                });
                
                return retryResponse.data;
            }
            throw error;
        }
    }

    private async payInvoice(challenge: any): Promise<string> {
        const account = await this.server.loadAccount(this.keypair.publicKey());
        const usdcAsset = new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');
        
        // Convert stroops to decimal string (Stellar uses 7 decimals)
        const amountInUnits = (parseInt(challenge.maxAmountRequired) / 10000000).toString();
        
        console.log(`Agent paying ${amountInUnits} USDC to ${challenge.payTo}...`);

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.PUBLIC
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: challenge.payTo,
            asset: usdcAsset,
            amount: amountInUnits
        }))
        .setTimeout(60)
        .build();

        tx.sign(this.keypair);
        const res = await this.server.submitTransaction(tx);
        return res.hash;
    }
}