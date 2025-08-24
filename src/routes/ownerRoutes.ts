import express from 'express';
import * as userService from '../services/ownerService';


const router = express.Router();

router.get('/', userService.getAllOwners);
router.get('/:ownerId', userService.getOwnerById);
router.post('/create', userService.createOwner);

export default router;