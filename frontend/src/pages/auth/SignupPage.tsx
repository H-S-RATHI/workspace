import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, User, ArrowRight, UserPlus, Shield } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Create your account
          </h2>
        </div>
        <p className="text-slate-600 text-lg">
          Join our community to start connecting and trading
        </p>
      </motion.div>

      {/* Signup Method Toggle */}
      <motion.div 
        className="flex bg-slate-100 rounded-2xl p-1.5 shadow-inner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.button
          type="button"
          onClick={() => setSignupMethod('phone')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            signupMethod === 'phone'
              ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Phone size={18} className="mr-2" />
          Phone
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setSignupMethod('email')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            signupMethod === 'email'
              ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail size={18} className="mr-2" />
          Email
        </motion.button>
      </motion.div>

      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Full Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Input
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
            label="Full Name"
            placeholder="John Doe"
            leftIcon={<User className="w-5 h-5" />}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            variant="modern"
          />
        </motion.div>

        {/* Phone or Email */}
        <AnimatePresence mode="wait">
          {signupMethod === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="w-5 h-5" />}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                variant="modern"
              />
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={!!errors.email}
                helperText={errors.email?.message}
                variant="modern"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          loading={isLoading}
          variant="gradient"
          size="lg"
          className="w-full"
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </motion.form>

      {/* Sign in link */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-slate-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Terms Notice */}
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-1">
              Terms & Privacy
            </h4>
            <p className="text-sm text-purple-700">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800 font-medium underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800 font-medium underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage