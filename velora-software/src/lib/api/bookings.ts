import backendClient, { API_URL } from "./axios";
import type {
    AnalyticsReport,
    AvailabilityResponse,
    Booking,
    BookingEvent,
    BookingPolicy,
    Customer,
    Location,
    NotificationLog,
    PublicBooking,
    PublicBusiness,
    Resource,
    TimeOff,
    WaitlistEntry,
    WorkingHours,
} from "../../types/bookings";

type Params = Record<string, string | number | boolean | undefined | null>;

function clean(params: Params): Params {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
}

// ------------------------------------------------------------------
// Policy & schedule
// ------------------------------------------------------------------

export const getPolicy = async (business: number) =>
    (await backendClient.get<BookingPolicy>("bk/policy/", { params: { business } })).data;

export const updatePolicy = async (business: number, payload: Partial<BookingPolicy>) =>
    (await backendClient.patch<BookingPolicy>("bk/policy/", payload, { params: { business } })).data;

export const getWorkingHours = async (business: number, staff?: number | "business") =>
    (await backendClient.get<WorkingHours[]>("bk/working-hours/", { params: clean({ business, staff }) })).data;

export const createWorkingHours = async (payload: Partial<WorkingHours>) =>
    (await backendClient.post<WorkingHours>("bk/working-hours/", payload)).data;

export const updateWorkingHours = async (id: number, payload: Partial<WorkingHours>) =>
    (await backendClient.patch<WorkingHours>(`bk/working-hours/${id}/`, payload)).data;

export const deleteWorkingHours = async (id: number) => {
    await backendClient.delete(`bk/working-hours/${id}/`);
};

export const getTimeOff = async (business: number) =>
    (await backendClient.get<TimeOff[]>("bk/time-off/", { params: { business, upcoming: 1 } })).data;

export const createTimeOff = async (payload: Partial<TimeOff>) =>
    (await backendClient.post<TimeOff>("bk/time-off/", payload)).data;

export const deleteTimeOff = async (id: number) => {
    await backendClient.delete(`bk/time-off/${id}/`);
};

export const getResources = async (business: number) =>
    (await backendClient.get<Resource[]>("bk/resources/", { params: { business } })).data;

export const createResource = async (payload: Partial<Resource>) =>
    (await backendClient.post<Resource>("bk/resources/", payload)).data;

export const deleteResource = async (id: number) => {
    await backendClient.delete(`bk/resources/${id}/`);
};

export const getLocations = async (business: number) =>
    (await backendClient.get<Location[]>("bk/locations/", { params: { business } })).data;

export const createLocation = async (payload: Partial<Location>) =>
    (await backendClient.post<Location>("bk/locations/", payload)).data;

export const deleteLocation = async (id: number) => {
    await backendClient.delete(`bk/locations/${id}/`);
};

// ------------------------------------------------------------------
// Bookings
// ------------------------------------------------------------------

export interface BookingFilters {
    date_from?: string;
    date_to?: string;
    status?: string;
    staff?: number | string;
    service?: number | string;
    customer?: number | string;
    search?: string;
}

export const getBookings = async (business: number, filters: BookingFilters = {}) =>
    (await backendClient.get<Booking[]>("bk/bookings/", { params: clean({ business, ...filters }) })).data;

export const getBooking = async (id: number) =>
    (await backendClient.get<Booking>(`bk/bookings/${id}/`)).data;

export interface NewBookingPayload {
    business: number;
    service: number;
    staff?: number | null;
    customer?: number | null;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    start?: string;
    channel: "staff" | "phone" | "walk_in" | "whatsapp";
    intake_notes?: string;
    internal_notes?: string;
    override_policy?: boolean;
}

export const createBooking = async (payload: NewBookingPayload) =>
    (await backendClient.post<Booking>("bk/bookings/", payload)).data;

export const updateBookingNotes = async (id: number, payload: { internal_notes?: string; intake_notes?: string }) =>
    (await backendClient.patch<Booking>(`bk/bookings/${id}/`, payload)).data;

export type BookingAction = "confirm" | "complete" | "no-show" | "check-in";

export const bookingAction = async (id: number, action: BookingAction) =>
    (await backendClient.post<Booking>(`bk/bookings/${id}/${action}/`)).data;

export const cancelBooking = async (id: number, reason: string, override_policy = false) =>
    (await backendClient.post<Booking>(`bk/bookings/${id}/cancel/`, { reason, override_policy })).data;

export const rescheduleBooking = async (
    id: number,
    payload: { start: string; staff?: number | null; override_policy?: boolean }
) => (await backendClient.post<Booking>(`bk/bookings/${id}/reschedule/`, payload)).data;

export const recordPayment = async (
    id: number,
    payload: { amount: string; kind: string; method: string; reference?: string }
) => (await backendClient.post<Booking>(`bk/bookings/${id}/payments/`, payload)).data;

export const getBookingHistory = async (id: number) =>
    (await backendClient.get<BookingEvent[]>(`bk/bookings/${id}/history/`)).data;

export const getBookingNotifications = async (id: number) =>
    (await backendClient.get<NotificationLog[]>(`bk/bookings/${id}/notifications/`)).data;

export const getOwnerAvailability = async (
    business: number,
    params: { service: number; date: string; staff?: number | null; override?: boolean; exclude?: number }
) =>
    (
        await backendClient.get<AvailabilityResponse>("bk/availability/", {
            params: clean({ business, ...params, override: params.override ? 1 : undefined }),
        })
    ).data;

// ------------------------------------------------------------------
// Customers, waitlist, notifications
// ------------------------------------------------------------------

export const getCustomers = async (business: number, search = "") =>
    (await backendClient.get<Customer[]>("bk/customers/", { params: clean({ business, search }) })).data;

export const createCustomer = async (payload: Partial<Customer>) =>
    (await backendClient.post<Customer>("bk/customers/", payload)).data;

export const updateCustomer = async (id: number, payload: Partial<Customer>) =>
    (await backendClient.patch<Customer>(`bk/customers/${id}/`, payload)).data;

export const getCustomerBookings = async (id: number) =>
    (await backendClient.get<Booking[]>(`bk/customers/${id}/bookings/`)).data;

export const getWaitlist = async (business: number) =>
    (await backendClient.get<WaitlistEntry[]>("bk/waitlist/", { params: { business } })).data;

export const updateWaitlistEntry = async (id: number, status: WaitlistEntry["status"]) =>
    (await backendClient.patch<WaitlistEntry>(`bk/waitlist/${id}/`, { status })).data;

export const getNotifications = async (
    business: number,
    filters: { status?: string; channel?: string; event?: string } = {}
) =>
    (await backendClient.get<NotificationLog[]>("bk/notifications/", { params: clean({ business, ...filters }) }))
        .data;

export const retryNotification = async (id: number) =>
    (await backendClient.post<NotificationLog>(`bk/notifications/${id}/retry/`)).data;

// ------------------------------------------------------------------
// Analytics
// ------------------------------------------------------------------

export interface AnalyticsFilters {
    date_from: string;
    date_to: string;
    staff?: number | string;
    service?: number | string;
    location?: number | string;
}

export const getAnalytics = async (business: number, filters: AnalyticsFilters) =>
    (await backendClient.get<AnalyticsReport>("bk/analytics/", { params: clean({ business, ...filters }) })).data;

export const downloadAnalyticsCsv = async (
    business: number,
    filters: AnalyticsFilters,
    kind: "bookings" | "summary"
) => {
    const response = await backendClient.get<Blob>("bk/analytics/export/", {
        params: clean({ business, ...filters, kind }),
        responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `velora-${kind}-${filters.date_from}-to-${filters.date_to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

// ------------------------------------------------------------------
// Public booking API (no login)
// ------------------------------------------------------------------

/** `businessRef` is the booking-link slug (glow-salon) or, for older links, the numeric id. */
export const getPublicBusiness = async (businessRef: string | number) =>
    (await backendClient.get<PublicBusiness>(`bk/public/${encodeURIComponent(String(businessRef))}/`)).data;

export const getPublicAvailability = async (
    businessId: number,
    params: { service: number; date: string; staff?: number | null }
) =>
    (await backendClient.get<AvailabilityResponse>(`bk/public/${businessId}/availability/`, { params: clean(params) }))
        .data;

export const getPublicAvailableDays = async (
    businessId: number,
    params: { service: number; staff?: number | null; from?: string; days?: number }
) =>
    (
        await backendClient.get<{ timezone: string; days: { date: string; available: number }[] }>(
            `bk/public/${businessId}/available-days/`,
            { params: clean(params) }
        )
    ).data;

export interface PublicBookingPayload {
    service: number;
    staff?: number | null;
    start: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    intake_notes?: string;
    preferred_channel?: string;
    session_key?: string;
    source?: string;
}

export const createPublicBooking = async (businessId: number, payload: PublicBookingPayload) =>
    (await backendClient.post<PublicBooking>(`bk/public/${businessId}/bookings/`, payload)).data;

export const trackFunnel = (businessId: number, step: string, session_key: string, source: string) => {
    backendClient
        .post(`bk/public/${businessId}/track/`, { step, session_key, source })
        .catch(() => undefined);
};

export const joinWaitlist = async (
    businessId: number,
    payload: { service: number; staff?: number | null; desired_date: string; full_name: string; email?: string; phone_number?: string }
) => (await backendClient.post(`bk/public/${businessId}/waitlist/`, payload)).data;

export const getManagedBooking = async (token: string) =>
    (await backendClient.get<PublicBooking>(`bk/public/manage/${token}/`)).data;

export const cancelManagedBooking = async (token: string, reason: string) =>
    (await backendClient.post<PublicBooking>(`bk/public/manage/${token}/cancel/`, { reason })).data;

export const rescheduleManagedBooking = async (token: string, start: string, staff?: number | null) =>
    (await backendClient.post<PublicBooking>(`bk/public/manage/${token}/reschedule/`, clean({ start, staff })))
        .data;

export const confirmManagedBooking = async (token: string) =>
    (await backendClient.post<PublicBooking>(`bk/public/manage/${token}/confirm/`)).data;

export const updateManagedPreferences = async (token: string, prefs: Record<string, boolean>) =>
    (await backendClient.post<Record<string, boolean>>(`bk/public/manage/${token}/preferences/`, prefs)).data;

/** Public booking link, e.g. https://getvelora.co.ke/book/glow-salon */
export const publicBookingUrl = (slug: string) => `${window.location.origin}/book/${slug}`;
export const mediaUrl = (path: string | null) =>
    !path ? null : path.startsWith("http") ? path : `${API_URL.replace(/\/$/, "")}${path}`;
