import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { Download } from "lucide-react";

/** A QR code for a link, with a download button (for posters, mirrors and the till). */
export function QrCode({ value, fileName, label }: { value: string; fileName: string; label: string }) {
    const src = useMemo(() => {
        const qr = qrcode(0, "M");
        qr.addData(value);
        qr.make();
        return qr.createDataURL(8, 2);
    }, [value]);

    return (
        <div className="v-qr">
            <img src={src} alt={label} width={132} height={132} />
            <div>
                <strong>{label}</strong>
                <small>Print it for your front desk or mirror. Scanning it opens the chat, ready to book.</small>
                <a className="v-btn v-btn-small v-qr-download" href={src} download={fileName}>
                    <Download size={14} /> Download QR code
                </a>
            </div>
        </div>
    );
}
