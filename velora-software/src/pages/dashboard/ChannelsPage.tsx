import { useEffect, useState, type ReactNode } from "react";
import { BellRing, Check, Copy, ExternalLink, MessageCircle, Send, Share2, Unlink } from "lucide-react";

import {
    getChannelSettings,
    updateChannelSettings,
    type ChannelSettings,
    type ChannelSettingsUpdate,
    type ChannelStats,
} from "../../lib/api/channels";
import { handleApiError } from "../../lib/api/handleErrors";
import { Alert, PageHeader, Section, Spinner } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

import "../../styles/channels.css";

/**
 * Channels: let customers book, rebook and get reminders in Telegram and
 * WhatsApp. Every business shares one Velora bot per app; the links here
 * carry the business's booking reference so the bot knows where to book.
 */
function ChannelsPage() {
    const { business } = useDashboard();
    const [data, setData] = useState<ChannelSettings | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState("");

    useEffect(() => {
        let active = true;
        getChannelSettings(business.id)
            .then((d) => active && setData(d))
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [business.id]);

    // Refresh when the owner comes back from Telegram after linking their account.
    useEffect(() => {
        const onFocus = () => {
            getChannelSettings(business.id).then(setData).catch(() => undefined);
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [business.id]);

    const save = async (key: string, payload: ChannelSettingsUpdate) => {
        setSaving(key);
        setError("");
        try {
            setData(await updateChannelSettings(business.id, payload));
        } catch (err) {
            setError(handleApiError(err).message);
        } finally {
            setSaving("");
        }
    };

    if (!data) {
        return (
            <div className="dashboard-overview">
                <PageHeader title="Channels" text="Let customers book in the chat apps they already use." />
                {error ? <Alert>{error}</Alert> : <Spinner />}
            </div>
        );
    }

    const { telegram, whatsapp } = data;
    const name = business.business_name;

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Channels"
                text="Let customers book, rebook and get reminders on Telegram and WhatsApp, without downloading anything."
            />
            <Alert>{error}</Alert>

            <div className="ch-grid">
                <ChannelCard
                    kind="telegram"
                    title="Telegram"
                    icon={<Send size={20} />}
                    stats={telegram}
                    saving={saving === "telegram"}
                    onToggle={(on) => save("telegram", { telegram_enabled: on })}
                    shareText={`Book your next appointment at ${name} on Telegram: ${telegram.link}`}
                    pending="The Velora Telegram bot is being set up. Your link will appear here as soon as it is ready."
                    how="Customers tap the link, share their phone number once, then book with buttons."
                />
                <ChannelCard
                    kind="whatsapp"
                    title="WhatsApp"
                    icon={<MessageCircle size={20} />}
                    stats={whatsapp}
                    saving={saving === "whatsapp"}
                    onToggle={(on) => save("whatsapp", { whatsapp_enabled: on })}
                    shareText={`Book your next appointment at ${name} on WhatsApp: ${whatsapp.link}`}
                    pending="The Velora WhatsApp number is being set up. Your link will appear here as soon as it is ready."
                    how="Customers tap the link and send the ready-made message. Their WhatsApp number is their account."
                />
            </div>

            <Section title="New booking alerts" text="Get each new booking in chat, with buttons to confirm or decline it.">
                <div className="ch-alerts">
                    <div className="ch-alert-row">
                        <span className="ch-icon ch-icon-telegram"><Send size={16} /></span>
                        <div className="ch-alert-text">
                            <strong>Your Telegram</strong>
                            <small>
                                {telegram.owner_linked
                                    ? `Linked to ${telegram.owner_name || "your Telegram"}. New bookings arrive there.`
                                    : "Link your own Telegram account to get alerts."}
                            </small>
                        </div>
                        {telegram.owner_linked ? (
                            <button
                                type="button"
                                className="v-btn v-btn-small v-btn-ghost ch-btn"
                                disabled={saving === "owner"}
                                onClick={() => save("owner", { unlink_owner_telegram: true })}
                            >
                                <Unlink size={14} /> Unlink
                            </button>
                        ) : telegram.owner_link ? (
                            <a className="v-btn v-btn-small ch-btn" href={telegram.owner_link} target="_blank" rel="noreferrer">
                                <BellRing size={14} /> Link my Telegram
                            </a>
                        ) : (
                            <span className="ch-soon">Coming soon</span>
                        )}
                    </div>
                    <div className="ch-alert-row">
                        <span className="ch-icon ch-icon-whatsapp"><MessageCircle size={16} /></span>
                        <div className="ch-alert-text">
                            <strong>Your WhatsApp</strong>
                            <small>
                                {whatsapp.owner_number
                                    ? `Send alerts to ${whatsapp.owner_number}, your business WhatsApp number.`
                                    : "Add your WhatsApp number in Settings first."}
                            </small>
                        </div>
                        <Switch
                            checked={whatsapp.alert_owner}
                            disabled={!whatsapp.owner_number || !whatsapp.configured || saving === "owner-wa"}
                            onChange={(on) => save("owner-wa", { alert_owner_whatsapp: on })}
                            label="WhatsApp alerts"
                        />
                    </div>
                </div>
            </Section>

            <Section title="What customers can do in chat">
                <ol className="ch-steps">
                    <li><strong>Book</strong><span>Pick a service, a team member and a time. Bookings wait for you to confirm, like your booking page.</span></li>
                    <li><strong>Book again</strong><span>Repeat their last service with the same stylist in a few taps.</span></li>
                    <li><strong>Manage</strong><span>See, move or cancel their bookings within your rules.</span></li>
                    <li><strong>Get reminders</strong><span>Confirmations, reminders 24 and 2 hours before, and a "book again?" message after each visit.</span></li>
                </ol>
                <p className="v-hint">Customers who join through these links count towards your "share your link" setup step.</p>
            </Section>
        </div>
    );
}

function ChannelCard({
    kind,
    title,
    icon,
    stats,
    saving,
    onToggle,
    shareText,
    pending,
    how,
}: {
    kind: "telegram" | "whatsapp";
    title: string;
    icon: ReactNode;
    stats: ChannelStats;
    saving: boolean;
    onToggle: (on: boolean) => void;
    shareText: string;
    pending: string;
    how: string;
}) {
    const [copied, setCopied] = useState(false);
    const ready = stats.configured && Boolean(stats.link);
    const live = ready && stats.enabled;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(stats.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy this link", stats.link);
        }
    };

    return (
        <section className={`overview-section ch-card ${live ? "is-live" : ""}`}>
            <header className="ch-card-head">
                <span className={`ch-icon ch-icon-${kind}`}>{icon}</span>
                <div>
                    <h2>{title}</h2>
                    <span className={`ch-status ${live ? "on" : ""}`}>
                        {!ready ? "Not available yet" : live ? "Taking bookings" : "Off"}
                    </span>
                </div>
                <Switch checked={stats.enabled} disabled={!ready || saving} onChange={onToggle} label={`${title} bookings`} />
            </header>

            <p className="ch-how">{how}</p>

            {!ready ? (
                <Alert kind="info">{pending}</Alert>
            ) : (
                <>
                    <div className="share-link">
                        <input className="v-input" readOnly value={stats.link} onFocus={(e) => e.target.select()} aria-label={`${title} link`} />
                        <button type="button" className="v-btn v-btn-small" onClick={copy}>
                            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <div className="ch-actions">
                        <a className="share-action" href={stats.link} target="_blank" rel="noreferrer">
                            <ExternalLink size={16} /> Try it
                        </a>
                        <a
                            className="share-action share-whatsapp"
                            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Share2 size={16} /> Share link
                        </a>
                    </div>
                    {!stats.enabled && <p className="v-hint">Turn it on so customers who open the link can book.</p>}
                </>
            )}

            <dl className="ch-stats">
                <div><dt>Customers</dt><dd>{stats.customers}</dd></div>
                <div><dt>Bookings, 30 days</dt><dd>{stats.bookings_30d}</dd></div>
                <div><dt>All bookings</dt><dd>{stats.bookings_total}</dd></div>
            </dl>
        </section>
    );
}

function Switch({
    checked,
    disabled,
    onChange,
    label,
}: {
    checked: boolean;
    disabled?: boolean;
    onChange: (on: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            className={`ch-switch ${checked ? "on" : ""}`}
            onClick={(e) => {
                e.preventDefault();
                onChange(!checked);
            }}
        >
            <span />
        </button>
    );
}

export default ChannelsPage;
