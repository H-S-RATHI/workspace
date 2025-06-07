import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, ArrowRight, Shield, Sparkles } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {message ? 'Account Exists' : 'Welcome back'}
          </h2>
        </div>
        <p className="text-slate-600 text-lg">
          {message || 'Sign in to your account to continue'}
        </p>
      </motion.div>

      {/* Login Method Toggle */}
      <motion.div 
        className="flex bg-slate-100 rounded-2xl p-1.5 shadow-inner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            loginMethod === 'phone'
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
          onClick={() => setLoginMethod('email')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            loginMethod === 'email'
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
        <AnimatePresence mode="wait">
          {loginMethod === 'phone' ? (
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
          variant="primary"
          size="lg"
          className="w-full"
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </motion.form>

      {/* Sign up link */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>

      {/* Security Notice */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Secure Verification
            </h4>
            <p className="text-sm text-blue-700">
              We'll send you a verification code to confirm your identity. 
              Standard messaging rates may apply.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage