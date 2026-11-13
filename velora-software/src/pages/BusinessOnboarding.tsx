import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import type { Staff, StaffFormData } from "../types/staff";
import {
    createBusiness,
    createService,
    createStaff,
} from "../lib/api/auth";

import "./BusinessOnboarding.css";

interface Business {
    id: number;
    business_name: string;
    business_description: string;
    business_category: string;
    whatsapp_number: string;
    business_email: string;
    business_logo: string | null;
}

interface BusinessFormData {
    business_name: string;
    business_description: string;
    business_category: string;
    whatsapp_number: string;
    business_email: string;
    business_logo: File | null;
}

interface Service {
    id: number;
    business: number;
    service_name: string;
    service_description: string;
    price: string | number;
    duration_minutes: number;
    is_available: boolean;
}

interface ServiceFormData {
    service_name: string;
    service_description: string;
    price: string;
    duration_minutes: number;
    is_available: boolean;
}

interface ServicePayload {
    business: number;
    service_name: string;
    service_description: string;
    price: string;
    duration_minutes: number;
    is_available: boolean;
}

type FieldErrors = Record<string, string>;

const CATEGORY_LABELS: Record<string, string> = {
    SC: "Salon",
    BSC: "Barbershop",
    SP: "Spa",
    BCC: "Beauty Clinic",
    SPC: "Salon Professional",
};

const initialBusinessForm: BusinessFormData = {
    business_name: "",
    business_description: "",
    business_category: "",
    whatsapp_number: "",
    business_email: "",
    business_logo: null,
};

const initialServiceForm: ServiceFormData = {
    service_name: "",
    service_description: "",
    price: "",
    duration_minutes: 60,
    is_available: true,
};

const initialStaffForm: StaffFormData = {
    staff_name: "",
    staff_email: "",
    id_number: "",
    is_available: true,
};

function getApiErrors(data: unknown): FieldErrors {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {};
    }

    const errors: FieldErrors = {};

    Object.entries(data).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
            errors[field] = messages.join(" ");
        } else if (typeof messages === "string") {
            errors[field] = messages;
        }
    });

    return errors;
}

function BusinessOnboarding() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<number>(1);

    const [business, setBusiness] = useState<Business | null>(null);

    // Business form
    const [formData, setFormData] =
        useState<BusinessFormData>(initialBusinessForm);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // Services
    const [services, setServices] = useState<Service[]>([]);
    const [serviceForm, setServiceForm] =
        useState<ServiceFormData>(initialServiceForm);

    const [serviceSubmitting, setServiceSubmitting] =
        useState<boolean>(false);
    const [serviceError, setServiceError] = useState<string>("");
    const [serviceFieldErrors, setServiceFieldErrors] =
        useState<FieldErrors>({});

    // Staff
    const [staff, setStaff] = useState<Staff[]>([]);
    const [staffForm, setStaffForm] =
        useState<StaffFormData>(initialStaffForm);

    const [staffSubmitting, setStaffSubmitting] =
        useState<boolean>(false);
    const [staffError, setStaffError] = useState<string>("");
    const [staffFieldErrors, setStaffFieldErrors] =
        useState<FieldErrors>({});

    const displayName = user?.name || "User";

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    // --------------------------------------------------
    // STEP 1: BUSINESS PROFILE
    // --------------------------------------------------

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ): void => {
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

    const handleLogoChange = (
        e: ChangeEvent<HTMLInputElement>
    ): void => {
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

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
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

            const createdBusiness = (
                response?.business ?? response?.data ?? response
            ) as Business;

            if (!createdBusiness?.id) {
                throw new Error(
                    "The business was created, but its ID was not returned."
                );
            }

            setBusiness(createdBusiness);
            setStep(2);

        } catch (err: unknown) {
            console.error("Business creation failed:", err);

            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;

                setFieldErrors(getApiErrors(responseData));

                const data = responseData as
                    | Record<string, unknown>
                    | undefined;

                if (typeof data?.detail === "string") {
                    setError(data.detail);
                } else if (data?.non_field_errors) {
                    setError(
                        Array.isArray(data.non_field_errors)
                            ? data.non_field_errors.join(" ")
                            : String(data.non_field_errors)
                    );
                } else {
                    setError(
                        "Unable to create your business. Please check the information and try again."
                    );
                }
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    // --------------------------------------------------
    // STEP 2: SERVICES
    // --------------------------------------------------

    const handleServiceChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ): void => {
        const target = e.target;

        const value =
            target instanceof HTMLInputElement &&
            target.type === "checkbox"
                ? target.checked
                : target.value;

        setServiceForm((prev) => ({
            ...prev,
            [target.name]: value,
        }));

        setServiceFieldErrors((prev) => ({
            ...prev,
            [target.name]: "",
        }));

        setServiceError("");
    };

    const handleAddService = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        if (!business?.id) {
            setServiceError(
                "Your business information is missing. Please restart onboarding."
            );
            return;
        }

        setServiceSubmitting(true);
        setServiceError("");
        setServiceFieldErrors({});

        const payload: ServicePayload = {
            business: business.id,
            service_name: serviceForm.service_name.trim(),
            service_description:
                serviceForm.service_description.trim(),
            price: serviceForm.price,
            duration_minutes: Number(serviceForm.duration_minutes),
            is_available: serviceForm.is_available,
        };

        try {
            const response = await createService(payload);

            const createdService = (
                response?.service ?? response?.data ?? response
            ) as Service;

            setServices((prev) => [...prev, createdService]);
            setServiceForm(initialServiceForm);

        } catch (err: unknown) {
            console.error("Service creation failed:", err);

            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;

                setServiceFieldErrors(getApiErrors(responseData));

                const data = responseData as
                    | Record<string, unknown>
                    | undefined;

                if (typeof data?.detail === "string") {
                    setServiceError(data.detail);
                } else {
                    setServiceError(
                        "Unable to save this service. Check the information and try again."
                    );
                }
            } else {
                setServiceError(
                    "Unable to connect to Velora. Please try again."
                );
            }
        } finally {
            setServiceSubmitting(false);
        }
    };

    const handleContinueToStepThree = (): void => {
        if (services.length === 0) {
            setServiceError(
                "Please add at least one service before continuing."
            );
            return;
        }

        setServiceError("");
        setStep(3);
    };

    // --------------------------------------------------
    // STEP 3: STAFF
    // --------------------------------------------------

    const handleStaffChange = (
        e: ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value, type, checked } = e.target;

        setStaffForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setStaffFieldErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setStaffError("");
    };

    const handleAddStaff = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        if (!business?.id) {
            setStaffError("Please create your business first.");
            return;
        }

        setStaffSubmitting(true);
        setStaffError("");
        setStaffFieldErrors({});

        try {
            const createdStaff = await createStaff(
                business.id,
                staffForm
            );

            setStaff((prev) => [...prev, createdStaff]);
            setStaffForm(initialStaffForm);

        } catch (err: unknown) {
            console.error("Staff creation failed:", err);

            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;

                setStaffFieldErrors(getApiErrors(responseData));

                const data = responseData as
                    | Record<string, unknown>
                    | undefined;

                if (typeof data?.detail === "string") {
                    setStaffError(data.detail);
                } else {
                    setStaffError(
                        "Unable to add this staff member. Check the information and try again."
                    );
                }
            } else {
                setStaffError(
                    "An unexpected error occurred. Please try again."
                );
            }
        } finally {
            setStaffSubmitting(false);
        }
    };

    const handleFinishOnboarding = (): void => {
        if (!business?.id) return;

        navigate(`/dashboard/${business.id}/overview`, {
            replace: true,
        });
    };

    // --------------------------------------------------
    // AUTHENTICATION CHECKS
    // --------------------------------------------------

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

    if (step > 1 && !business) {
        return <Navigate to="/onboarding/business" replace />;
    }

    // --------------------------------------------------
    // PAGE
    // --------------------------------------------------

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
                {/* INTRODUCTION */}
                <div className="onboarding-intro">
                    <span className="onboarding-step">
                        {step === 1
                            ? "STEP 01 — BUSINESS PROFILE"
                            : step === 2
                            ? "STEP 02 — ADD SERVICES"
                            : "STEP 03 — ADD STAFF"}
                    </span>

                    <h1>
                        {step === 1 ? (
                            <>
                                Let's set up your
                                <span> business.</span>
                            </>
                        ) : step === 2 ? (
                            <>
                                Introduce your
                                <span> services.</span>
                            </>
                        ) : (
                            <>
                                Build your
                                <span> team.</span>
                            </>
                        )}
                    </h1>

                    <p>
                        {step === 1
                            ? `Welcome, ${displayName}. Tell us about your business so we can create your Velora workspace.`
                            : step === 2
                            ? `Add the services that ${business?.business_name} offers to its customers.`
                            : `Add the people who will help run ${business?.business_name}. You can also add more staff later from your dashboard.`}
                    </p>
                </div>

                {/* PROGRESS */}
                <div className="onboarding-progress">
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${(step / 3) * 100}%`,
                            }}
                        />
                    </div>

                    <span>Step {step} of 3</span>
                </div>

                {/* ====================================== */}
                {/* STEP 1: BUSINESS PROFILE */}
                {/* ====================================== */}

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

                                    {Object.entries(CATEGORY_LABELS).map(
                                        ([value, label]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
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
                                            <strong>
                                                Upload your logo
                                            </strong>
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

                            <button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Creating business..."
                                    : "Create business"}

                                {!submitting && <span>→</span>}
                            </button>
                        </div>
                    </form>
                )}

                {/* ====================================== */}
                {/* STEP 2: SERVICES */}
                {/* ====================================== */}

                {step === 2 && business && (
                    <section className="services-onboarding">
                        <div className="form-section-heading">
                            <div>
                                <h2>Introduce your services</h2>
                                <p>
                                    What services does{" "}
                                    {business.business_name} offer?
                                    Add your first service to get started.
                                </p>
                            </div>
                        </div>

                        {serviceError && (
                            <div className="form-error" role="alert">
                                {serviceError}
                            </div>
                        )}

                        <form
                            className="business-form service-form"
                            onSubmit={handleAddService}
                        >
                            <div className="form-grid">
                                <div className="form-field full-width">
                                    <label htmlFor="service_name">
                                        Service name *
                                    </label>

                                    <input
                                        id="service_name"
                                        name="service_name"
                                        type="text"
                                        placeholder="e.g. Hair Styling"
                                        value={serviceForm.service_name}
                                        onChange={handleServiceChange}
                                        required
                                    />

                                    {serviceFieldErrors.service_name && (
                                        <small className="field-error">
                                            {serviceFieldErrors.service_name}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field full-width">
                                    <label htmlFor="service_description">
                                        Service description
                                    </label>

                                    <textarea
                                        id="service_description"
                                        name="service_description"
                                        rows={3}
                                        placeholder="Describe what this service includes..."
                                        value={serviceForm.service_description}
                                        onChange={handleServiceChange}
                                    />

                                    {serviceFieldErrors.service_description && (
                                        <small className="field-error">
                                            {serviceFieldErrors.service_description}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="price">
                                        Price (KES) *
                                    </label>

                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="1500"
                                        value={serviceForm.price}
                                        onChange={handleServiceChange}
                                        required
                                    />

                                    {serviceFieldErrors.price && (
                                        <small className="field-error">
                                            {serviceFieldErrors.price}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="duration_minutes">
                                        Duration (minutes) *
                                    </label>

                                    <input
                                        id="duration_minutes"
                                        name="duration_minutes"
                                        type="number"
                                        min="1"
                                        placeholder="60"
                                        value={serviceForm.duration_minutes}
                                        onChange={handleServiceChange}
                                        required
                                    />

                                    {serviceFieldErrors.duration_minutes && (
                                        <small className="field-error">
                                            {serviceFieldErrors.duration_minutes}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field full-width">
                                    <label className="service-availability">
                                        <input
                                            type="checkbox"
                                            name="is_available"
                                            checked={serviceForm.is_available}
                                            onChange={handleServiceChange}
                                        />

                                        <span>
                                            Make this service available for booking
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-footer">
                                <p>
                                    Adding services for{" "}
                                    <strong>{business.business_name}</strong>
                                </p>

                                <button
                                    type="submit"
                                    disabled={serviceSubmitting}
                                >
                                    {serviceSubmitting
                                        ? "Saving service..."
                                        : "Add service"}

                                    {!serviceSubmitting && <span>+</span>}
                                </button>
                            </div>
                        </form>

                        {services.length > 0 && (
                            <div className="saved-services">
                                <div className="saved-services-heading">
                                    <div>
                                        <h3>Your services</h3>
                                        <p>
                                            {services.length} service
                                            {services.length !== 1 ? "s" : ""} added
                                        </p>
                                    </div>
                                </div>

                                <div className="saved-services-list">
                                    {services.map((service) => (
                                        <div
                                            className="saved-service-item"
                                            key={service.id}
                                        >
                                            <div className="service-item-icon">
                                                ✦
                                            </div>

                                            <div className="service-item-details">
                                                <strong>
                                                    {service.service_name}
                                                </strong>
                                                <small>
                                                    {service.duration_minutes} minutes
                                                </small>
                                            </div>

                                            <div className="service-item-price">
                                                KES{" "}
                                                {Number(service.price).toLocaleString()}
                                            </div>

                                            <span
                                                className={
                                                    service.is_available
                                                        ? "service-status available"
                                                        : "service-status unavailable"
                                                }
                                            >
                                                {service.is_available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="services-continue">
                            <p>
                                You can add more services at any time from your dashboard.
                            </p>

                            <button
                                type="button"
                                onClick={handleContinueToStepThree}
                                disabled={services.length === 0}
                            >
                                Continue to next step <span>→</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* ====================================== */}
                {/* STEP 3: STAFF */}
                {/* ====================================== */}

                {step === 3 && business && (
                    <section className="staff-onboarding">
                        <div className="form-section-heading">
                            <div>
                                <h2>Add your team members</h2>
                                <p>
                                    Add the staff members who will provide
                                    services at {business.business_name}.
                                </p>
                            </div>
                        </div>

                        {staffError && (
                            <div className="form-error" role="alert">
                                {staffError}
                            </div>
                        )}

                        <form
                            className="business-form staff-form"
                            onSubmit={handleAddStaff}
                        >
                            <div className="form-grid">
                                <div className="form-field full-width">
                                    <label htmlFor="staff_name">
                                        Staff member's name *
                                    </label>

                                    <input
                                        id="staff_name"
                                        name="staff_name"
                                        type="text"
                                        placeholder="e.g. Jane Wanjiku"
                                        value={staffForm.staff_name}
                                        onChange={handleStaffChange}
                                        required
                                    />

                                    {staffFieldErrors.staff_name && (
                                        <small className="field-error">
                                            {staffFieldErrors.staff_name}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="staff_email">
                                        Staff email *
                                    </label>

                                    <input
                                        id="staff_email"
                                        name="staff_email"
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={staffForm.staff_email}
                                        onChange={handleStaffChange}
                                        required
                                    />

                                    {staffFieldErrors.staff_email && (
                                        <small className="field-error">
                                            {staffFieldErrors.staff_email}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="id_number">
                                        ID number *
                                    </label>

                                    <input
                                        id="id_number"
                                        name="id_number"
                                        type="text"
                                        maxLength={8}
                                        placeholder="National ID number"
                                        value={staffForm.id_number}
                                        onChange={handleStaffChange}
                                        required
                                    />

                                    {staffFieldErrors.id_number && (
                                        <small className="field-error">
                                            {staffFieldErrors.id_number}
                                        </small>
                                    )}
                                </div>

                                <div className="form-field full-width">
                                    <label className="service-availability">
                                        <input
                                            type="checkbox"
                                            name="is_available"
                                            checked={staffForm.is_available}
                                            onChange={handleStaffChange}
                                        />

                                        <span>
                                            This staff member is currently available
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-footer">
                                <p>
                                    Adding staff for{" "}
                                    <strong>{business.business_name}</strong>
                                </p>

                                <button
                                    type="submit"
                                    disabled={staffSubmitting}
                                >
                                    {staffSubmitting
                                        ? "Adding staff..."
                                        : "Add staff member"}

                                    {!staffSubmitting && <span>+</span>}
                                </button>
                            </div>
                        </form>

                        {/* SAVED STAFF */}
                        {staff.length > 0 && (
                            <div className="saved-services">
                                <div className="saved-services-heading">
                                    <div>
                                        <h3>Your team</h3>
                                        <p>
                                            {staff.length} team member
                                            {staff.length !== 1 ? "s" : ""} added
                                        </p>
                                    </div>
                                </div>

                                <div className="saved-services-list">
                                    {staff.map((member) => (
                                        <div
                                            className="saved-service-item"
                                            key={member.id}
                                        >
                                            <div className="service-item-icon">
                                                {member.staff_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="service-item-details">
                                                <strong>
                                                    {member.staff_name}
                                                </strong>
                                                <small>
                                                    {member.staff_email}
                                                </small>
                                            </div>

                                            <span
                                                className={
                                                    member.is_available
                                                        ? "service-status available"
                                                        : "service-status unavailable"
                                                }
                                            >
                                                {member.is_available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FINISH */}
                        <div className="services-continue">
                            <p>
                                {staff.length > 0
                                    ? "Your team has been added. You are ready to enter your workspace."
                                    : "You can skip adding staff for now and add team members later from your dashboard."}
                            </p>

                            <button
                                type="button"
                                onClick={handleFinishOnboarding}
                            >
                                Finish onboarding <span>→</span>
                            </button>
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}

export default BusinessOnboarding;