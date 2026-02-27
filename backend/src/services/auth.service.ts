import { AppDataSource } from '../config/database.config';
import { User } from '../entities/User.entity';
import { Patient } from '../entities/Patient.entity';
import { CreateUserDto, LoginDto, AuthResponse, JwtPayload, User as UserType } from '../types/auth.types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private patientRepository = AppDataSource.getRepository(Patient);

  async signup(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = this.userRepository.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role || 'patient',
        isVerified: true // Auto-verify for now (add email verification later)
      });

      await this.userRepository.save(user);

      // If role is patient, create patient record
      if (user.role === 'patient') {
        const patient = this.patientRepository.create({
          userId: user.id,
          dateOfBirth: new Date(),
          allergies: [],
          chronicConditions: [],
          currentMedications: []
        });
        await this.patientRepository.save(patient);
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user object conforming to Omit<User, 'password'>
      // Fields must match backend/src/types/auth.types.ts:User roles and types
      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          // explicit role type narrowing:
          role: (user.role as 'patient' | 'doctor' | 'admin'),
          isVerified: user.isVerified,
          verificationToken: user.verificationToken ?? undefined,
          resetToken: user.resetToken ?? undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: credentials.email }
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Construct the user response as Omit<User, "password">
      const userWithoutPassword: Omit<UserType, 'password'> = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: (user.role as 'patient' | 'doctor' | 'admin'),
        isVerified: user.isVerified,
        verificationToken: user.verificationToken ?? undefined,
        resetToken: user.resetToken ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        token,
        user: userWithoutPassword,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Failed to login'
      };
    }
  }

  async getCurrentUser(userId: number): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Construct the user response as Omit<User, "password">
      const userWithoutPassword: Omit<UserType, 'password'> = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: (user.role as 'patient' | 'doctor' | 'admin'),
        isVerified: user.isVerified,
        verificationToken: user.verificationToken ?? undefined,
        resetToken: user.resetToken ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
