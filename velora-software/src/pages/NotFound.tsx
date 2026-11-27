import { Link } from "react-router";
import "../styles/dashboard.css";

function NotFound() {
    return (
        <div className="app-loading">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, margin: 0, color: "#26332c" }}>
                Page not found
            </h1>
            <p>This page does not exist yet.</p>
            <Link to="/" className="v-btn">Back to Velora</Link>
        </div>
    );
}

export default NotFound;
