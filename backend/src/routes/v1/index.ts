import { Router } from 'express';
import { getHealthCheck } from '../../controllers/health.controller';
import leadRoutes from '../lead.routes';
import importRoutes from '../import.routes';

const v1Router = Router();

/** Health check endpoint */
v1Router.get('/health', getHealthCheck);

/** Leads endpoints */
v1Router.use('/leads', leadRoutes);

/** Import endpoints */
v1Router.use('/import', importRoutes);

export { v1Router };
