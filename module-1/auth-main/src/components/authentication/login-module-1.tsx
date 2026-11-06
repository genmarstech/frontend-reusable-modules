
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  LogIn,
} from 'lucide-react'

import { LoginUser } from '../../lib/api/auth'
import { handleApiError } from '../../lib/api/handleApiError'
import { Link } from 'react-router'

interface LoginFormValues {
  email: string
  password: string
}

function LoginModule1() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onBlur',
  })

  const inputClass = (hasError: boolean) => `
    w-full rounded-xl border bg-white px-4 py-3.5
    text-sm text-gray-900 placeholder:text-gray-400
    outline-none transition-all duration-200
    focus:ring-4
    ${
      hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-gray-100'
    }
  `

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('')

    const payload = {
      email: data.email.trim(),
      password: data.password,
    }

    try {
      await LoginUser(payload)

      // Handle successful authentication here.
      // For example: redirect to dashboard.

    } catch (error: unknown) {
      const apiError = handleApiError(error)

      const responseErrors = apiError.errors as
        | Record<string, unknown>
        | null

      const fields = ['email', 'password'] as const

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
    <div className="mx-auto w-full max-w-md">

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">

        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-8 sm:px-8">

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-950 text-white">
            <LogIn size={23} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-950">
            Welcome back
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to your account to continue where you left off.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6 px-6 py-8 sm:px-8"
        >

          {/* Server Error */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <p className="text-sm leading-6">
                {serverError}
              </p>
            </div>
          )}

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

          {/* Password */}
          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <a
                href="/forgot-password"
                className="text-xs font-semibold text-gray-700 transition hover:text-black"
              >
                Forgot password?
              </a>

            </div>

            <div className="relative">

              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                })}
                className={`${inputClass(!!errors.password)} pl-11 pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>

            </div>

            {errors.password && (
              <p className="mt-2 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}

          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">

            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 accent-gray-950 focus:ring-gray-900"
            />

            <label
              htmlFor="remember-me"
              className="text-sm text-gray-600"
            >
              Remember me
            </label>

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
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}

            </button>

          </div>

          {/* Registration Link */}
          <div className="border-t border-gray-100 pt-6">

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}

              <Link
                to="/module-1"
                className="font-semibold text-gray-950 transition hover:underline"
              >
                Create account
              </Link>
            </p>

          </div>

        </form>

      </div>

      {/* Security Footer */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">

        <ShieldCheck size={15} />

        <span>Secure account authentication</span>

      </div>

    </div>
  )
}

export default LoginModule1
