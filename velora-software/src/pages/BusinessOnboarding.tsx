
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { createBusiness } from "../lib/api/auth";
import "./BusinessOnboarding.css";

const CATEGORY_LABELS = {
    SC: "Salon",
    BSC: "Barbershop",
    SP: "Spa",
    BCC: "Beauty Clinic",
    SPC: "Salon Professional",
};

function BusinessOnboarding() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [business, setBusiness] = useState(null);

    const [formData, setFormData] = useState({
        business_name: "",
        business_description: "",
        business_category: "",
        whatsapp_number: "",
        business_email: "",
        business_logo: null,
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const displayName = user?.name || "User";

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFieldErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setError("");
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFieldErrors((prev) => ({
                ...prev,
                business_logo: "Please select a valid image file.",
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            business_logo: file,
        }));

        setLogoPreview(URL.createObjectURL(file));

        setFieldErrors((prev) => ({
            ...prev,
            business_logo: "",
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");
        setFieldErrors({});

        const payload = new FormData();

        payload.append("business_name", formData.business_name);
        payload.append(
            "business_description",
            formData.business_description
        );
        payload.append("business_category", formData.business_category);
        payload.append("whatsapp_number", formData.whatsapp_number);
        payload.append("business_email", formData.business_email);

        if (formData.business_logo) {
            payload.append("business_logo", formData.business_logo);
        }

        try {
            const response = await createBusiness(payload);

            // createBusiness currently returns response.data.
            // Support either a direct business object or a wrapped response.
            const createdBusiness =
                response?.business ?? response?.data ?? response;

            setBusiness(createdBusiness);
            setStep(2);

        } catch (err) {
            console.error(
                "Business creation failed:",
                err.response?.data || err.message
            );

            const responseData = err.response?.data;

            if (
                responseData &&
                typeof responseData === "object" &&
                !Array.isArray(responseData)
            ) {
                const newFieldErrors = {};

                Object.entries(responseData).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        newFieldErrors[field] = messages.join(" ");
                    } else if (typeof messages === "string") {
                        newFieldErrors[field] = messages;
                    }
                });

                setFieldErrors(newFieldErrors);

                if (responseData.detail) {
                    setError(responseData.detail);
                } else if (responseData.non_field_errors) {
                    setError(
                        Array.isArray(responseData.non_field_errors)
                            ? responseData.non_field_errors.join(" ")
                            : responseData.non_field_errors
                    );
                } else if (Object.keys(newFieldErrors).length === 0) {
                    setError("Something went wrong. Please try again.");
                }
            } else {
                setError(
                    "Unable to create your business. Please check your connection and try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleContinue = () => {
        // Change this path to the actual route for your Velora workspace.
        navigate("/dashboard");
    };

    if (loading) {
        return (
            <div className="onboarding-loading">
                <div className="onboarding-spinner" />
                <p>Verifying your session...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (step === 2 && !business) {
        return <Navigate to="/onboarding/business" replace />;
    }

    return (
        <main className="business-onboarding">
            <header className="onboarding-header">
                <div className="velora-logo">
                    Velora<span>.</span>
                </div>

                <div className="onboarding-account">
                    <div className="account-avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <strong>{displayName}</strong>
                        <small>{user.email}</small>
                    </div>
                </div>
            </header>

            <section className="onboarding-content">
                <div className="onboarding-intro">
                    <span className="onboarding-step">
                        {step === 1
                            ? "STEP 01 — BUSINESS PROFILE"
                            : "STEP 02 — BUSINESS REVIEW"}
                    </span>

                    <h1>
                        {step === 1 ? (
                            <>
                                Let's set up your
                                <span> business.</span>
                            </>
                        ) : (
                            <>
                                Your business is
                                <span> almost ready.</span>
                            </>
                        )}
                    </h1>

                    <p>
                        {step === 1
                            ? `Welcome, ${displayName}. Tell us about your business so we can create your Velora workspace.`
                            : "Review your business information before entering your Velora workspace."}
                    </p>
                </div>

                <div className="onboarding-progress">
                    <div className="progress-track">
                        <div
                            className={`progress-fill ${
                                step === 2 ? "progress-complete" : ""
                            }`}
                        />
                    </div>
                    <span>Step {step} of 2</span>
                </div>

                {step === 1 && (
                    <form
                        className="business-form"
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                    >
                        <div className="form-section-heading">
                            <div>
                                <h2>Business information</h2>
                                <p>
                                    Enter the basic details of your business.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="form-error" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="form-field full-width">
                                <label htmlFor="business_name">
                                    Business name *
                                </label>
                                <input
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    placeholder="e.g. Glow Beauty Studio"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.business_name && (
                                    <small className="field-error">
                                        {fieldErrors.business_name}
                                    </small>
                                )}
                            </div>

                            <div className="form-field full-width">
                                <label htmlFor="business_description">
                                    Business description
                                </label>
                                <textarea
                                    id="business_description"
                                    name="business_description"
                                    placeholder="Tell us what your business offers..."
                                    rows={4}
                                    value={formData.business_description}
                                    onChange={handleChange}
                                />
                                {fieldErrors.business_description && (
                                    <small className="field-error">
                                        {fieldErrors.business_description}
                                    </small>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="business_category">
                                    Business category *
                                </label>
                                <select
                                    id="business_category"
                                    name="business_category"
                                    value={formData.business_category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select your category
                                    </option>
                                    <option value="SC">Salon</option>
                                    <option value="BSC">Barbershop</option>
                                    <option value="SP">Spa</option>
                                    <option value="BCC">Beauty Clinic</option>
                                    <option value="SPC">Salon Professional</option>
                                </select>
                                {fieldErrors.business_category && (
                                    <small className="field-error">
                                        {fieldErrors.business_category}
                                    </small>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="whatsapp_number">
                                    WhatsApp number *
                                </label>
                                <input
                                    id="whatsapp_number"
                                    name="whatsapp_number"
                                    type="tel"
                                    placeholder="+254 7XX XXX XXX"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.whatsapp_number && (
                                    <small className="field-error">
                                        {fieldErrors.whatsapp_number}
                                    </small>
                                )}
                            </div>

                            <div className="form-field full-width">
                                <label htmlFor="business_email">
                                    Business email *
                                </label>
                                <input
                                    id="business_email"
                                    name="business_email"
                                    type="email"
                                    placeholder="hello@yourbusiness.com"
                                    value={formData.business_email}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.business_email && (
                                    <small className="field-error">
                                        {fieldErrors.business_email}
                                    </small>
                                )}
                            </div>

                            <div className="form-field full-width">
                                <label htmlFor="business_logo">
                                    Business logo
                                </label>

                                <label className="logo-upload">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Business logo preview"
                                        />
                                    ) : (
                                        <div className="logo-upload-placeholder">
                                            <span>+</span>
                                            <strong>Upload your logo</strong>
                                            <small>PNG, JPG or WEBP</small>
                                        </div>
                                    )}

                                    <input
                                        id="business_logo"
                                        name="business_logo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleLogoChange}
                                    />
                                </label>

                                {fieldErrors.business_logo && (
                                    <small className="field-error">
                                        {fieldErrors.business_logo}
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="form-footer">
                            <p>
                                Creating a workspace for{" "}
                                <strong>{user.email}</strong>
                            </p>

                            <button type="submit" disabled={submitting}>
                                {submitting
                                    ? "Creating business..."
                                    : "Create business"}
                                {!submitting && <span>→</span>}
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && business && (
                    <section className="business-review">
                        <div className="review-heading">
                            <div className="review-check">✓</div>
                            <div>
                                <h2>Business successfully created</h2>
                                <p>
                                    Take a moment to review the details below.
                                </p>
                            </div>
                        </div>

                        <div className="review-business-card">
                            <div className="review-business-brand">
                                {business.business_logo ? (
                                    <img
                                        src={business.business_logo}
                                        alt={`${business.business_name} logo`}
                                    />
                                ) : (
                                    <div className="review-logo-placeholder">
                                        {business.business_name
                                            ?.charAt(0)
                                            .toUpperCase() || "V"}
                                    </div>
                                )}

                                <div>
                                    <h2>{business.business_name}</h2>
                                    <span>
                                        {CATEGORY_LABELS[
                                            business.business_category
                                        ] || business.business_category}
                                    </span>
                                </div>
                            </div>

                            <div className="review-divider" />

                            <div className="review-details">
                                <div className="review-detail">
                                    <small>Business description</small>
                                    <strong>
                                        {business.business_description ||
                                            "No description provided"}
                                    </strong>
                                </div>

                                <div className="review-detail">
                                    <small>Business email</small>
                                    <strong>{business.business_email}</strong>
                                </div>

                                <div className="review-detail">
                                    <small>WhatsApp number</small>
                                    <strong>{business.whatsapp_number}</strong>
                                </div>

                                <div className="review-detail">
                                    <small>Business category</small>
                                    <strong>
                                        {CATEGORY_LABELS[
                                            business.business_category
                                        ] || business.business_category}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="review-notice">
                            <strong>You're nearly there!</strong>
                            <p>
                                Your business profile has been saved. You can
                                continue to your Velora workspace to start
                                setting up your services, team and bookings.
                            </p>
                        </div>

                        <div className="review-footer">
                            <span>Business profile · Created successfully</span>

                            <button
                                type="button"
                                onClick={handleContinue}
                            >
                                Enter my workspace <span>→</span>
                            </button>
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}

export default BusinessOnboarding;
