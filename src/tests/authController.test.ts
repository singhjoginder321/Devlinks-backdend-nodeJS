import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import cloudinary from '../config/cloudinaryConfig';
import emailVerificationTemplate from '../tempelate/mail/emailVerificationTemplate';
import generateToken from '../utils/generateToken';
import mailSender from '../utils/mailSender';
import query from '../utils/query';
import {
  registerUser,
  loginUser,
  logoutUser,
  authenticateToken,
  sendotp,
  resetPassword
} from '../controllers/authController';

dotenv.config();

jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('jsonwebtoken');
jest.mock('fs');
jest.mock('../config/cloudinaryConfig');
jest.mock('../utils/generateToken');
jest.mock('../utils/mailSender');
jest.mock('../utils/query');

const mockQuery = query as jest.Mock;
const mockGenerateToken = generateToken as jest.Mock;
const mockMailSender = mailSender as jest.Mock;
const mockCloudinary = cloudinary.uploader.upload as jest.Mock;

describe('AuthController Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Name, email, password, and OTP are required" });
    });

    it('should return 400 if OTP is invalid', async () => {
      const req = { body: { name: 'John', email: 'john@example.com', password: 'password', otp: '123456' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [] }); // No OTP record

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired OTP" });
    });

    it('should successfully register a new user', async () => {
      const req = { body: { name: 'John', email: 'john@example.com', password: 'password', otp: '123456' }, file: { path: 'path/to/file' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [{ otp: '123456' }] }); // OTP record
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing users
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      mockCloudinary.mockResolvedValue({ secure_url: 'http://example.com/profile.jpg' });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: '1', name: 'John', email: 'john@example.com', password: 'hashedPassword', profile_picture: 'http://example.com/profile.jpg' }] });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully", user: expect.any(Object) });
    });
  });

  describe('loginUser', () => {
    it('should return 400 if user does not exist', async () => {
      const req = { body: { email: 'john@example.com', password: 'password' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [] }); // No users

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials - user doesn't exist" });
    });

    it('should return 400 if password does not match', async () => {
      const req = { body: { email: 'john@example.com', password: 'password' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [{ email: 'john@example.com', password: 'hashedPassword' }] });
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials - password do not match" });
    });

    it('should successfully log in a user', async () => {
      const req = { body: { email: 'john@example.com', password: 'password' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [{ email: 'john@example.com', password: 'hashedPassword' }] });
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('token');

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged In Successfully", token: 'token' });
    });
  });

  describe('logoutUser', () => {
    it('should log out the user successfully', () => {
      const res = { cookie: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      logoutUser(res);

      expect(res.cookie).toHaveBeenCalledWith("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        sameSite: "strict",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      const req = { headers: {} } as any;
      const res = { sendStatus: jest.fn() } as unknown as Response;
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 403 if token is invalid', () => {
      const req = { headers: { authorization: 'Bearer invalidToken' } } as any;
      const res = { sendStatus: jest.fn() } as unknown as Response;
      const next = jest.fn();

      jwt.verify = jest.fn().mockImplementation((token, secret, callback) => callback(new Error('Invalid token'), null));

      authenticateToken(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    it('should call next if token is valid', () => {
      const req = { headers: { authorization: 'Bearer validToken' } } as any;
      const res = { sendStatus: jest.fn() } as unknown as Response;
      const next = jest.fn();

      jwt.verify = jest.fn().mockImplementation((token, secret, callback) => callback(null, { user: 'user' }));

      authenticateToken(req, res, next);

      expect(req.user).toEqual({ user: 'user' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendotp', () => {
    it('should return 401 if user already exists', async () => {
      const req = { body: { email: 'john@example.com' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [{ email: 'john@example.com' }] });

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: `User is Already Registered` });
    });

    it('should successfully send OTP', async () => {
      const req = { body: { email: 'john@example.com' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing users
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing OTPs
      mockMailSender.mockResolvedValue(undefined);

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: `OTP Sent Successfully`, otp: expect.any(String) });
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if email is missing', async () => {
      const req = { body: {} } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email is required' });
    });

    it('should return 404 if no user found with provided email', async () => {
      const req = { body: { email: 'nonexistent@example.com' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [] });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No user found with this email' });
    });

    it('should successfully send reset password email', async () => {
      const req = { body: { email: 'john@example.com' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'John' }] });
      mockQuery.mockResolvedValueOnce(undefined); // Mock query for update
      mockMailSender.mockResolvedValue(undefined);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Password reset email sent successfully' });
    });
  });
});
