"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

export function UserMenu({
  session,
  variant = "dropdown",
}: {
  session: Session | null;
  variant?: "dropdown" | "drawer";
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Delay so the click that opened the menu doesn't immediately trigger close
    const id = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  if (!session?.user) return null;

  const fullName = session.user.name ?? "User";
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;
  const image = session.user.image;

  if (variant === "drawer") {
    return (
      <div className="user-menu-drawer">
        <Link href="/profile" className="user-menu-item">
          Profile
        </Link>
        <button
          type="button"
          className="user-menu-item user-menu-item-logout"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="user-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {image ? (
          <img src={image} alt="" className="user-menu-avatar" />
        ) : (
          <span className="user-menu-avatar-placeholder">
            {firstName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="user-menu-name">{firstName}</span>
        <span className="user-menu-chevron" aria-hidden>▼</span>
      </button>
      {open && (
        <div
          className="user-menu-dropdown"
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          <Link
            href="/profile"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            className="user-menu-item user-menu-item-logout"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
