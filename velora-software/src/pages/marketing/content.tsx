import { CalendarDays, ChartNoAxesCombined, Clock3, Users } from "lucide-react";
import type { ComponentType } from "react";
import { BookingArt, ClientsArt, InsightsArt, PhoneBookingArt, ServicesArt, TeamArt } from "../../components/Illustrations";

/**
 * Words for the public site, kept apart from layout.
 * Voice: warm, plain and sure of itself. Short sentences, "you" and "your clients",
 * and only promises the product keeps today. See BRAND.md.
 */

export const NAV_PAGES = [
    { to: "/features", label: "Features" },
    { to: "/solutions", label: "Solutions" },
    { to: "/how-it-works", label: "How it works" },
    { to: "/about", label: "About" },
];

type Feature = {
    icon: ComponentType;
    art: ComponentType<{ className?: string }>;
    title: string;
    summary: string;
    points: string[];
};

export const FEATURES: Feature[] = [
    {
        icon: CalendarDays,
        art: BookingArt,
        title: "Online booking",
        summary: "Your own booking page, open day and night. Clients pick a service, a stylist and a time that is really free.",
        points: [
            "A link of your own to share on WhatsApp, Instagram or your Google profile",
            "Only open slots show, with your working hours, breaks and buffers respected",
            "Deposits, holds and a cancellation policy your clients see before they book",
            "Clients reschedule or cancel from their own link, within your rules",
        ],
    },
    {
        icon: Users,
        art: ClientsArt,
        title: "Client records",
        summary: "Every client, their visits and their preferences in one place, so each visit feels personal.",
        points: [
            "Contact details and full visit history for every client",
            "Private notes your team can read before the appointment",
            "See who comes back, who has gone quiet and who missed a visit",
            "A waitlist that offers freed-up slots to the people waiting for them",
        ],
    },
    {
        icon: Clock3,
        art: TeamArt,
        title: "Team & schedule",
        summary: "Hours, skills and days off for everyone, so the right person is booked for the right service.",
        points: [
            "Business hours, plus each team member's own hours and breaks",
            "Time off blocks the calendar for you",
            "Link services to the people who offer them",
            "Walk-ins and phone bookings sit on the same calendar as online ones",
        ],
    },
    {
        icon: ChartNoAxesCombined,
        art: InsightsArt,
        title: "Reminders & insights",
        summary: "Fewer no-shows, and a clear view of how the business is doing.",
        points: [
            "Booking confirmations and reminders sent for you, outside your quiet hours",
            "A weekly summary of bookings and revenue in your inbox",
            "Revenue in KES by service and team member, and how busy each person is",
            "A log of every message sent, so nothing slips through",
        ],
    },
];

export const INDUSTRIES = [
    {
        name: "Beauty salons",
        text: "Long colour appointments, quick trims and a full team, all on one calendar without double bookings.",
    },
    {
        name: "Barbershops",
        text: "Walk-ins and bookings side by side, so the queue stays fair and every chair stays busy.",
    },
    {
        name: "Spas & wellness",
        text: "Rooms, therapists and longer treatments booked together, with prep time built in.",
    },
    {
        name: "Beauty clinics",
        text: "Deposits, intake notes and clear policies for treatments that need a little more care.",
    },
    {
        name: "Independent professionals",
        text: "A booking page that works while you work, and reminders that go out on their own.",
    },
];

export const STEPS = [
    {
        art: ServicesArt,
        title: "Create your account",
        text: "Sign up in a minute. No card needed. Tell us your business name and what you offer.",
    },
    {
        art: TeamArt,
        title: "Set up your business",
        text: "Add your services and prices in KES, your opening hours and your team.",
    },
    {
        art: PhoneBookingArt,
        title: "Share your booking link",
        text: "Send your link to clients. Bookings land in your dashboard, and reminders go out for you.",
    },
];
