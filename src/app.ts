import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import projectsRoutes from './modules/projects/projects.routes';
import professionalsRoutes from './modules/professionals/professionals.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    service: 'Womb Platform API Engine',
    routes: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      payments: '/api/payments',
      rentals: '/api/rentals',
      projects: '/api/projects',
      professionals: '/api/professionals',
      users: '/api/users',
    },
  });
});

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    service: 'Womb Platform API Engine',
    timestamp: new Date().toISOString(),
    paystack_configured: !!process.env.PAYSTACK_SECRET_KEY,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/users', usersRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
