import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

export const authController = {
  // Real Login with bcrypt verification
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          cashBalance: user.cashBalance,
          riskProfile: user.riskProfile,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Real Signup with validation and hashing
  async register(req, res) {
    try {
      const { email, name, password, riskProfile = 'MODERATE' } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Email, name, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const existing = await db.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await db.createUser({
        email,
        name,
        passwordHash,
        cashBalance: 100000.0,
        riskProfile,
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully with ₹1,00,000 starting virtual balance!',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          cashBalance: newUser.cashBalance,
          riskProfile: newUser.riskProfile,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Instant Guest / One-Click Demo Login
  async guestLogin(req, res) {
    try {
      let demoUser = await db.findUserByEmail('demo@investiq.com');
      if (!demoUser) {
        demoUser = await db.findUserById('demo-user-1') || db.data.users[0];
      }

      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email, name: demoUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in as Demo Investor',
        token,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          cashBalance: demoUser.cashBalance,
          riskProfile: demoUser.riskProfile,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const user = (await db.findUserById(userId)) || (await db.findUserByEmail('demo@investiq.com')) || db.data.users[0];

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          cashBalance: user.cashBalance,
          riskProfile: user.riskProfile,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
