export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'patient' | 'doctor' | 'admin';
  specialty?: string; // used only when role === 'doctor' and no existing Doctor profile matches the email
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message?: string;
  error?: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}
