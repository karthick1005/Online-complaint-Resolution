const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const authService = {
  async register(data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'complainant'
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  },

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    if(!user.isActive){
      throw new Error('Account is deactivated. Please contact support.');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role,departmentId:user.departmentId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId
      }
    };
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    };
  }
};

module.exports = authService;
