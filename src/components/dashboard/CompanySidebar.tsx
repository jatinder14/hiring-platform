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
import { signOut } from "next-auth/react";

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
                        HireU <small className="text-xs ml-1 text-gray-400">Corporations</small>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
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
                    <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Adapted for Company */}
            <nav className="mobile-bottom-nav">
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

                <button
                    className="mobile-nav-item"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut />
                    <span>Logout</span>
                </button>
            </nav>
        </>
    );
}
