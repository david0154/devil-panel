import { useState } from 'react';
import { useRouter } from 'next/router';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'bn', label: 'বা' },
  { code: 'ta', label: 'தமி' },
  { code: 'te', label: 'తెలు' },
];

export default function Topbar({ title, onMenuClick }) {
  const [lang, setLang] = useState('en');
  const [notifs] = useState(3);
  const router = useRouter();

  const segments = router.pathname.split('/').filter(Boolean);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}>&#9776;</button>
        <nav className="breadcrumb">
          <span className="breadcrumb-item">Devil Panel</span>
          {segments.map((seg, i) => (
            <span key={i}>
              <span className="breadcrumb-sep"> / </span>
              <span className={`breadcrumb-item${i === segments.length - 1 ? ' active' : ''}`}>
                {seg.charAt(0).toUpperCase() + seg.slice(1)}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <div className="server-health">
          <span className="health-dot" />
          All Systems Online
        </div>

        <button className="notif-btn" title="Notifications">
          🔔
          {notifs > 0 && <span className="notif-badge">{notifs}</span>}
        </button>

        <select
          className="lang-selector"
          value={lang}
          onChange={e => setLang(e.target.value)}
          title="Language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
