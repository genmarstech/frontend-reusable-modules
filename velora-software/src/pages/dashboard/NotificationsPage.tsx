import { useEffect, useState } from "react";

import { getNotifications, retryNotification } from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { CHANNEL_LABELS, formatDateTime } from "../../lib/format";
import type { NotificationLog } from "../../types/bookings";
import { Alert, EmptyState, Field, Modal, PageHeader, Section, Spinner, StatusBadge } from "../../components/ui";
import { useDashboard } from "./dashboard-context";
import { MessagesArt } from "../../components/Illustrations";

function NotificationsPage() {
    const { business, timeZone } = useDashboard();
    const [status, setStatus] = useState("");
    const [channel, setChannel] = useState("");
    const [items, setItems] = useState<NotificationLog[] | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState<NotificationLog | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        getNotifications(business.id, { status, channel })
            .then((rows) => active && setItems(rows))
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [business.id, status, channel, reload]);

    const retry = async (n: NotificationLog) => {
        try {
            await retryNotification(n.id);
            setReload((x) => x + 1);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    const counts = (items || []).reduce<Record<string, number>>((acc, n) => ({ ...acc, [n.status]: (acc[n.status] || 0) + 1 }), {});

    return (
        <div className="dashboard-overview">
            <PageHeader title="Notifications" text="Every confirmation, reminder and alert, with its delivery status." />
            <Alert kind="info">
                Telegram and WhatsApp messages go to customers who chat with the Velora bots (turn them on under Channels).
                SMS is not connected yet, so SMS messages are only logged here.
            </Alert>
            <div className="v-filters">
                <Field label="Status">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All</option>
                        <option value="queued">Scheduled</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </Field>
                <Field label="Channel">
                    <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <option value="">All</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                        <option value="push">Push</option>
                    </select>
                </Field>
            </div>
            <Alert>{error}</Alert>
            <Section
                title="Delivery log"
                text={Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(" · ") || undefined}
                badge={items ? `${items.length} messages` : undefined}
            >
                {items === null ? (
                    <Spinner />
                ) : items.length === 0 ? (
                    <EmptyState art={<MessagesArt />} title="No messages yet" text="Messages appear here when bookings are made or changed." />
                ) : (
                    <div className="v-table-wrap">
                        <table className="v-table v-table-stack">
                            <thead>
                                <tr><th>Message</th><th>To</th><th>Channel</th><th>When</th><th>Status</th><th /></tr>
                            </thead>
                            <tbody>
                                {items.map((n) => (
                                    <tr key={n.id} className="v-clickable" onClick={() => setOpen(n)}>
                                        <td data-label="Message">
                                            {n.event_label}
                                            <small>{n.recipient_type === "customer" ? "Customer" : n.recipient_type === "staff" ? "Staff" : "Business"}</small>
                                        </td>
                                        <td data-label="To">
                                            {n.recipient_name || "—"}
                                            <small>{n.to_address}</small>
                                        </td>
                                        <td data-label="Channel">{CHANNEL_LABELS[n.channel]}</td>
                                        <td data-label="When">
                                            {formatDateTime(n.status === "queued" ? n.scheduled_for : n.sent_at || n.created_at, timeZone)}
                                            {n.attempts > 1 && <small>{n.attempts} attempts</small>}
                                        </td>
                                        <td data-label="Status"><StatusBadge status={n.status} /></td>
                                        <td data-label="" className="v-num">
                                            {n.status === "failed" && (
                                                <button className="v-link" onClick={(e) => { e.stopPropagation(); retry(n); }}>Retry</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
            {open && (
                <Modal title={open.subject || open.event_label} subtitle={`${CHANNEL_LABELS[open.channel]} to ${open.to_address}`} onClose={() => setOpen(null)}>
                    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{open.body}</pre>
                    {open.error && <Alert>{open.error}</Alert>}
                </Modal>
            )}
        </div>
    );
}

export default NotificationsPage;
