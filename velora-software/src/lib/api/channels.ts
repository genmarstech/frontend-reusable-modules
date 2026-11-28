import backendClient from "./axios";

// Telegram and WhatsApp bots for one business (backend app "bots").

export interface ChannelStats {
    /** The Velora bot is connected on the server (token and username or number set). */
    configured: boolean;
    enabled: boolean;
    /** Link customers open to book with this business in chat ("" until configured). */
    link: string;
    customers: number;
    bookings_total: number;
    bookings_30d: number;
}

export interface TelegramChannel extends ChannelStats {
    bot_username: string;
    owner_linked: boolean;
    owner_name: string;
    /** Single-use link that connects the owner's own Telegram for alerts. */
    owner_link: string;
}

export interface WhatsAppChannel extends ChannelStats {
    number: string;
    alert_owner: boolean;
    owner_number: string;
}

export interface ChannelSettings {
    business: number;
    booking_link: string;
    telegram: TelegramChannel;
    whatsapp: WhatsAppChannel;
}

export interface ChannelSettingsUpdate {
    telegram_enabled?: boolean;
    whatsapp_enabled?: boolean;
    alert_owner_whatsapp?: boolean;
    unlink_owner_telegram?: boolean;
}

export const getChannelSettings = async (business: number) =>
    (await backendClient.get<ChannelSettings>("bots/settings/", { params: { business } })).data;

export const updateChannelSettings = async (business: number, payload: ChannelSettingsUpdate) =>
    (await backendClient.patch<ChannelSettings>("bots/settings/", payload, { params: { business } })).data;
