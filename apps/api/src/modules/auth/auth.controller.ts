import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.dto';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    res.status(201).json({ status: 'success', data: { user } });
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json({ status: 'success', data: result });
  }
}
