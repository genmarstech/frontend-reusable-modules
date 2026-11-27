import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, MessageSquare, Share2 } from "lucide-react";

import { publicBookingUrl } from "../../lib/api/bookings";
import { Modal } from "../../components/ui";

export interface ShareProgress {
    value: number;
    target: number;
    reached: number;
}

/**
 * Share the booking link from the owner's own phone or computer: copy it, or
 * open WhatsApp, SMS or email with a ready message. Customers who join or book
 * through the link count towards the "share with 5 customers" setup step.
 */
export function ShareLinkModal({
    businessName,
    slug,
    progress,
    onClose,
}: {
    businessName: string;
    slug: string;
    progress?: ShareProgress;
    onClose: () => void;
}) {
    const url = publicBookingUrl(slug);
    const [message, setMessage] = useState(
        `Hi! You can now book your next appointment at ${businessName} online. Join once and rebook your favourite service in one tap: ${url}`
    );
    const [copied, setCopied] = useState<"" | "link" | "message">("");
    const text = message.includes(url) ? message : `${message} ${url}`;
    const encoded = encodeURIComponent(text);
    const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    const copy = async (what: "link" | "message") => {
        try {
            await navigator.clipboard.writeText(what === "link" ? url : text);
            setCopied(what);
            setTimeout(() => setCopied(""), 2000);
        } catch {
            window.prompt("Copy this", what === "link" ? url : text);
        }
    };

    const nativeShare = async () => {
        try {
            await navigator.share({ title: `Book at ${businessName}`, text, url });
        } catch {
            // Cancelled: nothing to do.
        }
    };

    const remaining = progress ? Math.max(0, progress.target - progress.reached) : 0;

    return (
        <Modal title="Share your booking link" subtitle="Send it to your clients so they can join and book online." onClose={onClose}>
            {progress && (
                <div className="share-progress">
                    <div className="share-progress-head">
                        <strong>
                            {progress.reached >= progress.target
                                ? `${progress.reached} customers have joined or booked through your link`
                                : `${progress.reached} of ${progress.target} customers so far`}
                        </strong>
                        <small>
                            {remaining > 0
                                ? `${remaining} more to complete your business setup.`
                                : "Setup step complete. Keep sharing to grow your bookings."}
                        </small>
                    </div>
                    <div className="ov-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.target} aria-valuenow={progress.value} aria-label="Customers reached">
                        <span style={{ width: `${(100 * progress.value) / progress.target}%` }} />
                    </div>
                </div>
            )}

            <div className="share-link">
                <input className="v-input" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Booking link" />
                <button type="button" className="v-btn v-btn-small" onClick={() => copy("link")}>
                    {copied === "link" ? <Check size={14} /> : <Copy size={14} />} {copied === "link" ? "Copied" : "Copy link"}
                </button>
            </div>

            <label className="share-message">
                <span>Message</span>
                <textarea className="v-input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>

            <div className="share-actions">
                <a className="share-action share-whatsapp" href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noreferrer">
                    <MessageCircle size={18} /> WhatsApp
                </a>
                <a className="share-action" href={`sms:?&body=${encoded}`}>
                    <MessageSquare size={18} /> SMS
                </a>
                <a className="share-action" href={`mailto:?subject=${encodeURIComponent(`Book at ${businessName}`)}&body=${encoded}`}>
                    <Mail size={18} /> Email
                </a>
                <button type="button" className="share-action" onClick={() => copy("message")}>
                    {copied === "message" ? <Check size={18} /> : <Copy size={18} />} {copied === "message" ? "Copied" : "Copy message"}
                </button>
                {canShare && (
                    <button type="button" className="share-action" onClick={nativeShare}>
                        <Share2 size={18} /> More
                    </button>
                )}
            </div>
            <p className="v-hint">Tip: put the link in your Instagram bio and WhatsApp status too.</p>
        </Modal>
    );
}
