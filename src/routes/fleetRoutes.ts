import express from 'express';
import * as fleetService from '../services/fleetService';

const router = express.Router();

router.get('/',fleetService.getAllFleets);
router.get('/:fleetId',fleetService.getFleetById);
router.post('/create',fleetService.createFleet);

export default router;