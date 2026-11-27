import type { ReactNode } from "react";
import { useOutletContext } from "react-router";
import type { Business } from "../../types/business";
import type { BookingPolicy } from "../../types/bookings";
import type { Service } from "../../types/services";
import type { Staff } from "../../types/staff";

export interface DashboardContext {
    business: Business;
    policy: BookingPolicy;
    services: Service[];
    staff: Staff[];
    timeZone: string;
    reloadServices: () => Promise<void>;
    reloadStaff: () => Promise<void>;
    setPolicy: (policy: BookingPolicy) => void;
    setBusiness: (business: Business) => void;
    /** Bell and profile menu, shown at the right of every page header. */
    accountActions: ReactNode;
    /** Copies the public booking link; resolves true when it was copied. */
    copyBookingLink: () => Promise<boolean>;
}

export function useDashboard(): DashboardContext {
    return useOutletContext<DashboardContext>();
}
