import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { GrantAuditorSchema } from '@cyphra/shared';

export const activityRouter: Router = Router();

/**
 * GET /api/activity
 * Fetch transaction activity for the wallet in x-wallet-address header.
 * Query params: limit (1-100, default 20), offset (default 0), type (filter by type)
 */
activityRouter.get('/', ActivityController.getActivity);

/**
 * POST /api/activity/record
 * Records a new activity entry for a wallet after a confirmed transaction.
 */
activityRouter.post('/record', ActivityController.record);

/**
 * POST /api/activity/grant-auditor
 * Grants an auditor viewing key access with a permission bitmask.
 */
activityRouter.post(
  '/grant-auditor',
  validateBody(GrantAuditorSchema),
  ActivityController.grantAuditor
);

/**
 * POST /api/activity/disclose
 * Generates a selective disclosure report for compliance/auditing.
 */
activityRouter.post('/disclose', ActivityController.generateReport);
