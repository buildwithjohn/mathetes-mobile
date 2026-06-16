// Mathetes — daily loop: Today (Home), Word of the Day, Devotional reading

// ─── Streak counter (subtle, top-right) ───────────────────────
function StreakChip({ count = 47, atRisk = false, onClick }) {
  return (
    <button onClick={onClick} aria-label={`${count} day streak`} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 11px 6px 9px', height: 30, borderRadius: 999,
      background: 'transparent', border: '1px solid var(--rule)',
      cursor: 'pointer', color: 'var(--ink-soft)',
      fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500,
      transition: 'all 200ms ease',
    }}>
      <svg width="12" height="14" viewBox="0 0 12 14" fill={atRisk ? 'var(--warning)' : 'var(--copper)'}>
        <path d="M6 0.5c.4 1.4 2.4 2.2 2.4 4.4C8.4 6.5 7.4 7 6.4 7c.6-.7.6-1.7 0-2.4C5.4 5.5 4 6.5 4 8.5c0 1.6 1.2 2.6 2.6 2.6.4 1.6 0 2.4-2 2.4C2.4 13.5 1 11.7 1 9.4 1 5.5 5 4.5 6 0.5z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}

// ─── Home / Today ─────────────────────────────────────────────
function TodayScreen({ goto, dark }) {
  const greetingTime = 'Good morning';
  return (
    <div className="surface fade-page">
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '14px 22px 10px',
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            {TODAY.date}
          </div>
          <div className="display" style={{
            fontSize: 19, color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.01em',
          }}>{greetingTime}, <span className="display-italic" style={{ color: 'var(--copper-deep)' }}>{TODAY.firstName}</span></div>
        </div>
        <StreakChip count={TODAY.streak} />
      </div>

      <div className="scroll" style={{ paddingBottom: 24 }}>
        {/* Word of the Day hero card */}
        <div style={{ padding: '24px 20px 0' }}>
          <WordOfDayCard onTap={() => goto('word')} />
        </div>

        {/* Section: today's devotional */}
        <SectionHeader title="Today’s reflection" eyebrow="Devotional" subtitle={`${DEVOTIONAL.series} · Day ${DEVOTIONAL.day} of ${DEVOTIONAL.total}`} />
        <div style={{ padding: '0 20px' }}>
          <DevotionalPreview onTap={() => goto('devotional')} />
        </div>

        {/* Bible quick-access */}
        <SectionHeader title="Continue reading" />
        <div style={{ padding: '0 20px' }}>
          <ContinueReadingCard onTap={() => goto('bible')} />
        </div>

        {/* End-of-feed quiet line */}
        <div style={{
          textAlign: 'center', marginTop: 36, padding: '0 36px',
          color: 'var(--ink-mute)', fontFamily: 'var(--display)',
          fontStyle: 'italic', fontSize: 14, lineHeight: 1.55,
        }}>
          “In all thy ways acknowledge him.”
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, eyebrow, subtitle, action }) {
  return (
    <div style={{
      padding: '32px 22px 12px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
        <div className="display" style={{ fontSize: 20, color: 'var(--ink)', fontWeight: 500 }}>{title}</div>
        {subtitle && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── Word of Day card (hero) ──────────────────────────────────
function WordOfDayCard({ onTap }) {
  return (
    <button onClick={onTap} style={{
      width: '100%', textAlign: 'left', padding: 0, border: 'none',
      background: 'transparent', cursor: 'pointer',
    }}>
      <div className="card" style={{
        padding: '22px 22px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* copper edge strip */}
        <div style={{
          position: 'absolute', left: 0, top: 22, bottom: 22, width: 3,
          borderRadius: 0, background: 'var(--copper)',
        }} />
        <div className="eyebrow" style={{ color: 'var(--copper-deep)', marginBottom: 12, paddingLeft: 4 }}>
          Word of the day
        </div>
        <div className="display reveal-line" style={{
          fontSize: 26, lineHeight: 1.22, color: 'var(--ink)',
          fontWeight: 400, letterSpacing: '-0.01em', paddingLeft: 4,
          animationDelay: '60ms',
        }}>
          “Trust in the LORD with all thine heart; and lean not unto thine own <span className="display-italic">understanding</span>.”
        </div>
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingLeft: 4,
        }}>
          <div style={{
            fontFamily: 'var(--body)', fontSize: 11.5, fontWeight: 500,
            color: 'var(--copper-deep)', letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>{WORD.ref}</div>
          <Icons.Chevron size={18} color="var(--ink-mute)" stroke={1.5} />
        </div>
      </div>
    </button>
  );
}

// ─── Devotional preview card ──────────────────────────────────
function DevotionalPreview({ onTap }) {
  return (
    <button onClick={onTap} style={{
      width: '100%', padding: 0, textAlign: 'left',
      background: 'transparent', border: 'none', cursor: 'pointer',
    }}>
      <div className="card" style={{ padding: 20, display: 'flex', gap: 14 }}>
        <div style={{
          width: 64, height: 80, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(155deg, var(--copper) 0%, var(--oxblood) 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="display" style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontStyle: 'italic', opacity: 0.9, fontWeight: 400,
          }}>Pr</div>
          <div style={{
            position: 'absolute', bottom: 6, left: 6,
            fontFamily: 'var(--body)', fontSize: 9, color: '#fff',
            opacity: 0.75, letterSpacing: '0.15em',
          }}>DAY {DEVOTIONAL.day}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{
            fontSize: 19, lineHeight: 1.2, color: 'var(--ink)', fontWeight: 500,
            marginBottom: 6,
          }}>{DEVOTIONAL.title}</div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
            {DEVOTIONAL.author} · {DEVOTIONAL.readingTime}
          </div>
          <div style={{
            fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            There is a kind of knowing that comes only when we are quiet enough to receive it…
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Continue reading card ────────────────────────────────────
function ContinueReadingCard({ onTap }) {
  return (
    <button onClick={onTap} style={{
      width: '100%', padding: 0, textAlign: 'left',
      background: 'transparent', border: 'none', cursor: 'pointer',
    }}>
      <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Ring value={0.65} size={36} stroke={2.5} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>John 3 · KJV</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            You stopped at verse 10. 6 verses left in the passage.
          </div>
        </div>
        <Icons.Chevron size={18} color="var(--ink-mute)" stroke={1.5} />
      </div>
    </button>
  );
}

// ─── Word of the Day expanded ─────────────────────────────────
function WordExpanded({ onBack }) {
  const sentences = WORD.passage.replace(/\s+/g, ' ').split('. ').filter(Boolean);
  return (
    <div className="surface modal-page" style={{ background: 'var(--bg)' }}>
      <TopBar
        left={<IconButton icon={Icons.Close} onClick={onBack} label="Close" />}
        right={<>
          <IconButton icon={Icons.Calendar} label="Archive" />
          <IconButton icon={Icons.Bookmark} label="Save" />
        </>}
        title=""
      />
      <div className="scroll" style={{ padding: '8px 26px 32px' }}>
        <div className="eyebrow" style={{ color: 'var(--copper-deep)', marginBottom: 18 }}>
          Word of the day · {TODAY.date}
        </div>

        <div className="display" style={{
          fontSize: 30, lineHeight: 1.22, color: 'var(--ink)',
          fontWeight: 400, letterSpacing: '-0.012em',
        }}>
          {sentences.map((s, i) => (
            <span key={i} className="reveal-line" style={{ animationDelay: `${100 + i * 180}ms` }}>
              {i === 0 ? '“' : ''}{s}{i < sentences.length - 1 ? '. ' : '.”'}
            </span>
          ))}
        </div>

        {/* reference, small caps */}
        <div style={{
          marginTop: 28, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 28, height: 1, background: 'var(--copper)', opacity: 0.7 }} />
          <div style={{
            fontFamily: 'var(--body)', fontSize: 12, fontWeight: 600,
            color: 'var(--copper-deep)', letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>{WORD.ref} · KJV</div>
        </div>

        {/* leader reflection */}
        <div style={{ marginTop: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Reflection · {WORD.author}
          </div>
          <p className="reading-body" style={{ marginTop: 0 }}>
            {WORD.reflection}
          </p>
          <div style={{
            marginTop: 18, padding: '14px 16px', borderLeft: '2px solid var(--copper)',
            background: 'var(--paper-raised)',
            fontFamily: 'var(--display)', fontStyle: 'italic',
            fontSize: 16, lineHeight: 1.5, color: 'var(--ink-soft)',
            borderRadius: '0 10px 10px 0',
          }}>
            {WORD.prompt}
          </div>
        </div>
      </div>

      {/* sticky share footer */}
      <div style={{
        padding: '10px 22px 22px', background: 'var(--bg)',
        borderTop: '1px solid var(--rule-soft)', display: 'flex', gap: 10,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1, height: 50 }}>
          <Icons.Note size={16} stroke={1.6} /> <span>Note</span>
        </button>
        <button className="btn" style={{
          flex: 2, height: 50, background: 'var(--copper)', color: '#fff',
        }}>
          <Icons.Image size={16} stroke={1.8} /> <span>Share as image</span>
        </button>
      </div>
    </div>
  );
}

// ─── Devotional reading ───────────────────────────────────────
function DevotionalScreen({ onBack, goto }) {
  const [bookmarked, setBookmarked] = React.useState(false);
  const scrollRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="surface modal-page">
      {/* progress thread */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, zIndex: 20 }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'var(--copper)', transition: 'width 80ms linear',
        }} />
      </div>
      <TopBar
        left={<IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />}
        right={<>
          <IconButton icon={Icons.Volume} label="Listen" />
          <IconButton
            icon={bookmarked ? Icons.Bookmark : Icons.Bookmark}
            color={bookmarked ? 'var(--copper)' : undefined}
            onClick={() => setBookmarked(b => !b)} label="Bookmark" />
        </>}
        title=""
      />
      <div ref={scrollRef} className="scroll" style={{ padding: '0 26px 60px' }}>
        <div className="eyebrow" style={{ marginTop: 8 }}>
          {DEVOTIONAL.series} · Day {DEVOTIONAL.day}
        </div>
        <h1 className="display" style={{
          fontSize: 34, lineHeight: 1.1, margin: '12px 0 14px',
          fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em',
        }}>{DEVOTIONAL.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Avatar name="TA" size={26} tone="var(--oxblood)" />
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
            <span style={{ fontWeight: 500 }}>{DEVOTIONAL.author}</span>
            <span className="muted">  ·  {DEVOTIONAL.readingTime}</span>
          </div>
        </div>

        {/* Inline scripture block */}
        <ScriptureBlock passageRef={DEVOTIONAL.passageRef} text={DEVOTIONAL.passage} />

        <div className="reading-body" style={{ marginTop: 28 }}>
          {DEVOTIONAL.body.map((p, i) => (
            <React.Fragment key={i}>
              <p className={i === 0 ? 'dropcap' : ''}>{p}</p>
              {i === 1 && (
                <p className="display-italic" style={{
                  margin: '26px 0', paddingLeft: 18,
                  borderLeft: '2px solid var(--copper)',
                  fontSize: 22, lineHeight: 1.34, color: 'var(--ink)',
                }}>{DEVOTIONAL.pullQuote}</p>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Reflection prompt */}
        <div style={{
          marginTop: 36, padding: '20px 22px',
          background: 'var(--paper-raised)', borderRadius: 16,
        }}>
          <div className="eyebrow" style={{ color: 'var(--copper-deep)', marginBottom: 10 }}>
            Sit with this
          </div>
          <div className="display-italic" style={{
            fontSize: 19, lineHeight: 1.4, color: 'var(--ink)',
          }}>
            {DEVOTIONAL.prompt}
          </div>
          <button style={{
            marginTop: 16, padding: '10px 16px', background: 'transparent',
            border: '1px solid var(--rule)', borderRadius: 999,
            fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <Icons.Note size={14} stroke={1.6} />
            <span>Write your reflection</span>
          </button>
        </div>

        {/* Tomorrow preview */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div className="display-italic" style={{ flex: 1, fontSize: 14, color: 'var(--ink-mute)' }}>
            Tomorrow: <span style={{ color: 'var(--ink-soft)' }}>{DEVOTIONAL.tomorrow}</span>
          </div>
          <Icons.Chevron size={16} color="var(--ink-mute)" stroke={1.5} />
        </div>
      </div>
    </div>
  );
}

function ScriptureBlock({ passageRef, text }) {
  return (
    <div style={{
      padding: '20px 22px', borderRadius: 14,
      background: 'var(--paper)',
      borderLeft: '2px solid var(--oxblood)',
    }}>
      <div style={{
        fontFamily: 'var(--body)', fontSize: 11, fontWeight: 600,
        color: 'var(--oxblood)', letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: 10,
      }}>{passageRef}</div>
      <div className="display-italic" style={{
        fontSize: 17, lineHeight: 1.5, color: 'var(--ink-soft)',
      }}>{text}</div>
    </div>
  );
}

Object.assign(window, {
  TodayScreen, WordExpanded, DevotionalScreen, StreakChip, ScriptureBlock,
});
