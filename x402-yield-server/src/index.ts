import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentMiddleware } from 'x402-express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Cast the address string to viem's strict 0x string format
const PAY_TO_ADDRESS = (process.env.PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Configure the x402 middleware
// This intercepts requests to GET /api/yield and demands $0.001 USDC on Base
app.use(paymentMiddleware(PAY_TO_ADDRESS, {
  "GET /api/yield": {
    price: "$0.001",
    network: "base"
  }
}));

// Unprotected Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected Yield Data Route 
// If a request makes it here, the x402 payment was successful
app.get('/api/yield', (req, res) => {
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
  console.log(`Payment required: $0.001 USDC on Base for /api/yield`);
});
