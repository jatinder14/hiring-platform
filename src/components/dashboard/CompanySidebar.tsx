'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    Briefcase,
    Users,
    Video,
    BarChart,
    Settings,
    LogOut
} from 'lucide-react';
import { SignOutButton } from "@clerk/nextjs";

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/company' },
    { label: 'Create Job', icon: PlusCircle, href: '/dashboard/company/create-job' },
    { label: 'Jobs', icon: Briefcase, href: '/dashboard/company/jobs' },
    { label: 'Candidates', icon: Users, href: '/dashboard/company/candidates' },
    { label: 'Interviews', icon: Video, href: '/dashboard/company/interviews' },
    { label: 'Analytics', icon: BarChart, href: '/dashboard/company/analytics' },
    { label: 'Settings', icon: Settings, href: '/dashboard/company/settings' },
];

export default function CompanySidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar company-sidebar">
                <div className="sidebar-header">
                    <Link href="/dashboard/company" className="brand">
                        <span className="brand-icon company">HU</span>
                        HireU <span style={{ fontSize: '12px', marginLeft: '4px', color: '#9ca3af', fontWeight: '500' }}>Corporations</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        // Check if current path starts with the href
                        // Except for dashboard root, which should match exactly or loosely depending on subroutes?
                        // Actually, /dashboard/company should handle subroutes nicely if href structure is consistent.
                        // For 'Dashboard', we might want explicit match or specific handling.
                        // Standard startWith is usually fine.
                        const isActive = pathname === item.href || (item.href !== '/dashboard/company' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={20} className="nav-icon" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <SignOutButton>
                        <button className="logout-btn">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </SignOutButton>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Adapted for Company */}
            <nav className="mobile-bottom-nav">
                {/* Show fewer items on mobile or scrollable? Let's show key items */}
                {menuItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard/company' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon />
                            <span style={{ fontSize: '10px' }}>{item.label}</span>
                        </Link>
                    );
                })}

                <SignOutButton>
                    <button className="mobile-nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut />
                        <span>Logout</span>
                    </button>
                </SignOutButton>
            </nav>
        </>
    );
}
