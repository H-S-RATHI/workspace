export interface User {
  userId: string
  username: string
  fullName: string
  email?: string
  phoneNumber?: string
  profilePhotoUrl?: string
  bio?: string
  location?: string
  twoFaEnabled: boolean
  isBusinessAccount: boolean
  createdAt: string
}

export interface LoginCredentials {
  phoneNumber?: string
  email?: string
}

export interface SignupData {
  phoneNumber?: string
  email?: string
  fullName: string
}

export interface OTPVerificationData {
  phoneNumber?: string
  email?: string
  otp: string
  fullName?: string // For signup
}

export interface AuthResponse {
  success: boolean
  message: string
  error?: string
  errorCode?: string
  existingUser?: {
    userId: string
    username: string
    email?: string
    phoneNumber?: string
  }
  user?: User
  tokens?: {
    accessToken: string
    refreshToken: string
  }
  isNewUser?: boolean
}

export interface OTPResponse {
  success: boolean
  message: string
  identifier: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  success: boolean
  tokens: {
    accessToken: string
    refreshToken: string
  }
}