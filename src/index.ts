import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db';

import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import projectsRoutes from './modules/projects/projects.routes';
import professionalsRoutes from './modules/professionals/professionals.routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    service: 'Womb Platform API Engine',
    timestamp: new Date().toISOString(),
    paystack_configured: !!process.env.PAYSTACK_SECRET_KEY,
  });
});

// Module API Routing
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/professionals', professionalsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server & Initialize Database
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`[Womb API] Express server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
});
