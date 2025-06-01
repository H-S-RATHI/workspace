import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Phone, Mail, ArrowRight } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import type { LoginCredentials } from '../../types/auth'

type LoginMethod = 'phone' | 'email'

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get message and credentials from location state if redirected from signup
  const message = location.state?.message
  const credentials = location.state?.credentials || {}

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginCredentials>()
  
  // Set initial values if they were passed in location state
  useEffect(() => {
    if (credentials.phoneNumber) {
      setValue('phoneNumber', credentials.phoneNumber)
      setLoginMethod('phone')
    } else if (credentials.email) {
      setValue('email', credentials.email)
      setLoginMethod('email')
    }
  }, [credentials, setValue])

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data)
      // Navigate to OTP verification with the credentials
      navigate('/auth/verify-otp', { 
        state: { 
          credentials: data,
          isLogin: true 
        } 
      })
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const phoneValue = watch('phoneNumber')
  const emailValue = watch('email')

  const isFormValid = loginMethod === 'phone' 
    ? phoneValue && phoneValue.length >= 10
    : emailValue && emailValue.includes('@')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {message ? 'Account Exists' : 'Welcome back'}
        </h2>
        <p className="text-gray-600">
          {message || 'Sign in to your account to continue'}
        </p>
      </div>

      {/* Login Method Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Phone size={16} className="mr-2" />
          Phone
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail size={16} className="mr-2" />
          Email
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginMethod === 'phone' ? (
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: 'Please enter a valid phone number',
                },
              })}
              type="tel"
              placeholder="+1 (555) 123-4567"
              className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={!isFormValid || isLoading}
          whileHover={{ scale: isFormValid ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid ? 0.98 : 1 }}
          className={`w-full btn btn-primary btn-lg flex items-center justify-center ${
            !isFormValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <>
              Send OTP
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              We'll send you a verification code to confirm your identity. 
              Standard messaging rates may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage