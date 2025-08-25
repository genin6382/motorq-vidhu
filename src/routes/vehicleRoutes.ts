import express from 'express';
import * as vehicleService from '../services/vehicleService';

const router = express.Router();

router.get('/',vehicleService.getAllVehicles);
router.get('/:vin',vehicleService.getVehicleById);
router.post('/create',vehicleService.createVehicle);
router.delete('/delete/:vin',vehicleService.deleteVehicle);

export default router;