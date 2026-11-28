export type BookingStatus =
    | "pending"
    | "held"
    | "confirmed"
    | "rescheduled"
    | "cancelled"
    | "completed"
    | "no_show";

export type BookingChannel = "online" | "walk_in" | "phone" | "staff" | "whatsapp" | "telegram" | "api";

export type NotifyChannel = "email" | "sms" | "whatsapp" | "push";

export interface Payment {
    id: number;
    kind: "deposit" | "balance" | "cancellation_fee" | "refund";
    kind_label: string;
    method: "cash" | "card" | "mobile_money" | "bank_transfer" | "other";
    method_label: string;
    amount: string;
    reference: string;
    created_at: string;
}

export interface Booking {
    id: number;
    business: number;
    customer: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service: number;
    service_name: string;
    duration_minutes: number;
    staff: number | null;
    staff_name: string | null;
    resource: number | null;
    location: number | null;
    start: string;
    end: string;
    status: BookingStatus;
    status_label: string;
    channel: BookingChannel;
    channel_label: string;
    intake_notes: string;
    internal_notes: string;
    price: string;
    deposit_amount: string;
    deposit_paid: boolean;
    amount_paid: string;
    balance_due: string;
    cancellation_fee: string;
    hold_expires_at: string | null;
    confirmed_at: string | null;
    checked_in_at: string | null;
    cancelled_at: string | null;
    cancelled_by: string;
    cancellation_reason: string;
    is_late_cancellation: boolean;
    reschedule_count: number;
    payments: Payment[];
    manage_token: string;
    created_at: string;
    updated_at: string;
}

export interface BookingEvent {
    id: number;
    action: string;
    from_status: string;
    to_status: string;
    actor_type: string;
    actor_name: string;
    note: string;
    is_policy_override: boolean;
    data: Record<string, unknown>;
    created_at: string;
}

export interface Slot {
    start: string;
    end: string;
    label: string;
    staff_ids: number[];
}

export interface AvailabilityResponse {
    date: string;
    timezone: string;
    slots: Slot[];
}

export interface Customer {
    id: number;
    business: number;
    full_name: string;
    email: string;
    phone_number: string;
    notes: string;
    preferred_channel: NotifyChannel | "";
    opt_out_email: boolean;
    opt_out_sms: boolean;
    opt_out_whatsapp: boolean;
    opt_out_push: boolean;
    first_channel: string;
    total_bookings: number;
    last_visit: string | null;
    no_shows: number;
    /** Signed up on the booking link (has a Velora customer account). */
    has_account?: boolean;
    joined_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BookingPolicy {
    business: number;
    timezone: string;
    slot_interval_minutes: number;
    min_notice_minutes: number;
    max_advance_days: number;
    auto_confirm: boolean;
    cancellation_window_hours: number;
    reschedule_window_hours: number;
    max_reschedules: number;
    late_arrival_grace_minutes: number;
    cancellation_fee_percentage: string;
    deposit_required: boolean;
    deposit_percentage: string;
    hold_minutes: number;
    refund_deposit_on_cancellation: boolean;
    policy_notes: string;
    notification_channels: NotifyChannel[];
    reminder_hours: number[];
    follow_up_hours: number;
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
    notify_staff: boolean;
    updated_at: string;
}

export interface WorkingHours {
    id: number;
    business: number;
    staff: number | null;
    weekday: number;
    weekday_label: string;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    is_closed: boolean;
}

export interface TimeOff {
    id: number;
    business: number;
    staff: number | null;
    staff_name: string | null;
    start: string;
    end: string;
    reason: string;
    created_at: string;
}

export interface Resource {
    id: number;
    business: number;
    location: number | null;
    name: string;
    kind: "room" | "equipment";
    capacity: number;
    is_active: boolean;
}

export interface Location {
    id: number;
    business: number;
    name: string;
    address: string;
    is_virtual: boolean;
    meeting_link: string;
    is_active: boolean;
}

export interface NotificationLog {
    id: number;
    booking: number | null;
    event: string;
    event_label: string;
    channel: NotifyChannel;
    recipient_type: string;
    recipient_name: string;
    to_address: string;
    subject: string;
    body: string;
    status: "queued" | "sent" | "delivered" | "failed" | "skipped" | "cancelled";
    scheduled_for: string;
    attempts: number;
    next_attempt_at: string | null;
    provider: string;
    error: string;
    sent_at: string | null;
    delivered_at: string | null;
    created_at: string;
}

export interface WaitlistEntry {
    id: number;
    business: number;
    customer: number;
    customer_name: string;
    service: number;
    service_name: string;
    staff: number | null;
    desired_date: string;
    status: "waiting" | "notified" | "booked" | "removed";
    notified_at: string | null;
    created_at: string;
}

export interface RevenueRow {
    name: string;
    bookings: number;
    booked_value: string;
    collected: string;
}

export interface AnalyticsReport {
    range: { date_from: string; date_to: string; timezone: string };
    bookings: {
        total: number;
        by_status: Record<BookingStatus, number>;
        by_channel: Record<string, number>;
        trend: { date: string; bookings: number }[];
    };
    funnel: {
        steps: { step: string; label: string; sessions: number; drop_off_pct: number }[];
        conversion_pct: number;
        by_source: { source: string; views: number; booked: number; conversion_pct: number }[];
    };
    attendance: {
        no_show_rate_pct: number;
        cancellation_rate_pct: number;
        late_cancellations: number;
        rescheduled_bookings: number;
        reschedule_rate_pct: number;
        reminder_effectiveness: {
            no_show_rate_with_reminder_pct: number;
            no_show_rate_without_reminder_pct: number;
            reminded_bookings: number;
        };
    };
    capacity: {
        occupancy_pct: number;
        booked_hours: number;
        available_hours: number;
        idle_hours: number;
        staff: {
            staff_id: number;
            staff_name: string;
            available_hours: number;
            booked_hours: number;
            idle_hours: number;
            occupancy_pct: number;
            bookings: number;
        }[];
        peak_hours: { hour: number; bookings: number }[];
        busiest_days: { day: string; bookings: number }[];
        resources: { name: string; bookings: number }[];
    };
    revenue: {
        collected: string;
        booked_value: string;
        completed_value: string;
        deposits_collected: string;
        cancellation_fees_charged: string;
        cancellation_fees_collected: string;
        refunds: string;
        by_service: RevenueRow[];
        by_staff: RevenueRow[];
        by_location: RevenueRow[];
        by_payment_method: { method: string; amount: string }[];
    };
    customers: {
        unique: number;
        new: number;
        returning: number;
        repeat_rate_pct: number;
        avg_days_between_visits: number | null;
        top_channels: { channel: string; customers: number }[];
    };
}

// Public booking page
export interface PublicService {
    id: number;
    service_name: string;
    service_description: string | null;
    price: string;
    duration_minutes: number;
    deposit_amount: string | null;
    /** False when nobody can do it yet (no team member, skill or working hours). */
    bookable?: boolean;
}

export interface PublicStaff {
    id: number;
    staff_name: string;
    service_ids: number[];
}

export interface PublicBusiness {
    id: number;
    slug: string;
    business_name: string;
    business_description: string;
    business_category: string;
    business_category_label: string;
    business_logo: string | null;
    whatsapp_number: string;
    business_email: string;
    services: PublicService[];
    staff: PublicStaff[];
    /** False until the business has a team with open times for at least one service. */
    accepting_bookings?: boolean;
    /** Book in a chat app instead: {"whatsapp": "https://wa.me/..."} when the business is on it. */
    chat_links?: { whatsapp?: string };
    policy: {
        timezone: string;
        max_advance_days: number;
        min_notice_minutes: number;
        cancellation_window_hours: number;
        reschedule_window_hours: number;
        deposit_required: boolean;
        deposit_percentage: string;
        cancellation_fee_percentage: string;
        late_arrival_grace_minutes: number;
        policy_notes: string;
    };
}

export interface PublicBooking {
    manage_token: string;
    status: BookingStatus;
    status_label: string;
    service_id: number;
    service_name: string;
    duration_minutes: number;
    staff_id: number | null;
    staff_name: string | null;
    customer_name: string;
    business_id: number;
    business_slug: string;
    business_name: string;
    start: string;
    end: string;
    price: string;
    deposit_amount: string;
    deposit_paid: boolean;
    balance_due: string;
    cancellation_fee: string;
    hold_expires_at: string | null;
    reschedule_count: number;
    intake_notes: string;
    can_cancel?: boolean;
    can_reschedule?: boolean;
    can_confirm?: boolean;
    policy?: {
        cancellation_window_hours: number;
        reschedule_window_hours: number;
        max_reschedules: number;
        timezone: string;
        policy_notes: string;
    };
}

// Owner dashboard overview (GET bk/overview/)
export interface OverviewBookingItem {
    type: "booking";
    id: number;
    start: string;
    end: string;
    customer_name: string;
    service_name: string;
    duration_minutes: number;
    staff_name: string | null;
    status: BookingStatus;
    status_label: string;
}

export interface OverviewFreeItem {
    type: "available";
    start: string;
    end: string;
    minutes: number;
}

export interface SetupStep {
    key: "profile" | "services" | "team" | "hours" | "share";
    label: string;
    text: string;
    done: boolean;
    link: string;
    /** "share" only: customers who joined or booked through the link. */
    progress?: { value: number; target: number; reached: number };
}

export interface Overview {
    date: string;
    timezone: string;
    stats: {
        today: { value: number; previous: number; change_pct: number | null; spark: number[] };
        upcoming: { value: number; spark: number[] };
        services: { value: number; total: number; spark: number[] };
        staff: { value: number; available: number; spark: number[] };
    };
    schedule: (OverviewBookingItem | OverviewFreeItem)[];
    setup: { steps: SetupStep[]; completed: number; total: number };
    top_services: { service_id: number; name: string; bookings: number; spark: number[] }[];
    attention: number;
    failed_messages: number;
    readiness?: BookingReadiness;
    /** People waiting for a slot from the shown day on. */
    waitlist?: number;
}

export interface BookingReadiness {
    ready: boolean;
    all_ready: boolean;
    issues: { key: string; text: string; link: string; services?: string[] }[];
    unbookable_service_ids: number[];
}

// GET bk/overview/performance/
export interface Performance {
    range: { date_from: string; date_to: string; timezone: string };
    bucket: "day" | "week";
    revenue: { value: string; previous: string; change_pct: number | null };
    bookings: { value: number; previous: number; change_pct: number | null };
    returning_clients: { value_pct: number | null; previous_pct: number | null; change_pts: number | null };
    series: { date: string; end: string; revenue: string; bookings: number }[];
}

// GET bk/payments/
export interface PaymentRow {
    id: number;
    booking: number;
    created_at: string;
    customer_name: string;
    service_name: string;
    kind: Payment["kind"];
    kind_label: string;
    method: Payment["method"];
    method_label: string;
    amount: string;
    reference: string;
}

export interface PaymentsReport {
    range: { date_from: string; date_to: string; timezone: string };
    summary: { collected: string; deposits: string; refunds: string; outstanding: string; count: number };
    payments: PaymentRow[];
}
