'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Users, Clock, FileText, Zap, Loader2 } from 'lucide-react';

export default function CompanyDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalCandidates: 0,
        totalApplications: 0,
        interviews: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Jobs
                const jobsRes = await fetch('/api/company/jobs');
                const jobsData = await jobsRes.json();
                const activeJobs = Array.isArray(jobsData) ? jobsData.filter((j: any) => j.status === 'ACTIVE').length : 0;

                // Fetch Applications
                const appsRes = await fetch('/api/company/applications');
                const appsData = await appsRes.json();
                const totalApps = Array.isArray(appsData) ? appsData.length : 0;

                // For this demo, assume unique candidates = total applications (simplified)
                // or distinctive candidateIds count
                const uniqueCandidates = Array.isArray(appsData) ? new Set(appsData.map((a: any) => a.candidateId)).size : 0;

                // Count interviews (status = 'Interview' or 'INTERVIEW')
                const interviewCount = Array.isArray(appsData) ? appsData.filter((a: any) => ['Interview', 'INTERVIEW'].includes(a.status)).length : 0;

                setStats({
                    activeJobs,
                    totalCandidates: uniqueCandidates,
                    totalApplications: totalApps,
                    interviews: interviewCount
                });

                // Recent Activity from Applications
                if (Array.isArray(appsData)) {
                    const sortedApps = [...appsData].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 5);
                    const activity = sortedApps.map((app: any) => ({
                        id: app.id,
                        type: 'APPLICATION',
                        user: app.candidate?.name || 'A candidate',
                        role: app.job?.title || 'a job',
                        time: new Date(app.appliedAt).toLocaleDateString()
                    }));
                    setRecentActivity(activity);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

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

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Active Jobs */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon blue">
                            <Briefcase size={22} />
                        </div>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeJobs}</span>
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
                        <span className="stat-value">{stats.totalCandidates}</span>
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
                        <span className="stat-value">{stats.totalApplications}</span>
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
                        <span className="stat-value">{stats.interviews}</span>
                        <span className="stat-label">Interviews</span>
                    </div>
                    <div className="stat-footer">
                        <Link href="/dashboard/company/candidates" className="stat-link">
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
                    </div>

                    <div className="activity-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item) => (
                                <div key={item.id} className="activity-item">
                                    <div className="activity-avatar">
                                        <Users size={20} />
                                    </div>
                                    <div className="activity-content">
                                        <p><strong>{item.user}</strong> applied for <strong>{item.role}</strong></p>
                                        <span className="activity-time">{item.time}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Widgets - cleaned up */}
                <div className="dashboard-sidebar-col">
                    {/* Promo Widget */}
                    <div className="sidebar-widget promo-widget">
                        <h3 className="promo-title">Boost your reach</h3>
                        <p className="promo-desc">Get 3x more applicants by promoting your open roles to featured listings.</p>
                        <button className="promo-btn">
                            Promote a Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
