"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStoredProfile,
  saveProfile,
  type UserProfile,
  type ProfileLink,
  type ExperienceItem,
  type EducationItem,
} from "@/lib/profile-store";

function EditableField({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const handleSave = () => {
    onSave(draft.trim());
    setEditing(false);
  };
  return (
    <div className="profile-field">
      <div className="profile-field-head">
        <span className="profile-field-label">{label}</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={handleSave}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(value); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        multiline ? (
          <textarea className="profile-input" value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
        ) : (
          <input type="text" className="profile-input" value={draft} onChange={(e) => setDraft(e.target.value)} />
        )
      ) : (
        <p className="profile-field-value">{value || "—"}</p>
      )}
    </div>
  );
}

function ResumeSection({ resumeUrl, onSave }: { resumeUrl: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resumeUrl);
  useEffect(() => { setDraft(resumeUrl); }, [resumeUrl]);
  const handleSave = () => { onSave(draft.trim()); setEditing(false); };
  return (
    <section className="profile-section profile-resume">
      <div className="profile-field-head">
        <span className="profile-section-title">Resume</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={handleSave}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(resumeUrl); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        <input
          type="url"
          className="profile-input"
          placeholder="Paste resume link (e.g. Google Drive, Dropbox)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : resumeUrl ? (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="profile-resume-link">
          View resume →
        </a>
      ) : (
        <p className="profile-field-value">— Add a link to your resume</p>
      )}
    </section>
  );
}

function LinksSection({ links, onChange }: { links: ProfileLink[]; onChange: (links: ProfileLink[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(links);
  useEffect(() => { setDraft([...links]); }, [links]);
  const add = () => setDraft([...draft, { label: "", url: "" }]);
  const update = (i: number, f: Partial<ProfileLink>) => {
    const next = [...draft];
    next[i] = { ...next[i], ...f };
    setDraft(next);
  };
  const remove = (i: number) => setDraft(draft.filter((_, j) => j !== i));
  const save = () => { onChange(draft.filter((l) => l.label.trim() || l.url.trim())); setEditing(false); };
  return (
    <section className="profile-section">
      <div className="profile-field-head">
        <span className="profile-section-title">Other links</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={save}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft([...links]); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        <div className="profile-list-edit">
          {draft.map((link, i) => (
            <div key={i} className="profile-list-row">
              <input placeholder="Label" value={link.label} onChange={(e) => update(i, { label: e.target.value })} className="profile-input small" />
              <input placeholder="URL" type="url" value={link.url} onChange={(e) => update(i, { url: e.target.value })} className="profile-input small" />
              <button type="button" className="profile-remove-btn" onClick={() => remove(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="profile-add-btn" onClick={add}>+ Add link</button>
        </div>
      ) : (
        <ul className="profile-list">
          {links.length ? links.map((l, i) => (
            <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label || l.url}</a></li>
          )) : <p className="profile-field-value">—</p>}
        </ul>
      )}
    </section>
  );
}

function ExperienceSection({ items, onChange }: { items: ExperienceItem[]; onChange: (v: ExperienceItem[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items);
  useEffect(() => { setDraft(items.map((i) => ({ ...i }))); }, [items]);
  const add = () => setDraft([...draft, { company: "", role: "", period: "", description: "" }]);
  const update = (i: number, f: Partial<ExperienceItem>) => {
    const next = [...draft];
    next[i] = { ...next[i], ...f };
    setDraft(next);
  };
  const remove = (i: number) => setDraft(draft.filter((_, j) => j !== i));
  const save = () => { onChange(draft); setEditing(false); };
  return (
    <section className="profile-section">
      <div className="profile-field-head">
        <span className="profile-section-title">Experience</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={save}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(items.map((i) => ({ ...i }))); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        <div className="profile-list-edit">
          {draft.map((item, i) => (
            <div key={i} className="profile-exp-block">
              <input placeholder="Company" value={item.company} onChange={(e) => update(i, { company: e.target.value })} className="profile-input" />
              <input placeholder="Role" value={item.role} onChange={(e) => update(i, { role: e.target.value })} className="profile-input" />
              <input placeholder="Period (e.g. 2020 – 2023)" value={item.period} onChange={(e) => update(i, { period: e.target.value })} className="profile-input" />
              <textarea placeholder="Description" value={item.description} onChange={(e) => update(i, { description: e.target.value })} className="profile-input" rows={2} />
              <button type="button" className="profile-remove-btn" onClick={() => remove(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="profile-add-btn" onClick={add}>+ Add experience</button>
        </div>
      ) : (
        <ul className="profile-exp-list">
          {draft.length ? draft.map((e, i) => (
            <li key={i}>
              <strong>{e.role}</strong> at {e.company} {e.period && `(${e.period})`}
              {e.description && <p>{e.description}</p>}
            </li>
          )) : <p className="profile-field-value">—</p>}
        </ul>
      )}
    </section>
  );
}

function SkillsSection({ skills, onChange }: { skills: string[]; onChange: (v: string[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(skills.join(", "));
  useEffect(() => { setDraft(skills.join(", ")); }, [skills]);
  const save = () => { onChange(draft.split(",").map((s) => s.trim()).filter(Boolean)); setEditing(false); };
  return (
    <section className="profile-section">
      <div className="profile-field-head">
        <span className="profile-section-title">Skills</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={save}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(skills.join(", ")); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        <input className="profile-input" placeholder="e.g. React, Node.js, Python" value={draft} onChange={(e) => setDraft(e.target.value)} />
      ) : (
        <p className="profile-field-value">{skills.length ? skills.join(", ") : "—"}</p>
      )}
    </section>
  );
}

function EducationSection({ items, onChange }: { items: EducationItem[]; onChange: (v: EducationItem[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items);
  useEffect(() => { setDraft(items.map((i) => ({ ...i }))); }, [items]);
  const add = () => setDraft([...draft, { school: "", degree: "", period: "" }]);
  const update = (i: number, f: Partial<EducationItem>) => {
    const next = [...draft];
    next[i] = { ...next[i], ...f };
    setDraft(next);
  };
  const remove = (i: number) => setDraft(draft.filter((_, j) => j !== i));
  const save = () => { onChange(draft); setEditing(false); };
  return (
    <section className="profile-section">
      <div className="profile-field-head">
        <span className="profile-section-title">Education</span>
        {!editing ? (
          <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <>
            <button type="button" className="profile-edit-btn primary" onClick={save}>Save</button>
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(items.map((i) => ({ ...i }))); setEditing(false); }}>Cancel</button>
          </>
        )}
      </div>
      {editing ? (
        <div className="profile-list-edit">
          {draft.map((item, i) => (
            <div key={i} className="profile-exp-block">
              <input placeholder="School" value={item.school} onChange={(e) => update(i, { school: e.target.value })} className="profile-input" />
              <input placeholder="Degree" value={item.degree} onChange={(e) => update(i, { degree: e.target.value })} className="profile-input" />
              <input placeholder="Period" value={item.period} onChange={(e) => update(i, { period: e.target.value })} className="profile-input" />
              <button type="button" className="profile-remove-btn" onClick={() => remove(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="profile-add-btn" onClick={add}>+ Add education</button>
        </div>
      ) : (
        <ul className="profile-exp-list">
          {draft.length ? draft.map((e, i) => (
            <li key={i}><strong>{e.degree}</strong> — {e.school} {e.period && `(${e.period})`}</li>
          )) : <p className="profile-field-value">—</p>}
        </ul>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/profile");
      return;
    }
    if (status === "authenticated" && session?.user) {
      const userId =
        (session.user as { id?: string }).id ??
        session.user.email ??
        session.user.name ??
        "anonymous";
      setProfile(getStoredProfile(userId));
    }
  }, [status, session, router]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    if (!session?.user) return;
    const userId =
      (session.user as { id?: string }).id ??
      session.user.email ??
      session.user.name ??
      "anonymous";
    const next = { ...getStoredProfile(userId), ...patch };
    saveProfile(userId, next);
    setProfile(next);
  };

  if (status === "loading" || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-card"><p className="profile-field-value">Loading...</p></div>
      </div>
    );
  }

  const userId =
    (session!.user as { id?: string }).id ??
    session!.user!.email ??
    session!.user!.name ??
    "anonymous";
  const merged = {
    ...profile,
    username: profile.username || (session!.user!.name ?? ""),
    email: profile.email || (session!.user!.email ?? ""),
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <Link href="/" className="profile-back">← Back to home</Link>
          <h1 className="profile-title">My Profile</h1>
        </div>

        <ResumeSection resumeUrl={profile.resumeUrl} onSave={(v) => updateProfile({ resumeUrl: v })} />

        <section className="profile-section">
          <span className="profile-section-title">Basic info</span>
          <EditableField label="Username" value={merged.username} onSave={(v) => updateProfile({ username: v })} />
          <EditableField label="Email" value={merged.email} onSave={(v) => updateProfile({ email: v })} />
          <EditableField label="Phone" value={profile.phone} onSave={(v) => updateProfile({ phone: v })} />
        </section>

        <section className="profile-section">
          <span className="profile-section-title">Links</span>
          <EditableField label="GitHub" value={profile.githubUrl} onSave={(v) => updateProfile({ githubUrl: v })} />
          <EditableField label="LinkedIn" value={profile.linkedinUrl} onSave={(v) => updateProfile({ linkedinUrl: v })} />
          <LinksSection links={profile.otherLinks} onChange={(v) => updateProfile({ otherLinks: v })} />
        </section>

        <ExperienceSection items={profile.experience} onChange={(v) => updateProfile({ experience: v })} />
        <SkillsSection skills={profile.skills} onChange={(v) => updateProfile({ skills: v })} />
        <EducationSection items={profile.education} onChange={(v) => updateProfile({ education: v })} />
      </div>
    </div>
  );
}
