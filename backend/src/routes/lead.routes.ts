import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';

const router = Router();

router.get('/', leadController.getLeads);
router.get('/statistics', leadController.getStatistics);

export default router;
