"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LoginModal } from "@/components/LoginModal";
import { UserDropdown } from "@/components/UserDropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

const navLinks = [
  { href: "#story", label: "Success Stories" },
  { href: "#domains", label: "Blogs" }, // Placeholder: pointing to Domains section for now
  { href: "#pricing", label: "Pricing" }, // Placeholder
  { href: "#hireu", label: "Contact" }, // Pointing to HireU (footer/CTA)
];

export function HeroNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate" | null>(null);

  const userRole = session?.user?.role;

  const handleLoginClick = async (role: "recruiter" | "candidate") => {
    // If authenticated, redirect to dashboard
    if (status === "authenticated") {
      if (role === "candidate") {
        router.push("/dashboard/jobs");
      } else {
        router.push("/dashboard/company");
      }
      return;
    }

    // Set cookie to remember role (valid for 1 hour for login process)
    document.cookie = `login_role=${role}; path=/; max-age=3600; Secure; SameSite=Strict`;

    // Force sign out to ensure fresh session with new role
    await signOut({ redirect: false });

    // Update state and open modal
    setSelectedRole(role);
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    // Optional: clear role or keep it? Keeping it is fine.
    setTimeout(() => setSelectedRole(null), 300); // Clear after animation
  };

  return (
    <>
      <header className="hero-nav" id="heroNav" role="banner">
        <div className="hero-nav-inner">
          <a className="hn-brand" href="#hero" aria-label="Home">
            <span className="hn-logo" />
          </a>

          <nav className="hn-links">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hn-actions">
            {status !== "authenticated" && (
              <>
                <button onClick={() => handleLoginClick("recruiter")} className="hn-btn ghost">
                  Hire a Talent
                </button>
                <button onClick={() => handleLoginClick("candidate")} className="hn-btn">
                  Find a Job
                </button>
              </>
            )}

            {status === "authenticated" && (
              <>
                {(!userRole || userRole === 'recruiter') && (
                  <button onClick={() => handleLoginClick("recruiter")} className="hn-btn ghost">
                    Hire a Talent
                  </button>
                )}
                {(!userRole || userRole === 'candidate') && (
                  <button onClick={() => handleLoginClick("candidate")} className="hn-btn">
                    Find a Job
                  </button>
                )}
                <UserDropdown />
              </>
            )}
          </div>

          <button
            className="hn-burger"
            id="hnBurger"
            aria-label="Menu"
            aria-expanded={drawerOpen}
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`hn-drawer ${drawerOpen ? "open" : ""}`} id="hnDrawer">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setDrawerOpen(false)}>
              {link.label}
            </a>
          ))}

          {/* Mobile Auth Actions */}
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard/profile" className="hn-drawer-link" onClick={() => setDrawerOpen(false)}>
                <User size={16} style={{ display: 'inline', marginRight: '8px' }} /> Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hn-drawer-link"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <LogOut size={16} style={{ display: 'inline', marginRight: '8px' }} /> Logout
              </button>
              <div className="hn-drawer-actions">
                {(!userRole || userRole === 'recruiter') && (
                  <button
                    onClick={() => {
                      handleLoginClick("recruiter");
                      setDrawerOpen(false);
                    }}
                    className="hn-btn ghost"
                  >
                    Hire a Talent
                  </button>
                )}
                {(!userRole || userRole === 'candidate') && (
                  <button
                    onClick={() => {
                      handleLoginClick("candidate");
                      setDrawerOpen(false);
                    }}
                    className="hn-btn"
                  >
                    Find a Job
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="hn-drawer-actions">
              <button
                onClick={() => {
                  handleLoginClick("recruiter");
                  setDrawerOpen(false);
                }}
                className="hn-btn ghost"
              >
                Hire a Talent
              </button>
              <button
                onClick={() => {
                  handleLoginClick("candidate");
                  setDrawerOpen(false);
                }}
                className="hn-btn"
              >
                Find a Job
              </button>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        role={selectedRole}
      />
    </>
  );
}
