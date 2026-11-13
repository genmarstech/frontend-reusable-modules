
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

import { LoginUser } from "../lib/api/auth";
import { handleApiError } from "../lib/api/handleErrors";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

// VALIDATION SCHEMA
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required.")
});

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const { login } = useAuth();


  const onSubmit = async (data) => {
    setServerError("");

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    };

    try {
      const response = await LoginUser(payload);

      // The backend should have established the session
      // before returning a successful response.

      // Allow protected routes to redirect users back
      // to the page they originally requested.
      login(response.user);

      // Navigate to your next page.
      setTimeout(() => {
        navigate("/businesses", { replace: true });
      }, 50);

    } catch (error) {
      const apiError = handleApiError(error);
      const fieldErrors = apiError?.errors || {};

      let hasFieldError = false;

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (["email", "password"].includes(field)) {
          setError(field, {
            type: "server",
            message: Array.isArray(messages)
              ? messages[0]
              : String(messages)
          });

          hasFieldError = true;
        }
      });

      if (!hasFieldError) {
        setServerError(
          apiError?.message ||
          "Unable to sign in. Please check your credentials and try again."
        );
      }
    }
  };

  return (
    <main className="login-page">

      {/* BRAND PANEL */}
      <section className="login-brand">
        <div className="login-brand-content">

          <Link to="/" className="login-logo">
            velora<span>.</span>
          </Link>

          <div className="login-brand-message">

            <div className="login-brand-tag">
              <Sparkles size={15} />
              <span>WELCOME BACK</span>
            </div>

            <h1>
              Your business.
              <br />
              <em>Your space.</em>
              <br />
              Your Velora.
            </h1>

            <p>
              Everything you need to keep your business
              organized, your clients connected and your
              daily operations running smoothly.
            </p>

          </div>

          <div className="login-brand-bottom">
            <div className="login-brand-icon">
              <ShieldCheck size={22} />
            </div>

            <span>One platform. Your entire business.</span>
          </div>

        </div>
      </section>

      {/* LOGIN FORM */}
      <section className="login-form-section">

        <div className="login-top">
          <span>New to Velora?</span>
          <Link to="/register">
            Create an account <ArrowRight size={15} />
          </Link>
        </div>

        <div className="login-form-container">

          <div className="login-heading">
            <span className="login-eyebrow">YOUR WORKSPACE AWAITS</span>

            <h2>Welcome back</h2>

            <p>
              Sign in to access your Velora account
              and manage your business.
            </p>
          </div>

          {/* SERVER ERROR */}
          {serverError && (
            <div className="login-alert">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* EMAIL */}
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className={`login-input ${errors.email ? "login-input-error" : ""}`}>
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  autoFocus
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <small className="login-field-error">
                  {errors.email.message}
                </small>
              )}
            </div>

            {/* PASSWORD */}
            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className={`login-input ${errors.password ? "login-input-error" : ""}`}>
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                  }
                </button>
              </div>

              {errors.password && (
                <small className="login-field-error">
                  {errors.password.message}
                </small>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="login-spinner" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in to Velora
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="login-security">
            <ShieldCheck size={15} />
            <span>Your account is protected by secure authentication.</span>
          </div>

        </div>

        <div className="login-copyright">
          © {new Date().getFullYear()} Velora. All rights reserved.
        </div>

      </section>

    </main>
  );
}

export default Login;
