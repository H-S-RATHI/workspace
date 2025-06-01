import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const OTPVerificationPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Get data from navigation state
  const { credentials, isLogin, signupData } = location.state || {}

  useEffect(() => {
    if (!credentials) {
      navigate('/auth/login')
      return
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [credentials, navigate])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      handleVerifyOtp(pastedData)
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    try {
      setIsLoading(true)

      const verificationData = {
        ...credentials,
        otp: otpCode,
        ...(signupData && { fullName: signupData.fullName })
      }

      const response = await authAPI.verifyOTP(verificationData)

      // Handle case where user tries to sign up with existing account
      if (response.errorCode === 'ACCOUNT_EXISTS') {
        toast.error('An account with this phone number already exists. Please log in instead.')
        navigate('/auth/login', { 
          state: { 
            credentials: {
              phoneNumber: verificationData.phoneNumber,
              email: verificationData.email
            }
          } 
        })
        return
      }

      if (response.success && response.tokens) {
        setTokens(response.tokens.accessToken, response.tokens.refreshToken)
        
        if (response.user) {
          setUser(response.user)
        }

        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!')
        navigate('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsResending(true)
      
      const response = await authAPI.sendOTP(credentials)
      
      if (response.success) {
        toast.success('OTP sent successfully!')
        setCountdown(60)
        setCanResend(false)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDisplayIdentifier = () => {
    if (credentials.phoneNumber) {
      const phone = credentials.phoneNumber
      return phone.length > 4 ? `***-***-${phone.slice(-4)}` : phone
    }
    if (credentials.email) {
      const email = credentials.email
      const [username, domain] = email.split('@')
      return `${username.slice(0, 2)}***@${domain}`
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify your {credentials?.phoneNumber ? 'phone' : 'email'}
        </h2>
        <p className="text-gray-600">
          We sent a 6-digit code to{' '}
          <span className="font-medium">{getDisplayIdentifier()}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                digit ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Verifying...</p>
          </div>
        )}
      </div>

      {/* Resend OTP */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center mx-auto"
          >
            {isResending ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend code'
            )}
          </button>
        ) : (
          <p className="text-gray-600">
            Resend code in{' '}
            <span className="font-medium text-primary-600">
              {formatCountdown(countdown)}
            </span>
          </p>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              {credentials?.phoneNumber 
                ? "Check your messages for the verification code. It may take a few minutes to arrive."
                : "Check your email inbox and spam folder for the verification code."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OTPVerificationPage