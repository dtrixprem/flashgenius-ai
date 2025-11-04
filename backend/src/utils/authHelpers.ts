import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';

export const checkUserAuth = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'User not authenticated'
      }
    });
    return false;
  }
  return true;
};