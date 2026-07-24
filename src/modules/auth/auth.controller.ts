import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbFindUserByEmail, dbCreateUser } from '../../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'womb_jwt_secret_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await dbFindUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const safeRole = role === 'admin' ? 'customer' : role;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await dbCreateUser({ name, email, password: hashedPassword, role: safeRole });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: newUser.id, name, email, role: newUser.role },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbFindUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await dbFindUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
