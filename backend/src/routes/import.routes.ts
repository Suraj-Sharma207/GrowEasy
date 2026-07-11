import { Router } from 'express';
import { importController } from '../controllers/import.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-csv', upload.single('file'), importController.analyzeCsv);
router.post('/process', importController.processImport);
router.get('/session/:importId', importController.getSession);

export default router;
