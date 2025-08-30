import express from 'express';
import * as alertService from '../services/alertService';


const router = express.Router();

router.get('/', alertService.getAllAlerts);
router.get('/:vin', alertService.getAlertByVin);

export default router;