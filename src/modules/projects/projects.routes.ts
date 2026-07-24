import { Router } from 'express';
import { createProject, createProjectBid, getAdminProjects, getProjects } from './projects.controller';
import { requireAuth, requireVendor } from '../auth/auth.middleware';

const router = Router();

router.get('/', getProjects);
router.get('/admin', getAdminProjects);
router.post('/', createProject);
router.post('/:id/bids', requireAuth, requireVendor, createProjectBid);

export default router;
