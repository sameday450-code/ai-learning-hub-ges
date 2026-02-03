/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import prisma from '../utils/prisma.js';

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if student still exists
    const student = await prisma.student.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        className: true,
        profileImage: true
      }
    });

    if (!student) {
      return next(new AppError('Student no longer exists.', 401));
    }

    // Grant access to protected route
    req.student = student;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};
