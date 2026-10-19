import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';

// Middlewares
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

// Modular Routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import productRoutes from './modules/products/products.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Base Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check & Service status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'E-commerce Modular API Server',
    database: 'Neon PostgreSQL (Prisma ORM)'
  });
});

// Demo accounts endpoint
app.get('/api/demo-accounts', (req, res) => {
  res.json({
    admin: {
      email: 'admin@store.com',
      password: 'adminpassword123',
      role: 'ADMIN',
      description: 'Store Administrator with full access to stats, products, inventory, and orders'
    },
    customer: {
      email: 'customer@store.com',
      password: 'customerpassword123',
      role: 'USER',
      description: 'Standard customer with cart, checkout, and order history capabilities'
    }
  });
});

// Mount Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Lumina E-Commerce Modular API Server',
    version: '2.0.0',
    structure: {
      config: 'Database connection & environment configuration',
      middlewares: 'Authentication, admin authorization & error handling',
      utils: 'JWT tokens, slug generators',
      modules: {
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        categories: '/api/categories',
        inventory: '/api/inventory',
        cart: '/api/cart',
        orders: '/api/orders',
        admin: '/api/admin'
      }
    }
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(ENV.PORT, () => {
  console.log(`E-commerce Server running on port ${ENV.PORT}`);
  console.log(` URL: http://localhost:${ENV.PORT}`);
});
