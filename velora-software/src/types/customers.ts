import type { PublicBooking } from "./bookings";

/** A customer's Velora account (phone number is their identity). */
export interface CustomerAccount {
    id: number;
    full_name: string;
    first_name: string;
    phone_number: string;
    email: string;
}

// GET/PATCH cu/session/?business=<slug>
export interface CustomerSession {
    authenticated: boolean;
    account: CustomerAccount | null;
    /** Whether the account is a customer of the business in ?business=. */
    joined: boolean;
}

export interface RebookInfo {
    available: boolean;
    service: number;
    staff: number | null;
}

export type CustomerBooking = PublicBooking & { rebook: RebookInfo };

export interface FavouriteService {
    service: number;
    service_name: string;
    staff: number | null;
    staff_name: string | null;
    price: string;
    duration_minutes: number;
    times_booked: number;
    last_booked: string;
}

// GET cu/bookings/?business=<slug>
export interface CustomerBookings {
    joined: boolean;
    upcoming: CustomerBooking[];
    past: CustomerBooking[];
    favourites: FavouriteService[];
}
