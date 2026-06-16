// Mathetes — Community home (inbox) + Notification center

function FilterChips({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 18, padding: '4px 18px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {items.map(it => {
        const on = it === value;
        return (
          <button key={it} onClick={() => onChange(it)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', flexShrink: 0,
            fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: on ? 600 : 500,
            color: on ? 'var(--ink)' : 'var(--ink-mute)',
            borderBottom: on ? '2px solid var(--copper)' : '2px solid transparent',
          }}>{it}</button>
        );
      })}
    </div>
  );
}

function InboxItem({ item, onClick }) {
  const leftEl = (() => {
    if (item.group) return <HAvatar group={item.group} size={38} />;
    if (item.kind === 'pastor') return <HAvatar id="pastor" size={44} />;
    if (item.icon) {
      const I = Icons[item.icon];
      return (
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `color-mix(in oklch, ${item.tone} 16%, var(--paper))`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid color-mix(in oklch, ${item.tone} 35%, transparent)` }}>
          <I size={20} color={item.tone} stroke={1.7} />
        </div>
      );
    }
    if (item.tone) {
      const I = item.kind === 'prayer' ? Icons.HandHeart : Icons.Megaphone;
      return (
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `color-mix(in oklch, ${item.tone} 16%, var(--paper))`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid color-mix(in oklch, ${item.tone} 35%, transparent)` }}>
          <I size={20} color={item.tone} stroke={1.7} />
        </div>
      );
    }
    return <HAvatar id={item.who} initials={item.initials} ring={item.ring} size={44} />;
  })();

  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
      padding: '12px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
    }}>
      <div style={{ flexShrink: 0 }}>{leftEl}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.kind === 'house' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.ring, flexShrink: 0 }} />}
          <span style={{ fontFamily: 'var(--body)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
          {item.verified && <VerifiedBadge size={15} />}
          {item.badge && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--body)', fontSize: 10, fontWeight: 600, color: 'var(--copper-deep)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--copper)' }} />{item.badge}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.preview}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)' }}>{item.time}</span>
        {item.unread ? (
          <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--copper)', color: '#fff', fontSize: 10.5, fontWeight: 700, lineHeight: '18px', textAlign: 'center' }}>{item.unread}</span>
        ) : <span style={{ height: 18 }} />}
      </div>
    </button>
  );
}

function CommunityHome({ goto }) {
  const [filter, setFilter] = React.useState('All');
  const open = (item) => {
    const id = item.id || item.kind;
    if (id === 'announcements' || item.kind === 'announcements') return goto('announcements');
    if (id && id.startsWith('dm-')) return goto('dm', id.slice(3));
    if (id === 'ask-pastor') return goto('ask-pastor');
    if (id === 'discipler') return goto('discipler');
    if (id === 'house-chat') return goto('house-chat');
    if (id === 'prayer-wall') return goto('prayer-wall');
    return goto('house-chat');
  };
  return (
    <div className="surface fade-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
        <div className="display" style={{ fontSize: 23, fontWeight: 500, color: 'var(--ink)' }}>Community</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton icon={Icons.Search} label="Search" />
          <div style={{ position: 'relative' }}>
            <IconButton icon={Icons.Bell} label="Notifications" onClick={() => goto('notifications')} />
            <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--copper)', border: '1.5px solid var(--bg)' }} />
          </div>
        </div>
      </div>
      <FilterChips items={['All', 'Unread', 'Houses', 'DMs']} value={filter} onChange={setFilter} />

      <div className="scroll" style={{ paddingBottom: 16 }}>
        <SectionLabel style={{ paddingTop: 8 }}>Pinned</SectionLabel>
        <div style={{ padding: '0 8px' }}>
          <div style={{ border: '1px solid var(--rule)', borderRadius: 14, background: 'var(--paper)', boxShadow: 'var(--shadow-soft)' }}>
            <InboxItem item={INBOX.pinned} onClick={() => goto('announcements')} />
          </div>
        </div>

        <SectionLabel>Today</SectionLabel>
        {INBOX.today.map((it, i) => <InboxItem key={i} item={it} onClick={() => open(it)} />)}

        <SectionLabel>Earlier</SectionLabel>
        {INBOX.earlier.map((it, i) => <InboxItem key={i} item={it} onClick={() => open(it)} />)}

        <div style={{ textAlign: 'center', padding: '20px 36px 8px' }}>
          <span className="display-italic" style={{ fontSize: 12.5, color: 'var(--ink-mute)' }}>
            Replies to ask-pastor questions arrive within 48 hours.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Notification center ──
function NotificationCenter({ onBack, goto }) {
  const [filter, setFilter] = React.useState('All');
  return (
    <div className="surface fade-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px' }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', flex: 1, textAlign: 'center' }}>Notifications</div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--copper-deep)', fontWeight: 500, paddingRight: 6 }}>Mark all read</button>
      </div>
      <FilterChips items={['All', 'Mentions', 'Replies', 'Prayer']} value={filter} onChange={setFilter} />
      <div className="scroll" style={{ paddingBottom: 24 }}>
        {NOTIFICATIONS.map((grp, gi) => (
          <div key={gi}>
            <SectionLabel>{grp.group}</SectionLabel>
            {grp.items.map((n, i) => {
              const I = n.icon ? Icons[n.icon] : null;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 18px', background: n.unread ? 'color-mix(in oklch, var(--copper) 4%, transparent)' : 'transparent' }}>
                  <div style={{ flexShrink: 0 }}>
                    {n.avatar ? <HAvatar id={n.avatar} size={38} /> : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `color-mix(in oklch, ${n.tone} 16%, var(--paper))`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid color-mix(in oklch, ${n.tone} 32%, transparent)` }}>
                        <I size={18} color={n.tone} stroke={1.7} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.35 }}>{n.title}</div>
                    <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--ink-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.preview}</div>
                    <div style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 3 }}>{n.time}</div>
                  </div>
                  {n.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--copper)', marginTop: 6, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '18px 0 4px' }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--copper-deep)', fontWeight: 500 }}>Notification preferences →</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommunityHome, NotificationCenter, FilterChips, InboxItem });
