import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Users, Scissors } from "lucide-react";

import {
    getBusinessStaff,
    getServices,
} from "../lib/api/auth";

import type { Staff } from "../types/staff";
import type { Service } from "../types/services";
import './DashboardOverview.css'

function DashboardOverview() {
    const { businessId } = useParams<{ businessId: string }>();

    const [staff, setStaff] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!businessId || !Number.isInteger(Number(businessId)) || Number(businessId) <= 0) {
            setError("Invalid business ID.");
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const id = Number(businessId);

                const [staffData, servicesData] = await Promise.all([
                    getBusinessStaff(id),
                    getServices(id),
                ]);

                setStaff(staffData);
                setServices(servicesData);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Unable to load your business information.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [businessId]);

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard-overview">

            <header className="dashboard-overview-header">
                <div>
                    <h1>Business Overview</h1>
                    <p>Manage and monitor your business activities.</p>
                </div>
            </header>

            {/* Overview statistics */}
            <section className="overview-stats">

                <div className="overview-stat-card">
                    <div className="overview-stat-icon">
                        <Scissors />
                    </div>

                    <div>
                        <p>Total Services</p>
                        <h2>{services.length}</h2>
                    </div>
                </div>

                <div className="overview-stat-card">
                    <div className="overview-stat-icon">
                        <Users />
                    </div>

                    <div>
                        <p>Total Staff</p>
                        <h2>{staff.length}</h2>
                    </div>
                </div>

            </section>

            {/* Services */}
            <section className="overview-section">

                <div className="overview-section-heading">
                    <div>
                        <h2>Our Services</h2>
                        <p>Services offered by your business.</p>
                    </div>

                    <span>{services.length} services</span>
                </div>

                {services.length === 0 ? (
                    <div className="overview-empty-state">
                        <Scissors size={30} />
                        <h3>No services added yet</h3>
                        <p>Add services to let customers know what you offer.</p>
                    </div>
                ) : (
                    <div className="services-list">
                        {services.map((service) => (
                            <div className="service-card" key={service.id}>
                                <div className="service-icon">
                                    <Scissors size={20} />
                                </div>

                                <div className="service-details">
                                    <h3>{service.service_name}</h3>
                                    <p>{service.service_description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </section>

            {/* Staff */}
            <section className="overview-section">

                <div className="overview-section-heading">
                    <div>
                        <h2>Your Team</h2>
                        <p>Staff members registered under this business.</p>
                    </div>

                    <span>{staff.length} members</span>
                </div>

                {staff.length === 0 ? (
                    <div className="overview-empty-state">
                        <Users size={30} />
                        <h3>No staff members yet</h3>
                        <p>Add staff members to start building your team.</p>
                    </div>
                ) : (
                    <div className="staff-list">
                        {staff.map((member) => (
                            <div className="staff-card" key={member.id}>

                                <div className="staff-avatar">
                                    {member.staff_name.charAt(0).toUpperCase()}
                                </div>

                                <div className="staff-details">
                                    <h3>{member.staff_name}</h3>
                                    <p>{member.staff_email}</p>
                                </div>

                                <span
                                    className={
                                        member.is_available
                                            ? "staff-status available"
                                            : "staff-status unavailable"
                                    }
                                >
                                    {member.is_available
                                        ? "Available"
                                        : "Unavailable"}
                                </span>

                            </div>
                        ))}
                    </div>
                )}

            </section>

        </div>
    );
}

export default DashboardOverview;