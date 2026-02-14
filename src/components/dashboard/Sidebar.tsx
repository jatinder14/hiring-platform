'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, User, LogOut } from 'lucide-react';
import { SignOutButton } from "@clerk/nextjs";

const menuItems = [
    { label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs' },
    { label: 'Applications', icon: FileText, href: '/dashboard/applications' },
    { label: 'Profile', icon: User, href: '/dashboard/profile' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/dashboard" className="brand">
                        <span className="brand-icon">HU</span>
                        HireU
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
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

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon />
                            <span>{item.label}</span>
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
