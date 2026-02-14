import Link from 'next/link';
import { Plus, Briefcase, Users, Clock, ChevronRight, Activity, Zap } from 'lucide-react';

export default function CompanyDashboardPage() {
    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Company Dashboard</h1>
                    <p className="page-subtitle">Overview of your hiring pipeline and activity.</p>
                </div>
                <Link
                    href="/dashboard/company/create-job"
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Post a New Job
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Active Jobs Card */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon blue">
                            <Briefcase size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Active Jobs</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="/dashboard/company/jobs" className="stat-link">
                            View all jobs <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Candidates Card */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon purple">
                            <Users size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">12</span>
                        <span className="stat-label">Total Candidates</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="/dashboard/company/candidates" className="stat-link">
                            View applications <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Interviews Card */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon orange">
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">5</span>
                        <span className="stat-label">Upcoming Interviews</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="#" className="stat-link">
                            View schedule <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                {/* Recent Activity Feed */}
                <div className="activity-section">
                    <div className="activity-header">
                        <h3 className="section-heading-text">Recent Activity</h3>
                        <button className="view-all-btn">View All</button>
                    </div>

                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Users size={18} />
                            </div>
                            <div className="activity-content">
                                <p><strong>John Doe</strong> applied for <strong>Senior React Developer</strong></p>
                                <span className="activity-time">2 hours ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Briefcase size={18} />
                            </div>
                            <div className="activity-content">
                                <p>New job posted: <strong>Product Designer</strong></p>
                                <span className="activity-time">5 hours ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Users size={18} />
                            </div>
                            <div className="activity-content">
                                <p><strong>Sarah Smith</strong> applied for <strong>Backend Engineer</strong></p>
                                <span className="activity-time">1 day ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Activity size={18} />
                            </div>
                            <div className="activity-content">
                                <p>Your company profile was updated</p>
                                <span className="activity-time">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="dashboard-sidebar-col">
                    {/* Promo Widget */}
                    <div className="sidebar-widget promo-widget">
                        <h3 className="promo-title">Boost your reach</h3>
                        <p className="promo-desc">Post your job to featured listings to get 3x more applicants.</p>
                        <button className="promo-btn">
                            Promote Job
                        </button>
                    </div>

                    {/* Pending Tasks */}
                    <div className="sidebar-widget">
                        <h3 className="widget-header">Pending Tasks</h3>
                        <div className="task-list">
                            <div className="task-item">
                                <div className="task-icon orange"></div>
                                <span>Review 5 new applications for <strong>React Dev</strong></span>
                            </div>
                            <div className="task-item">
                                <div className="task-icon gray"></div>
                                <span>Complete company profile setup</span>
                            </div>
                            <div className="task-item">
                                <div className="task-icon gray"></div>
                                <span>Schedule interview with <strong>Mike Ross</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
