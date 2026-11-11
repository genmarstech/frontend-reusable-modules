
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { RegisterUser } from "../lib/api/auth";
import { handleApiError } from "../lib/api/handleErrors";

import "./Register.css";

// VALIDATION SCHEMA
const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Your name must contain at least 3 characters.")
    .max(255, "Your name is too long."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email address is too long."),

  phone_number: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(20, "Phone number is too long.")
    .refine(
      (value) => /^[+]?[0-9\s()-]+$/.test(value) &&
        value.replace(/\D/g, "").length >= 9,
      "Enter a valid phone number."
    ),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters."),

  confirm_password: z
    .string()
    .min(1, "Please confirm your password.")
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: "Passwords do not match.",
    path: ["confirm_password"]
  }
);

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      password: "",
      confirm_password: ""
    }
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    // Normalize and exclude confirm_password
    const payload = {
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone_number: data.phone_number.trim(),
      password: data.password
    };

    try {
      const response = await RegisterUser(payload);

      setSuccessMessage(
        response?.data?.message || "Your Velora account has been created successfully."
      );

      reset();

    } catch (error) {
      const apiError = handleApiError(error);

      const fieldErrors = apiError?.errors || {};

      const allowedFields = [
        "full_name",
        "email",
        "phone_number",
        "password"
      ];

      let hasFieldError = false;

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (allowedFields.includes(field)) {
          const message = Array.isArray(messages)
            ? messages[0]
            : messages;

          setError(field, {
            type: "server",
            message: String(message)
          });

          hasFieldError = true;
        }
      });

      if (!hasFieldError) {
        setServerError(
          apiError?.message || "Something went wrong. Please try again."
        );
      }
    }
  };

  return (
    <main className="register-page">

      {/* LEFT BRAND PANEL */}
      <section className="register-brand">
        <div className="register-brand-content">

          <a href="/" className="register-logo">
            velora<span>.</span>
          </a>

          <div className="brand-message">
            <div className="brand-tag">
              <Sparkles size={15} />
              <span>WELCOME TO VE​LORA</span>
            </div>

            <h1>
              Your business deserves
              <br />
              <em>a better experience.</em>
            </h1>

            <p>
              A smarter way to manage your appointments,
              clients and business operations. Everything
              you need, thoughtfully brought together.
            </p>
          </div>

          <div className="brand-bottom">
            <div className="brand-decoration">
              <div className="decoration-circle">
                <Sparkles size={28} />
              </div>
            </div>

            <span>Designed for beauty. Built for business.</span>
          </div>
        </div>
      </section>

      {/* RIGHT REGISTER PANEL */}
      <section className="register-form-section">

        <div className="register-top">
          <span>Already have an account?</span>
          <a href="/login">Sign in <ArrowRight size={15} /></a>
        </div>

        <div className="register-form-container">

          <div className="form-heading">
            <span className="form-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>
              Let's start with a few details to create
              your personal Velora identity.
            </p>
          </div>

          {serverError && (
            <div className="form-alert error-alert">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="form-alert success-alert">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* FULL NAME */}
            <div className="register-field">
              <label htmlFor="full_name">Full name</label>

              <div className={`register-input ${errors.full_name ? "input-error" : ""}`}>
                <UserRound size={18} />
                <input
                  id="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  {...register("full_name")}
                />
              </div>

              {errors.full_name && (
                <small className="field-error">{errors.full_name.message}</small>
              )}
            </div>

            {/* EMAIL */}
            <div className="register-field">
              <label htmlFor="email">Email address</label>

              <div className={`register-input ${errors.email ? "input-error" : ""}`}>
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <small className="field-error">{errors.email.message}</small>
              )}
            </div>

            {/* PHONE */}
            <div className="register-field">
              <label htmlFor="phone_number">Phone number</label>

              <div className={`register-input ${errors.phone_number ? "input-error" : ""}`}>
                <Phone size={18} />
                <input
                  id="phone_number"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  autoComplete="tel"
                  {...register("phone_number")}
                />
              </div>

              {errors.phone_number && (
                <small className="field-error">{errors.phone_number.message}</small>
              )}
            </div>

            {/* PASSWORD */}
            <div className="register-field">
              <label htmlFor="password">Password</label>

              <div className={`register-input ${errors.password ? "input-error" : ""}`}>
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  {...register("password")}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <small className="field-error">{errors.password.message}</small>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="register-field">
              <label htmlFor="confirm_password">Confirm password</label>

              <div className={`register-input ${errors.confirm_password ? "input-error" : ""}`}>
                <LockKeyhole size={18} />

                <input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.confirm_password && (
                <small className="field-error">
                  {errors.confirm_password.message}
                </small>
              )}
            </div>

            <div className="register-terms">
              By creating an account, you agree to our
              <a href="/terms"> Terms of Service</a> and
              <a href="/privacy"> Privacy Policy</a>.
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="spin" size={18} />
                  Creating account...
                </>
              ) : (
                <>
                  Create your account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="register-security">
            <LockKeyhole size={14} />
            <span>Your information is securely handled.</span>
          </div>

        </div>

        <div className="register-copyright">
          © {new Date().getFullYear()} Velora. All rights reserved.
        </div>

      </section>
    </main>
  );
}

export default Register;
