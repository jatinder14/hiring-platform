import Link from 'next/link';
import { Plus, Briefcase, Users, Clock, ChevronRight, Activity, Zap, FileText } from 'lucide-react';

export default function CompanyDashboardPage() {
    return (
        <div className="dashboard-page-content">
            {/* Header Section */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Company Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <Link
                    href="/dashboard/company/create-job"
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Post a New Job
                </Link>
            </header>

            {/* Stats Grid - 4 Columns */}
            <div className="stats-grid">
                {/* Active Jobs */}
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
                            View Jobs
                        </Link>
                    </div>
                </div>

                {/* Total Candidates */}
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
                            View Talent
                        </Link>
                    </div>
                </div>

                {/* Total Applications */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon blue">
                            <FileText size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">48</span>
                        <span className="stat-label">Applications</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="/dashboard/company/candidates" className="stat-link">
                            Review All
                        </Link>
                    </div>
                </div>

                {/* Interviews */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon orange">
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">5</span>
                        <span className="stat-label">Interviews</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="#" className="stat-link">
                            View Schedule
                        </Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                {/* Recent Activity Feed */}
                <div className="activity-section">
                    <div className="activity-header">
                        <h3 className="section-heading-text">Recent Activity</h3>
                        <Link href="#" className="stat-link">View All</Link>
                    </div>

                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Users size={20} />
                            </div>
                            <div className="activity-content">
                                <p><strong>John Doe</strong> applied for <strong>Senior React Developer</strong></p>
                                <span className="activity-time">2 hours ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Briefcase size={20} />
                            </div>
                            <div className="activity-content">
                                <p>You posted a new job: <strong>Product Designer</strong></p>
                                <span className="activity-time">5 hours ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Users size={20} />
                            </div>
                            <div className="activity-content">
                                <p><strong>Sarah Smith</strong> was moved to <strong>Interview</strong> for Backend Engineer</p>
                                <span className="activity-time">1 day ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-avatar">
                                <Zap size={20} />
                            </div>
                            <div className="activity-content">
                                <p>Your company profile was successfully verified</p>
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
                        <p className="promo-desc">Get 3x more applicants by promoting your open roles to featured listings.</p>
                        <button className="promo-btn">
                            Promote a Job
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
