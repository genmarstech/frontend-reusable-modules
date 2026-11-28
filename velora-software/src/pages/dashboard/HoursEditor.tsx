import { useEffect, useState } from "react";

import { createWorkingHours, deleteWorkingHours, getWorkingHours, updateWorkingHours } from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { shortTime, WEEKDAYS } from "../../lib/format";
import type { WorkingHours } from "../../types/bookings";
import { Alert, Spinner } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

type Row = Pick<WorkingHours, "weekday" | "is_closed"> & {
    id?: number;
    start_time: string;
    end_time: string;
    break_start: string;
    break_end: string;
};

function toRows(hours: WorkingHours[]): Row[] {
    return WEEKDAYS.map((_, weekday) => {
        const h = hours.find((x) => x.weekday === weekday);
        return h
            ? {
                  id: h.id,
                  weekday,
                  is_closed: h.is_closed,
                  start_time: shortTime(h.start_time),
                  end_time: shortTime(h.end_time),
                  break_start: shortTime(h.break_start),
                  break_end: shortTime(h.break_end),
              }
            : { weekday, is_closed: true, start_time: "09:00", end_time: "18:00", break_start: "", break_end: "" };
    });
}

/**
 * Weekly hours for the business (staffId null) or one staff member.
 * Outside the dashboard (onboarding), pass `businessId`.
 */
function HoursEditor({
    staffId,
    businessId,
    onSaved,
    saveLabel = "Save hours",
}: {
    staffId: number | null;
    businessId?: number;
    onSaved?: () => void;
    saveLabel?: string;
}) {
    const dashboard = useDashboard() as ReturnType<typeof useDashboard> | undefined;
    const business = { id: businessId ?? dashboard!.business.id };
    const [rows, setRows] = useState<Row[] | null>(null);
    const [custom, setCustom] = useState(staffId === null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            getWorkingHours(business.id, staffId ?? "business"),
            staffId !== null ? getWorkingHours(business.id, "business") : Promise.resolve([]),
        ])
            .then(([own, fallback]) => {
                if (!active) return;
                const hasOwn = own.length > 0;
                setCustom(staffId === null || hasOwn);
                setRows(toRows(hasOwn || staffId === null ? own : fallback).map((r) => (hasOwn || staffId === null ? r : { ...r, id: undefined })));
            })
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [business.id, staffId, reload]);

    const update = (weekday: number, patch: Partial<Row>) =>
        setRows((current) => current && current.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));

    const save = async () => {
        if (!rows) return;
        setError("");
        setMessage("");
        if (staffId === null && rows.every((r) => r.is_closed)) {
            setError("Open at least one day. Customers can only book when you are open.");
            return;
        }
        setSaving(true);
        try {
            for (const row of rows) {
                const payload = {
                    business: business.id,
                    staff: staffId,
                    weekday: row.weekday,
                    is_closed: row.is_closed,
                    start_time: row.start_time,
                    end_time: row.end_time,
                    break_start: row.break_start || null,
                    break_end: row.break_end || null,
                };
                if (row.id) await updateWorkingHours(row.id, payload);
                else await createWorkingHours(payload);
            }
            setMessage("Hours saved. Open slots now follow these hours.");
            setReload((n) => n + 1);
            onSaved?.();
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
        } finally {
            setSaving(false);
        }
    };

    const useBusinessHours = async () => {
        if (!rows) return;
        setSaving(true);
        try {
            for (const row of rows) if (row.id) await deleteWorkingHours(row.id);
            setMessage("This team member now follows the business hours.");
            setReload((n) => n + 1);
        } catch (err) {
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    if (!rows) return error ? <Alert>{error}</Alert> : <Spinner />;

    if (!custom) {
        return (
            <div className="v-action-bar" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <span className="v-muted">Follows the business opening hours.</span>
                <button className="v-btn v-btn-small v-btn-ghost" onClick={() => setCustom(true)}>
                    Set custom hours
                </button>
            </div>
        );
    }

    return (
        <div>
            <Alert>{error}</Alert>
            <Alert kind="success">{message}</Alert>
            <div className="v-hours-row v-hours-head">
                <span>Day</span>
                <span />
                <span>Opens</span>
                <span>Closes</span>
                <span>Break starts</span>
                <span>Break ends</span>
                <span />
            </div>
            {rows.map((row) => (
                <div className="v-hours-row" key={row.weekday}>
                    <strong>{WEEKDAYS[row.weekday]}</strong>
                    <label className="v-check">
                        <input type="checkbox" checked={!row.is_closed} onChange={(e) => update(row.weekday, { is_closed: !e.target.checked })} />
                        {row.is_closed ? "Closed" : "Open"}
                    </label>
                    <label className="v-hours-cell">
                        <span className="v-hours-cap" aria-hidden="true">Opens</span>
                        <input className="v-input" type="time" aria-label="Opens" disabled={row.is_closed} value={row.start_time} onChange={(e) => update(row.weekday, { start_time: e.target.value })} />
                    </label>
                    <label className="v-hours-cell">
                        <span className="v-hours-cap" aria-hidden="true">Closes</span>
                        <input className="v-input" type="time" aria-label="Closes" disabled={row.is_closed} value={row.end_time} onChange={(e) => update(row.weekday, { end_time: e.target.value })} />
                    </label>
                    <label className="v-hours-cell">
                        <span className="v-hours-cap" aria-hidden="true">Break starts</span>
                        <input className="v-input" type="time" aria-label="Break starts" title="Break starts" disabled={row.is_closed} value={row.break_start} onChange={(e) => update(row.weekday, { break_start: e.target.value })} />
                    </label>
                    <label className="v-hours-cell">
                        <span className="v-hours-cap" aria-hidden="true">Break ends</span>
                        <input className="v-input" type="time" aria-label="Break ends" title="Break ends" disabled={row.is_closed} value={row.break_end} onChange={(e) => update(row.weekday, { break_end: e.target.value })} />
                    </label>
                    <button
                        type="button"
                        className="v-link"
                        disabled={row.is_closed || (!row.break_start && !row.break_end)}
                        onClick={() => update(row.weekday, { break_start: "", break_end: "" })}
                    >
                        No break
                    </button>
                </div>
            ))}
            <div className="v-form-actions">
                {staffId !== null && (
                    <button className="v-btn v-btn-ghost" disabled={saving} onClick={useBusinessHours}>
                        Use business hours
                    </button>
                )}
                <button className="v-btn" disabled={saving} onClick={save}>
                    {saving ? "Saving..." : saveLabel}
                </button>
            </div>
        </div>
    );
}

export default HoursEditor;
