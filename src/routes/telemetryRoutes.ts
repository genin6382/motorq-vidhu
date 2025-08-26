import express from 'express';
import * as telemetryService from '../services/telemetryService';


const router = express.Router();

router.get('/',telemetryService.getAllTelemetry);
router.get('/history/:vin',telemetryService.getTelemetryHistory);
router.get('/latest/:vin',telemetryService.getLatestTelemetry);
router.post('/create',telemetryService.createTelemetry);
router.post('/create/batch',telemetryService.createBatchTelemetry);


export default router;