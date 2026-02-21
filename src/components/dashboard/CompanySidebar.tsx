'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecruiterBasePath } from '@/components/RecruiterBasePathContext';
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

export default function CompanySidebar() {
    const pathname = usePathname();
    const base = useRecruiterBasePath();
    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: base },
        { label: 'Create Job', icon: PlusCircle, href: `${base}/create-job` },
        { label: 'Jobs', icon: Briefcase, href: `${base}/jobs` },
        { label: 'Candidates', icon: Users, href: `${base}/candidates` },
        { label: 'Interviews', icon: Video, href: `${base}/interviews` },
        { label: 'Analytics', icon: BarChart, href: `${base}/analytics` },
        { label: 'Settings', icon: Settings, href: `${base}/settings` },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar company-sidebar">
                <div className="sidebar-header">
                    <Link href={base} className="brand">
                        <span className="brand-icon company">HU</span>
                        HireU <span style={{ fontSize: '12px', marginLeft: '4px', color: '#9ca3af', fontWeight: '500' }}>Corporations</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== base && pathname.startsWith(item.href));
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
                    <button type="button" className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Adapted for Company */}
            <nav className="mobile-bottom-nav">
                {menuItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href || (item.href !== base && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span style={{ fontSize: '10px' }}>{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    type="button"
                    className="mobile-nav-item"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut size={20} />
                    <span style={{ fontSize: '10px' }}>Logout</span>
                </button>
            </nav>
        </>
    );
}
