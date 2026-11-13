
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { Business } from "../types/business";
import { getMyBusiness } from "../lib/api/auth";
import "./BusinessSelection.css";

function BusinessSelection() {
    const navigate = useNavigate();

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchBusinesses = async (): Promise<void> => {
            try {
                const data = await getMyBusiness();

                const results: Business[] = Array.isArray(data)
                    ? data
                    : data.results || [];

                setBusinesses(results);

                // Automatically send users with no businesses to onboarding.
                if (results.length === 0) {
                    navigate("/onboarding/business", { replace: true });
                }
            } catch (err: unknown) {
                console.error("Failed to fetch businesses:", err);
                setError("Unable to load your businesses.");
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [navigate]);

    const selectBusiness = (business: Business): void => {
        navigate(`/dashboard/${business.id}/overview`);
    };

    const createNewBusiness = (): void => {
        navigate("/onboarding/business");
    };

    if (loading) {
        return (
            <div className="business-selection-loading">
                <p>Loading your businesses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="business-selection-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Try again
                </button>
            </div>
        );
    }

    return (
        <main className="business-selection">
            <header className="business-selection-header">
                <div>
                    <span className="business-selection-eyebrow">
                        VELORA WORKSPACE
                    </span>

                    <h1>
                        Select a <span>business.</span>
                    </h1>

                    <p>
                        Choose the business workspace you want to manage.
                    </p>
                </div>

                {businesses.length > 0 && (
                    <button
                        type="button"
                        className="create-business-button"
                        onClick={createNewBusiness}
                    >
                        <span>+</span>
                        Create New Business
                    </button>
                )}
            </header>

            <div className="business-grid">
                {businesses.map((business) => (
                    <button
                        key={business.id}
                        type="button"
                        className="business-card"
                        onClick={() => selectBusiness(business)}
                    >
                        {business.business_logo ? (
                            <img
                                src={business.business_logo}
                                alt={`${business.business_name} logo`}
                            />
                        ) : (
                            <div className="business-logo-placeholder">
                                {business.business_name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}

                        <h3>{business.business_name}</h3>

                        <p>{business.business_category}</p>

                        <span>Open dashboard →</span>
                    </button>
                ))}
            </div>
        </main>
    );
}

export default BusinessSelection;
