// Mathetes — shared UI primitives + icons
// Icons: hand-tuned line set, slight roundness, consistent stroke weight.

const Icon = ({ children, size = 22, stroke = 1.6, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={style}>
    {children}
  </svg>
);

// Custom line icon set (no Material defaults)
const Icons = {
  Home: (p) => <Icon {...p}><path d="M4 11.2l8-6.6 8 6.6"/><path d="M5.6 10v8.4a1 1 0 0 0 1 1H10v-5h4v5h3.4a1 1 0 0 0 1-1V10"/></Icon>,
  Book: (p) => <Icon {...p}><path d="M5 4.5h7.5a3 3 0 0 1 3 3v12"/><path d="M5 4.5v12"/><path d="M5 16.5h7.5a3 3 0 0 1 3 3"/><path d="M19 6v13.5"/></Icon>,
  Plan: (p) => <Icon {...p}><path d="M6 4h12v16l-6-3-6 3z"/><path d="M9.5 9h5"/><path d="M9.5 13h5"/></Icon>,
  Group: (p) => <Icon {...p}><circle cx="9" cy="9" r="3"/><path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="16.5" cy="7.5" r="2.2"/><path d="M14.7 13.6c.6-.2 1.2-.3 1.8-.3 2.5 0 4.5 2 4.5 4.7"/></Icon>,
  Profile: (p) => <Icon {...p}><circle cx="12" cy="9" r="3.6"/><path d="M5 19.6c0-3.4 3.1-6.1 7-6.1s7 2.7 7 6.1"/></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 4.5l1.4 4.6 4.6 1.4-4.6 1.4L12 16.5l-1.4-4.6L6 10.5l4.6-1.4z"/><path d="M19 4v3"/><path d="M17.5 5.5h3"/></Icon>,
  Flame: (p) => <Icon {...p}><path d="M12 3.5c1 2.5 4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1-3 1.5-4 0 1.5 1 2 1.5 2 0-2 0-4 1.5-6z"/></Icon>,
  Bookmark: (p) => <Icon {...p}><path d="M7 4.5h10a.5.5 0 0 1 .5.5v15l-5.5-3-5.5 3V5a.5.5 0 0 1 .5-.5z"/></Icon>,
  Note: (p) => <Icon {...p}><path d="M5 5.5a1 1 0 0 1 1-1h9.5L19 8v10.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M14.5 4.5V8H19"/><path d="M8 12h8"/><path d="M8 15.5h5.5"/></Icon>,
  Highlight: (p) => <Icon {...p}><path d="M5 17.5l5-5 4 4-5 5H5z"/><path d="M11 13l4-4 4 4-4 4"/><path d="M14 5.5l4.5 4.5"/></Icon>,
  Share: (p) => <Icon {...p}><path d="M12 4v11"/><path d="M8.5 7.5L12 4l3.5 3.5"/><path d="M5.5 12.5v6h13v-6"/></Icon>,
  Play: (p) => <Icon {...p}><path d="M7.5 5.5l11 6.5-11 6.5z" fill="currentColor"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></Icon>,
  Moon: (p) => <Icon {...p}><path d="M19 14.5A8 8 0 0 1 9.5 5a7 7 0 1 0 9.5 9.5z"/></Icon>,
  Sun: (p) => <Icon {...p}><circle cx="12" cy="12" r="3.5"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/><path d="M6.4 6.4l1.4 1.4"/><path d="M16.2 16.2l1.4 1.4"/><path d="M6.4 17.6l1.4-1.4"/><path d="M16.2 7.8l1.4-1.4"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="2.5"/><path d="M12 4v2.2"/><path d="M12 17.8V20"/><path d="M4 12h2.2"/><path d="M17.8 12H20"/><path d="M6.4 6.4l1.6 1.6"/><path d="M16 16l1.6 1.6"/><path d="M6.4 17.6l1.6-1.6"/><path d="M16 8l1.6-1.6"/></Icon>,
  Chevron: (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  ChevronLeft: (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>,
  Close: (p) => <Icon {...p}><path d="M6 6l12 12"/><path d="M18 6l-6 12"/><path d="M18 6L6 18"/></Icon>,
  Check: (p) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5"/></Icon>,
  Heart: (p) => <Icon {...p}><path d="M12 19s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 2.5C19 14.6 12 19 12 19z"/></Icon>,
  Pray: (p) => <Icon {...p}><path d="M9 4.5l3 5 3-5"/><path d="M7 11.5l5 4.5 5-4.5"/><path d="M5 18l7 2 7-2"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>,
  Image: (p) => <Icon {...p}><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M5 17l4-4 4 4 3-3 3 3"/></Icon>,
  Volume: (p) => <Icon {...p}><path d="M5 9.5h3l4-3.5v12l-4-3.5H5z"/><path d="M16 9c1 1 1 5 0 6"/></Icon>,
  Pause: (p) => <Icon {...p}><rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor"/></Icon>,
  Time: (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></Icon>,
  Cross: (p) => <Icon {...p}><path d="M12 4.5v15"/><path d="M8 9h8"/></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c2.5 2.5 4 5 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5-4-8s1.5-5.5 4-8z"/></Icon>,
  Quote: (p) => <Icon {...p}><path d="M7 10c-1.5 0-3 1-3 3s1.3 3 2.8 3c1 0 2.2-.6 2.2-2.5 0-3-2-4.5-2-6.5"/><path d="M16 10c-1.5 0-3 1-3 3s1.3 3 2.8 3c1 0 2.2-.6 2.2-2.5 0-3-2-4.5-2-6.5"/></Icon>,
  Send: (p) => <Icon {...p}><path d="M5 19l16-7L5 5v5.5l9 1.5-9 1.5z"/></Icon>,
  More: (p) => <Icon {...p}><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4"/><path d="M16 4v4"/><path d="M4 11h16"/></Icon>,
  // ── v3 community set (Lucide-style) ──
  MessageCircle: (p) => <Icon {...p}><path d="M20 11.6a7.6 7.6 0 0 1-11 6.8L4.5 19.5l1.2-4.4A7.6 7.6 0 1 1 20 11.6z"/></Icon>,
  MessageSquare: (p) => <Icon {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3.2V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></Icon>,
  MessagesSquare: (p) => <Icon {...p}><path d="M4 5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8.5L5 16v-2.8H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 17a1 1 0 0 0 1 1h6.5L19 21v-3a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"/></Icon>,
  Megaphone: (p) => <Icon {...p}><path d="M4.5 10.5v3a1 1 0 0 0 1 1H8l8 4.5V5L8 9.5H5.5a1 1 0 0 0-1 1z"/><path d="M18 9.5a3 3 0 0 1 0 5"/><path d="M8 14.5V18a1 1 0 0 0 1 1h1.2"/></Icon>,
  HandHeart: (p) => <Icon {...p}><path d="M12 8.4c1-1.5 3.8-1 3.8 1.1 0 1.7-2.5 3.4-3.8 4.6-1.3-1.2-3.8-2.9-3.8-4.6 0-2.1 2.8-2.6 3.8-1.1z"/><path d="M3.5 14.5l3.2-1.2 4 2.4 3.8-.9 5 2.2"/><path d="M3.5 14.5V20h16.5v-3"/></Icon>,
  BadgeCheck: (p) => <Icon {...p}><path d="M12 3.2l2.1 1.6 2.6-.2.9 2.5 2.3 1.3-.8 2.5.8 2.5-2.3 1.3-.9 2.5-2.6-.2L12 20.8l-2.1-1.6-2.6.2-.9-2.5-2.3-1.3.8-2.5-.8-2.5 2.3-1.3.9-2.5 2.6.2z"/><path d="M9 12l2 2 4-4.2" stroke={p && p.accent ? p.accent : 'currentColor'}/></Icon>,
  Users: (p) => <Icon {...p}><circle cx="9" cy="9" r="3"/><path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2"/><path d="M16.5 6.6a2.4 2.4 0 0 1 0 4.8"/><path d="M17.4 14c2 .5 3.6 2.3 3.6 5"/></Icon>,
  Pin: (p) => <Icon {...p}><path d="M9 3.5h6l-1 5 2.5 3.2h-9L10 8.5l-1-5z"/><path d="M12 14.7V21"/></Icon>,
  Info: (p) => <Icon {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/></Icon>,
  MoreVertical: (p) => <Icon {...p}><circle cx="12" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/></Icon>,
  CheckCheck: (p) => <Icon {...p}><path d="M2.5 12.5l3.5 3.5 7-7.5"/><path d="M11 15.5l1 1 8.5-9"/></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9.5" y="3.5" width="5" height="10.5" rx="2.5"/><path d="M6 11.5a6 6 0 0 0 12 0"/><path d="M12 17.5V21"/></Icon>,
  Camera: (p) => <Icon {...p}><path d="M4 8.8a1.6 1.6 0 0 1 1.6-1.6h1.9L9 5h6l1.5 2.2h1.9A1.6 1.6 0 0 1 20 8.8v8a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 16.8z"/><circle cx="12" cy="12.5" r="3"/></Icon>,
  Smile: (p) => <Icon {...p}><circle cx="12" cy="12" r="8.5"/><path d="M8.5 13.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8"/><path d="M9 9.5h.01"/><path d="M15 9.5h.01"/></Icon>,
  Phone: (p) => <Icon {...p}><path d="M6 4h3l1.4 3.8-2 1.4a11 11 0 0 0 4.9 4.9l1.4-2L19 17.5V20a1 1 0 0 1-1.1 1A15.5 15.5 0 0 1 4 7.1 1 1 0 0 1 5 6z"/></Icon>,
  CalendarPlus: (p) => <Icon {...p}><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4"/><path d="M16 4v4"/><path d="M4 11h16"/><path d="M12 14v4"/><path d="M10 16h4"/></Icon>,
  Flag: (p) => <Icon {...p}><path d="M6 21V4"/><path d="M6 5h10.5l-1.8 3 1.8 3H6"/></Icon>,
  Lock: (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></Icon>,
  Crown: (p) => <Icon {...p}><path d="M4 8l3.6 2.8L12 5l4.4 5.8L20 8l-1.4 9.5h-13L4 8z"/></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 3.4l7 2.4v5c0 4.3-3 7.6-7 9.6-4-2-7-5.3-7-9.6v-5l7-2.4z"/></Icon>,
  BookOpen: (p) => <Icon {...p}><path d="M12 6.6C10 5.1 7 4.6 4.5 5.2v11.6C7 16.2 10 16.7 12 18.2"/><path d="M12 6.6C14 5.1 17 4.6 19.5 5.2v11.6C17 16.2 14 16.7 12 18.2"/><path d="M12 6.6v11.6"/></Icon>,
  Sparkles: (p) => <Icon {...p}><path d="M11 4l1.3 4.3L16.5 9.6 12.3 11 11 15.2 9.7 11 5.5 9.6 9.7 8.3z"/><path d="M18 13.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></Icon>,
  ImagePlus: (p) => <Icon {...p}><path d="M19 9v9a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 18V7a1.5 1.5 0 0 1 1.5-1.5H13"/><path d="M5 17l4-4 3 3 3-3 4 4"/><circle cx="9" cy="9.5" r="1.4"/><path d="M18 3v5M15.5 5.5h5"/></Icon>,
  At: (p) => <Icon {...p}><circle cx="12" cy="12" r="3.2"/><path d="M15.2 9v4a2.3 2.3 0 0 0 4.3 1.1A8 8 0 1 0 17 18.5"/></Icon>,
  Flame: (p) => <Icon {...p}><path d="M12 3.5c1 2.5 4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1-3 1.5-4 0 1.5 1 2 1.5 2 0-2 0-4 1.5-6z"/></Icon>,
};

// shared sub-components
function TabBar({ value, onChange, communityUnread = 3 }) {
  const tabs = [
    { key: 'today', label: 'Today', icon: Icons.Home },
    { key: 'bible', label: 'Bible', icon: Icons.BookOpen },
    { key: 'community', label: 'Community', icon: Icons.MessagesSquare, badge: communityUnread },
    { key: 'profile', label: 'You', icon: Icons.Profile },
  ];
  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map(t => {
        const I = t.icon;
        const selected = t.key === value;
        return (
          <button key={t.key} className="tab" aria-selected={selected} onClick={() => onChange(t.key)}>
            <div style={{ position: 'relative' }}>
              <I size={22} stroke={selected ? 1.85 : 1.5} />
              {t.badge ? (
                <span style={{
                  position: 'absolute', top: -4, right: -7, minWidth: 15, height: 15,
                  padding: '0 4px', borderRadius: 999, background: 'var(--copper)',
                  color: '#fff', fontSize: 9.5, fontWeight: 700, lineHeight: '15px',
                  textAlign: 'center', border: '1.5px solid var(--paper)',
                }}>{t.badge}</span>
              ) : null}
            </div>
            <span>{t.label}</span>
            <span className="tab-dot" />
          </button>
        );
      })}
    </nav>
  );
}

// Top bar — minimal, ranged for sub-pages
function TopBar({ left, right, title, dark, sticky, transparent }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px 10px',
      background: transparent ? 'transparent' : 'var(--bg)',
      backdropFilter: transparent ? 'none' : 'saturate(140%) blur(8px)',
    }}>
      <div style={{ minWidth: 36, display: 'flex', alignItems: 'center' }}>{left}</div>
      <div className="display" style={{ fontSize: 15, color: 'var(--ink)', textAlign: 'center' }}>{title}</div>
      <div style={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// Round icon button
function IconButton({ icon: I, onClick, label, size = 38, color }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: size, height: size, borderRadius: '50%',
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: color || 'var(--ink-soft)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 160ms ease',
    }} onMouseDown={e => e.currentTarget.style.background = 'var(--rule-soft)'}
       onMouseUp={e => e.currentTarget.style.background = 'transparent'}
       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <I size={20} stroke={1.6} />
    </button>
  );
}

// Progress ring
function Ring({ size = 28, stroke = 2.5, value = 0.5, color = 'var(--gold)', track = 'var(--rule)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - value)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

// Avatar with initials and curated bg
function Avatar({ name = 'AA', size = 32, tone }) {
  const tones = ['#b88a3e', '#6f8055', '#5a6394', '#c47a3f', '#94655c', '#3e425a'];
  const idx = name.charCodeAt(0) % tones.length;
  const bg = tone || tones[idx];
  return (
    <div className="avatar" style={{
      width: size, height: size, fontSize: size * 0.4,
      background: `color-mix(in oklch, ${bg} 22%, var(--paper))`,
      color: bg, fontFamily: 'var(--display)', fontWeight: 500,
    }}>{name.slice(0,2).toUpperCase()}</div>
  );
}

// Striped image placeholder
function PhotoSlot({ label = 'photo', height = 120, style }) {
  return (
    <div className="placeholder-img" style={{ height, ...style }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
    </div>
  );
}

Object.assign(window, { Icon, Icons, TabBar, TopBar, IconButton, Ring, Avatar, PhotoSlot });
