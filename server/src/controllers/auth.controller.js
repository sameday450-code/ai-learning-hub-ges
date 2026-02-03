/**
 * Authentication Controller
 * Handles student registration, login, and profile management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { email, password, firstName, lastName, className, phoneNumber } = req.body;

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return next(new AppError('Email already registered', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new student
    const student = await prisma.student.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        className,
        phoneNumber
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        className: true,
        profileImage: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(student.id);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        student,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login student
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { email }
    });

    if (!student) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, student.password);

    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Remove password from response
    const { password: _, ...studentData } = student;

    // Generate token
    const token = generateToken(student.id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        student: studentData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current student profile
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.student.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        className: true,
        phoneNumber: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            progress: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update student profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, className } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id: req.student.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(className && { className })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        className: true,
        phoneNumber: true,
        profileImage: true
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    next(error);
  }
};
