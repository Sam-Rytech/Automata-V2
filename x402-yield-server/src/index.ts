import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Your Stellar receiving wallet address (Starts with G)
const PAY_TO_ADDRESS = process.env.PAYMENT_ADDRESS || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

// Stellar USDC Soroban Contract ID (Mainnet)
const STELLAR_USDC_CONTRACT = 'CCW67TSZV3NEJEXQCESSVDTZEQB2B4CEPMU74WPEVN2KPEV5J66KILUI';

// Custom x402 Middleware for Stellar
// Notice we use express.Request instead of a named import to bypass the ESM/CJS issue
const stellarX402Middleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const paymentHeader = req.headers['x-payment'] || req.headers['authorization'];
  
  if (!paymentHeader) {
    // Send strict x402 standard payload
    res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: [{
        scheme: "exact",
        network: "stellar",
        maxAmountRequired: "10000", // $0.001 in stroops
        resource: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        payTo: PAY_TO_ADDRESS,
        asset: STELLAR_USDC_CONTRACT,
        maxTimeoutSeconds: 60
      }]
    });
    return;
  }
  
  // If we reach here, the agent has provided a payment receipt.
  next();
};

// Unprotected Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected Yield Data Route 
app.get('/api/yield', stellarX402Middleware, (req, res) => {
  const yieldData = {
    timestamp: new Date().toISOString(),
    rates: [
      { protocol: 'Aave', network: 'Base', asset: 'USDC', apy: '4.2%' },
      { protocol: 'Mento', network: 'Celo', asset: 'USDC', apy: '6.8%' },
      { protocol: 'Aave', network: 'Ethereum', asset: 'USDC', apy: '3.1%' },
    ]
  };
  
  res.json(yieldData);
});

app.listen(port, () => {
  console.log(`x402 Yield Server running on port ${port}`);
  console.log(`Payment required: $0.001 USDC (10000 stroops) on Stellar for /api/yield`);
});
