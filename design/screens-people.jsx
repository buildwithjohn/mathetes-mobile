// Mathetes — Prayer Wall + Members Directory + Public Profile

// ── Prayer Wall ──
function PrayerCard({ p }) {
  const m = p.anon ? null : window.M[p.who];
  const name = p.anon ? (p.name || 'Anonymous') : m.name;
  const tint = p.urgent ? 'color-mix(in oklch, var(--copper) 8%, var(--paper))' : 'var(--paper)';
  return (
    <div className="card" style={{ padding: 16, marginBottom: 12, background: tint, boxShadow: p.urgent ? 'var(--shadow-soft)' : 'var(--shadow-card)' }}>
      {(p.urgent || p.praise) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          {p.urgent && <Icons.HandHeart size={15} color="var(--copper-deep)" stroke={1.7} />}
          <span style={{
            fontFamily: 'var(--body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999,
            color: '#fff', background: p.praise ? 'var(--copper)' : 'var(--copper-deep)',
          }}>{p.praise ? 'Praise Report' : 'Urgent'}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {p.anon ? <HAvatar anon size={34} /> : <HAvatar id={p.who} size={34} />}
        <span style={{ fontFamily: 'var(--body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{name}</span>
        <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)' }}>· {p.time}</span>
      </div>
      <p style={{ fontFamily: 'var(--body)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)', margin: '0 0 12px' }}>{p.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PrayingButton count={p.pray} prayed={p.youPrayed} tone={p.urgent ? 'var(--copper)' : 'var(--copper)'} />
        {p.heart && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-mute)' }}>❤️ {p.heart}</span>}
        {p.youPrayed && <span style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--success)', fontWeight: 500 }}>You prayed</span>}
        <span style={{ marginLeft: 'auto' }}><Icons.MoreVertical size={16} color="var(--ink-faint)" /></span>
      </div>
      {p.note && <div style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 9, fontStyle: 'italic' }}>{p.note}</div>}
    </div>
  );
}

function PrayerWall({ onBack, goto }) {
  const [filter, setFilter] = React.useState('All');
  return (
    <div className="surface modal-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px', borderBottom: '1px solid var(--rule-soft)' }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>Prayer Wall</div>
          <div style={{ fontFamily: 'var(--body)', fontSize: 10, fontWeight: 600, color: HC.berea, letterSpacing: '0.12em', marginTop: 1 }}>BEREA HOUSE · {PRAYER_WALL.active} ACTIVE</div>
        </div>
        <button aria-label="Post request" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: HC.berea, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icons.Plus size={18} stroke={2} />
        </button>
      </div>
      <FilterChips items={['All', 'Most urgent', 'Family', 'Studies', 'Career', 'Healing', 'Anonymous']} value={filter} onChange={setFilter} />
      <div className="scroll" style={{ padding: '4px 16px 90px', position: 'relative' }}>
        {PRAYER_WALL.sections.map((s, si) => (
          <div key={si}>
            <div className="eyebrow" style={{ padding: '12px 0 10px', color: si === 0 ? 'var(--copper-deep)' : 'var(--ink-mute)' }}>{s.header}</div>
            {s.items.map((p, i) => <PrayerCard key={i} p={p} />)}
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '6px 24px 0' }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)' }}>Your house leader Brother Tope sees all requests for pastoral care.</span>
        </div>
      </div>
      {/* FAB */}
      <button aria-label="Post a prayer request" style={{ position: 'absolute', right: 18, bottom: 22, width: 54, height: 54, borderRadius: '50%', border: 'none', background: HC.berea, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(168,124,62,0.6)', zIndex: 20 }}>
        <Icons.Plus size={24} stroke={2} />
      </button>
    </div>
  );
}

// ── Members Directory ──
function MemberRow({ m, size = 44, sub, goto, big }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--rule-soft)' }}>
      <button onClick={() => goto('public-profile', m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <HAvatar id={m.id} size={size} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className={big ? '' : ''} style={{ fontFamily: 'var(--body)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</span>
            {m.you && <span style={{ fontFamily: 'var(--body)', fontSize: 9.5, fontWeight: 600, color: 'var(--copper-deep)', border: '1px solid var(--copper)', borderRadius: 999, padding: '1px 6px' }}>you</span>}
          </div>
          <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--ink-mute)', marginTop: 1 }}>{sub || `${m.year} · ${m.dept}`}</div>
          {m.verse && big && <div className="display-italic" style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>“{m.verse}”</div>}
        </div>
      </button>
      {!m.you && <button onClick={() => goto('dm', m.id)} aria-label="Message" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <Icons.MessageCircle size={18} stroke={1.6} />
      </button>}
    </div>
  );
}

function MembersDirectory({ onBack, goto }) {
  const leaders = MEMBERS.filter(m => m.leader);
  const disciplers = MEMBERS.filter(m => m.discipler);
  const disciples = MEMBERS.filter(m => !m.leader && !m.discipler).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="surface modal-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px', borderBottom: '1px solid var(--rule-soft)' }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: HC.berea }} />Berea Members
        </div>
        <IconButton icon={Icons.Search} label="Search" />
      </div>
      <div className="scroll" style={{ padding: '14px 18px 24px' }}>
        {/* at a glance */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>12 disciples · 1 leader · 2 disciplers</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <Glance icon={Icons.Users} label="8 active this week" />
            <Glance icon={Icons.Flame} label="5-yr average" />
            <Glance icon={Icons.BookOpen} label="House verse" link />
          </div>
        </div>

        <div className="eyebrow" style={{ marginTop: 20, marginBottom: 2 }}>Leadership</div>
        {leaders.map(m => <MemberRow key={m.id} m={m} size={48} sub="House Leader · 3rd year leading" goto={goto} big />)}

        <div className="eyebrow" style={{ marginTop: 20, marginBottom: 2 }}>Disciplers</div>
        {disciplers.map(m => <MemberRow key={m.id} m={m} sub={`Discipler · ${m.year}`} goto={goto} />)}

        <div className="eyebrow" style={{ marginTop: 20, marginBottom: 2 }}>Disciples (12)</div>
        {disciples.map(m => <MemberRow key={m.id} m={m} size={40} goto={goto} />)}

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-faint)' }}>Cross-house connections coming in V1.5.</span>
        </div>
      </div>
    </div>
  );
}

function Glance({ icon: I, label, link }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <I size={14} color="var(--copper)" stroke={1.7} />
      <span style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: link ? 'var(--copper-deep)' : 'var(--ink-mute)', fontWeight: link ? 500 : 400 }}>{label}</span>
    </div>
  );
}

// ── Public profile ──
function PublicProfile({ onBack, goto, param }) {
  const m = (param && window.M[param]) ? window.M[param] : window.M.daniel;
  const first = m.name.split(' ')[0];
  return (
    <div className="surface modal-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 4px' }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <IconButton icon={Icons.MoreVertical} label="More" />
      </div>
      <div className="scroll" style={{ padding: '12px 22px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <HAvatar id={m.id} size={110} />
        </div>
        <h1 className="display" style={{ fontSize: 27, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{m.name}</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 12px', borderRadius: 999, background: `color-mix(in oklch, ${HC.berea} 14%, var(--paper))`, border: `1px solid color-mix(in oklch, ${HC.berea} 35%, transparent)` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: HC.berea }} />
          <span style={{ fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 600, color: HC.berea, letterSpacing: '0.1em' }}>BEREA HOUSE · YOUR HOUSE-MATE</span>
        </div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>{m.year} · {m.dept}</div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 3 }}>{m.joined || 'Joined September 2023'}</div>

        {/* pinned verse */}
        <div className="card" style={{ padding: '18px 20px', marginTop: 22, textAlign: 'left' }}>
          <div className="eyebrow" style={{ marginBottom: 9 }}>{first}’s verse</div>
          <div className="display-italic" style={{ fontSize: 17, lineHeight: 1.4, color: 'var(--ink)' }}>“{m.verse || 'Be strong and of a good courage.'}”</div>
          <div style={{ fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 600, color: 'var(--oxblood)', letterSpacing: '0.16em', marginTop: 10 }}>{(m.verseRef || 'JOSHUA 1:9').toUpperCase()}</div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, padding: '0 4px' }}>
          <Stat icon={Icons.Flame} value={`${m.streak || 47}-day`} label="streak" />
          <Stat value={`${m.days || 120}`} label="days in Mathetes" />
          <Stat icon={Icons.HandHeart} value={`${m.prayed || 12}`} label="prayers prayed" />
        </div>

        {/* activity */}
        <div className="eyebrow" style={{ marginTop: 26, marginBottom: 10, textAlign: 'left' }}>Recent reflections shared in house chat</div>
        <div style={{ textAlign: 'left' }}>
          {[
            { t: 'God is teaching me to trust his timing over my plans.', d: 'Today' },
            { t: 'Joshua 1:9 carried me through my defense prep this week.', d: '3 days ago' },
            { t: 'Faithful in the little. That is where the disciple is made.', d: 'Last week' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--rule-soft)' : 'none' }}>
              <div className="display-italic" style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.4 }}>“{r.t}”</div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 3 }}>{r.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn" onClick={() => goto('dm', m.id)} style={{ flex: 1, height: 48, background: 'var(--copper)', color: '#fff' }}>
            <Icons.MessageCircle size={16} stroke={1.7} /> Message
          </button>
          <button className="btn btn-ghost" onClick={() => goto('prayer-wall')} style={{ flex: 1, height: 48, fontSize: 13.5 }}>Prayer requests</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)' }}>More about {first} is shared in your house chat and on the prayer wall.</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: I, value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {I && <I size={15} color="var(--copper)" stroke={1.7} />}
        <span className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>{value}</span>
      </div>
      <div style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { PrayerWall, PrayerCard, MembersDirectory, MemberRow, Glance, PublicProfile, Stat });
