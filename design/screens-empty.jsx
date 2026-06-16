// Mathetes — empty states. Four states, switchable for review.
// Illustrations are deliberately minimal single-line drawings.

function EmptyIllustration({ kind }) {
  const s = 'var(--ink-faint)';
  const w = 1.4;
  const common = { width: 76, height: 76, viewBox: '0 0 76 76', fill: 'none', stroke: s, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'bookmarks') {
    return (
      <svg {...common}>
        <path d="M16 18a4 4 0 0 1 4-4h16v44H20a4 4 0 0 0-4 4V18z" />
        <path d="M60 18a4 4 0 0 0-4-4H40v44h16a4 4 0 0 1 4 4V18z" />
        <path d="M44 14v22l5-4 5 4V14" stroke="var(--copper)" />
      </svg>
    );
  }
  if (kind === 'highlights') {
    return (
      <svg {...common}>
        <path d="M16 24h30" />
        <path d="M16 52h22" />
        <path d="M14 38h36" stroke="var(--copper)" strokeWidth="7" opacity="0.45" />
        <path d="M16 38h34" />
      </svg>
    );
  }
  if (kind === 'offline') {
    return (
      <svg {...common}>
        <path d="M10 50h56" />
        <path d="M18 50c6-16 14-24 20-24s14 8 20 24" />
        <circle cx="52" cy="24" r="6" stroke="var(--copper)" />
      </svg>
    );
  }
  // streak / sunrise
  return (
    <svg {...common}>
      <path d="M12 54h52" />
      <path d="M24 54a14 14 0 0 1 28 0" stroke="var(--copper)" />
      <path d="M38 24v-8" stroke="var(--copper)" />
      <path d="M20 32l-5-5" stroke="var(--copper)" />
      <path d="M56 32l5-5" stroke="var(--copper)" />
    </svg>
  );
}

function EmptyState({ topTitle, illustration, title, body, action, onBack, showBack = true }) {
  return (
    <div className="surface" style={{ background: 'var(--bg)' }}>
      <TopBar
        left={showBack ? <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" /> : null}
        title={topTitle}
      />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 40px 40px', textAlign: 'center',
      }}>
        <div style={{ marginBottom: 24 }}><EmptyIllustration kind={illustration} /></div>
        <h2 className="display" style={{
          fontSize: 26, lineHeight: 1.2, fontWeight: 500, color: 'var(--ink)',
          margin: 0, letterSpacing: '-0.01em',
        }}>{title}</h2>
        <p style={{
          fontSize: 15, lineHeight: 1.55, color: 'var(--ink-soft)',
          margin: '12px 0 0', maxWidth: 280,
        }}>{body}</p>
        {action && (
          <button className="btn" style={{
            marginTop: 24, height: 50, padding: '0 26px',
            background: 'var(--copper)', color: '#fff',
          }}>{action}</button>
        )}
      </div>
    </div>
  );
}

const EMPTY_STATES = [
  { id: 'bookmarks', tab: 'Bookmarks', topTitle: 'Bookmarks', illustration: 'bookmarks',
    title: 'No bookmarks yet',
    body: 'Your saved verses will appear here. Tap the bookmark icon on any verse as you read.' },
  { id: 'highlights', tab: 'Highlights', topTitle: 'Highlights', illustration: 'highlights',
    title: 'Nothing highlighted yet',
    body: 'Highlight a verse to keep it close. Tap and hold any verse in the Bible to mark it.' },
  { id: 'offline', tab: 'Offline', topTitle: '', illustration: 'offline',
    title: "You're offline",
    body: "Today's Word and devotional are saved. Other features will return when you're back online." },
  { id: 'streak', tab: 'New day', topTitle: '', illustration: 'streak',
    title: 'Today is a new day.',
    body: "Yesterday is behind you. Open the Word, and let's begin again.",
    action: "Read today's Word" },
];

function EmptyStatesGallery({ onBack }) {
  const [active, setActive] = React.useState('bookmarks');
  const state = EMPTY_STATES.find(s => s.id === active);
  return (
    <div className="surface fade-page" style={{ background: 'var(--bg)' }}>
      {/* review switcher */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '12px 12px 10px',
        borderBottom: '1px solid var(--rule-soft)',
      }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
        {EMPTY_STATES.map(s => {
          const on = s.id === active;
          return (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (on ? 'var(--copper)' : 'var(--rule)'),
              background: on ? 'var(--copper)' : 'transparent',
              color: on ? '#fff' : 'var(--ink-soft)',
              fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500,
            }}>{s.tab}</button>
          );
        })}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <EmptyState key={state.id} {...state} onBack={onBack} showBack={false} />
      </div>
    </div>
  );
}

Object.assign(window, { EmptyState, EmptyStatesGallery, EmptyIllustration });
