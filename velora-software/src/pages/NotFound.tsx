import { Link } from "react-router";
import "../styles/dashboard.css";

function NotFound() {
    return (
        <main className="app-loading">
            <h1>Page not found</h1>
            <p>The link may be old or mistyped. Head back and try again from the start.</p>
            <Link to="/" className="v-btn">Back to Velora</Link>
        </main>
    );
}

export default NotFound;
