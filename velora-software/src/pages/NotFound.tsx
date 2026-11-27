import { Link, useNavigate } from "react-router";
import StatusPage from "../components/StatusPage";
import { LostArt } from "../components/Illustrations";
import { usePageMeta } from "../lib/usePageMeta";

function NotFound() {
    usePageMeta("Page not found");
    const navigate = useNavigate();
    const canGoBack = typeof window !== "undefined" && window.history.length > 1;

    return (
        <StatusPage
            art={<LostArt />}
            code="404"
            title="We couldn’t find that page"
            text="The link may be old or mistyped. If you were booking an appointment, ask the business for their latest booking link."
        >
            <Link to="/" className="v-btn">
                Back to Velora
            </Link>
            {canGoBack && (
                <button type="button" className="v-btn v-btn-ghost" onClick={() => navigate(-1)}>
                    Go back
                </button>
            )}
        </StatusPage>
    );
}

export default NotFound;
