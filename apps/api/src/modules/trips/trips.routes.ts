import { Router } from 'express';
import { TripsController } from './trips.controller';
import { asyncHandler } from '../../core/utils/asyncHandler';
// Would also import authMiddleware assuming only Admins can create trips

const router = Router();
const tripsController = new TripsController();

router.post('/', asyncHandler(tripsController.create));
router.get('/', asyncHandler(tripsController.search));
router.get('/:id', asyncHandler(tripsController.getById));

export default router;
