import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Phone, Mail, User, ArrowRight } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import type { SignupData } from '../../types/auth'

type SignupMethod = 'phone' | 'email'

const SignupPage = () => {
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('phone')
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupData>()

  const onSubmit = async (data: SignupData) => {
    try {
      const result = await signup(data)
      
      // Only navigate to OTP verification if signup was successful
      if (result?.success) {
        navigate('/auth/verify-otp', { 
          state: { 
            credentials: data,
            isLogin: false,
            signupData: data
          } 
        })
      }
    } catch (error: any) {
      if (error.message === 'ACCOUNT_EXISTS') {
        // Redirect to login with the phone number/email pre-filled
        navigate('/auth/login', {
          state: {
            credentials: {
              phoneNumber: data.phoneNumber,
              email: data.email
            },
            message: 'An account with this ' + 
                    (data.phoneNumber ? 'phone number' : 'email') + 
                    ' already exists. Please log in.'
          }
        })
      }
      // Other errors are already handled by the store
    }
  }

  const phoneValue = watch('phoneNumber')
  const emailValue = watch('email')
  const fullNameValue = watch('fullName')

  const isFormValid = fullNameValue && fullNameValue.length >= 2 && (
    signupMethod === 'phone' 
      ? phoneValue && phoneValue.length >= 10
      : emailValue && emailValue.includes('@')
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create your account
        </h2>
        <p className="text-gray-600">
          Join our community to start connecting and trading
        </p>
      </div>

      {/* Signup Method Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setSignupMethod('phone')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            signupMethod === 'phone'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Phone size={16} className="mr-2" />
          Phone
        </button>
        <button
          type="button"
          onClick={() => setSignupMethod('email')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            signupMethod === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail size={16} className="mr-2" />
          Email
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters',
                },
              })}
              type="text"
              placeholder="John Doe"
              className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone or Email */}
        {signupMethod === 'phone' ? (
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                className={`input pl-10 ${errors.phoneNumber ? 'input-error' : ''}`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              />
            </div>
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
              Create Account
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default SignupPage