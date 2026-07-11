import { Router } from 'express';
import { v1Router } from './v1';

const rootRouter = Router();

/** Mount API version 1 */
rootRouter.use('/v1', v1Router);

export { rootRouter };
