
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  ArrowRight,
} from 'lucide-react'

import { RegisterUser } from '../../lib/api/auth'
import { handleApiError } from '../../lib/api/handleApiError'

interface RegistrationFormValues {
  full_name: string
  email: string
  phone_number: string
  password: string
  confirm_password: string
}

function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    mode: 'onBlur',
  })

  const password = watch('password')

  const inputClass = (hasError: boolean) => `
    w-full rounded-xl border bg-white px-4 py-3.5
    text-sm text-gray-900 placeholder:text-gray-400
    outline-none transition-all duration-200
    focus:ring-4
    ${hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-gray-100'
    }
  `

  const onSubmit = async (data: RegistrationFormValues) => {
    setServerError('')
    setSuccessMessage('')

    const payload = {
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone_number: data.phone_number.trim(),
      password: data.password,
    }

    try {
      const result = await RegisterUser(payload)

      setSuccessMessage(
        result.message || 'Your account has been created successfully.'
      )

      reset()
    } catch (error: unknown) {
      const apiError = handleApiError(error)
      const responseErrors = apiError.errors as
        | Record<string, unknown>
        | null

      const fields = [
        'full_name',
        'email',
        'phone_number',
        'password',
      ] as const

      let hasFieldError = false

      fields.forEach((field) => {
        const fieldError = responseErrors?.[field]

        if (fieldError) {
          setError(field, {
            type: 'server',
            message: Array.isArray(fieldError)
              ? String(fieldError[0])
              : String(fieldError),
          })

          hasFieldError = true
        }
      })

      const nonFieldError = responseErrors?.non_field_errors

      setServerError(
        hasFieldError
          ? ''
          : Array.isArray(nonFieldError)
            ? String(nonFieldError[0])
            : apiError.message
      )
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">

        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
            <UserRound size={23} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-950">
            Create your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Get started by providing your details below.
            It only takes a few minutes.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6 px-6 py-8 sm:px-10"
        >

          {/* Success */}
          {successMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-6">{successMessage}</p>
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-6">{serverError}</p>
            </div>
          )}

          {/* Personal information */}
          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Personal information
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Tell us a little about yourself.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Full name */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    {...register('full_name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 3,
                        message: 'Name must have at least 3 characters',
                      },
                      maxLength: {
                        value: 255,
                        message: 'Name cannot exceed 255 characters',
                      },
                      validate: (value) =>
                        value.trim().length >= 3 ||
                        'Enter a valid full name',
                    })}
                    className={`${inputClass(!!errors.full_name)} pl-11`}
                  />
                </div>

                {errors.full_name && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="john@example.com"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                      maxLength: {
                        value: 254,
                        message: 'Email address is too long',
                      },
                    })}
                    className={`${inputClass(!!errors.email)} pl-11`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+254 7XX XXX XXX"
                    {...register('phone_number', {
                      required: 'Phone number is required',
                      maxLength: {
                        value: 20,
                        message: 'Phone number cannot exceed 20 characters',
                      },
                      pattern: {
                        value: /^\+?[0-9\s()-]+$/,
                        message: 'Enter a valid phone number',
                      },
                      validate: (value) =>
                        value.replace(/\D/g, '').length >= 9 ||
                        'Phone number is too short',
                    })}
                    className={`${inputClass(!!errors.phone_number)} pl-11`}
                  />
                </div>

                {errors.phone_number && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Security */}
          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Account security
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Choose a secure password for your account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must have at least 8 characters',
                      },
                    })}
                    className={`${inputClass(!!errors.password)} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    {...register('confirm_password', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    className={`${inputClass(!!errors.confirm_password)} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900"
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />
                    }
                  </button>
                </div>

                {errors.confirm_password && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                group flex w-full items-center justify-center gap-3
                rounded-xl bg-gray-950 px-6 py-4
                text-sm font-semibold text-white
                transition-all duration-200
                hover:bg-gray-800 hover:shadow-lg
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              By creating an account, you agree to our terms of service
              and privacy policy.
            </p>
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Secure account registration
      </p>
    </div>
  )
}

export default RegistrationForm
