// Mathetes — Parish Announcements + Ask Pastor

function ReactionButtons({ reactions }) {
  const [tapped, setTapped] = React.useState(null);
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
      {reactions.map((r, i) => {
        const on = tapped === i;
        return (
          <button key={i} onClick={() => setTapped(on ? null : i)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px',
            borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 12.5, fontWeight: 500,
            border: '1px solid ' + (on ? 'transparent' : 'var(--rule)'),
            background: on ? 'color-mix(in oklch, var(--copper) 14%, var(--paper))' : 'transparent',
            color: 'var(--ink-soft)',
          }}>
            <span>{r.e}</span><span>{r.label}</span>
            <span style={{ color: 'var(--ink-mute)' }}>{r.n + (on ? 1 : 0)}</span>
          </button>
        );
      })}
    </div>
  );
}

function AnnouncementCard({ a }) {
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
      {a.banner && (
        <div style={{ background: 'var(--copper)', color: '#fff', fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', padding: '7px 18px' }}>{a.banner}</div>
      )}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <HAvatar id="pastor" size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Pastor Tunde Akinwale</span>
              <VerifiedBadge size={15} tone="var(--oxblood)" />
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--oxblood)', fontWeight: 500 }}>Parish Pastor</div>
          </div>
          <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)' }}>{a.time}</span>
        </div>
        <h2 className="display" style={{ fontSize: 20, lineHeight: 1.22, fontWeight: 500, color: 'var(--ink)', margin: '0 0 8px' }}>{a.title}</h2>
        <p style={{ fontFamily: 'var(--body)', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>{a.body}</p>
        {a.ref && <div style={{ fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 600, color: 'var(--oxblood)', letterSpacing: '0.16em', marginTop: 12 }}>{a.ref}</div>}

        {a.event && (
          <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--paper-raised)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{a.event.date}</div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{a.event.time} · {a.event.place}</div>
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 999, border: 'none', background: 'var(--copper)', color: '#fff', fontFamily: 'var(--body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <Icons.CalendarPlus size={15} stroke={1.8} />Add
            </button>
          </div>
        )}

        {a.photos && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginTop: 14 }}>
            {Array.from({ length: a.photos }).map((_, i) => (
              <div key={i} className="placeholder-img" style={{ aspectRatio: '1', borderRadius: 8, fontSize: 8 }}><span>photo</span></div>
            ))}
          </div>
        )}

        <ReactionButtons reactions={a.reactions} />
      </div>
    </div>
  );
}

function Announcements({ onBack }) {
  let lastDate = null;
  return (
    <div className="surface modal-page">
      <ChatHeader onBack={onBack} title="Parish Announcements" sub="CCCFSP · Official" subColor="var(--oxblood)"
        right={<IconButton icon={Icons.Bell} label="Notify settings" />} />
      <div className="scroll" style={{ padding: '8px 16px 24px' }}>
        {ANNOUNCEMENTS.map((a, i) => {
          const showDate = a.date !== lastDate; lastDate = a.date;
          return (
            <div key={i}>
              {showDate && <div style={{ textAlign: 'center', margin: '10px 0 14px' }}><span className="eyebrow" style={{ fontSize: 10 }}>{a.date}</span></div>}
              <AnnouncementCard a={a} />
            </div>
          );
        })}
        <div style={{ borderTop: '1px solid var(--rule)', marginTop: 8, paddingTop: 16, textAlign: 'center' }}>
          <div className="display-italic" style={{ fontSize: 12.5, color: 'var(--ink-mute)' }}>Only the pastor and parish admins can post here.</div>
          <div style={{ marginTop: 10 }}><span style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--copper-deep)', fontWeight: 500 }}>View past announcements →</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Ask Pastor home ──
function AskPastor({ onBack, goto }) {
  const [tab, setTab] = React.useState('Your questions');
  return (
    <div className="surface modal-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px', borderBottom: '1px solid var(--rule-soft)' }}>
        <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
        <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', flex: 1, textAlign: 'center' }}>Ask Pastor</div>
        <button onClick={() => goto('ask-new')} aria-label="New question" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--copper)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icons.Plus size={18} stroke={2} />
        </button>
      </div>
      <div className="scroll" style={{ padding: '0 0 100px' }}>
        {/* hero */}
        <div style={{ margin: '16px 16px 0', padding: '20px', borderRadius: 18, background: 'var(--paper)', border: '1px solid var(--rule-soft)', position: 'relative', overflow: 'hidden' }}>
          <Icons.Quote size={70} color="var(--copper)" stroke={1} style={{ position: 'absolute', right: -6, top: -6, opacity: 0.08 }} />
          <HAvatar id="pastor" size={60} />
          <h2 className="display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: '14px 0 6px' }}>Bring your questions</h2>
          <p style={{ fontFamily: 'var(--body)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
            Pastor Tunde responds within 48 hours. Your question may also help your house-mates if you choose to make it public.
          </p>
          <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 12 }}>{ASK_PASTOR.stats}</div>
        </div>

        <FilterChips items={['Your questions', 'Public Q&A', 'Frequently asked']} value={tab} onChange={setTab} />

        <div style={{ padding: '0 16px' }}>
          {ASK_PASTOR.questions.map((q, i) => <AskCard key={i} q={q} goto={goto} />)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 18px', background: 'var(--bg)', borderTop: '1px solid var(--rule-soft)' }}>
        <button className="btn" onClick={() => goto('ask-new')} style={{ width: '100%', height: 50, background: 'var(--copper)', color: '#fff' }}>
          <Icons.Plus size={17} stroke={2} /> Ask a new question
        </button>
        <div style={{ textAlign: 'center', fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 7 }}>Pastor responds within 48 hours</div>
      </div>
    </div>
  );
}

function AskCard({ q, goto }) {
  const answered = q.status === 'answered';
  return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        {answered
          ? <Icons.Check size={15} color="var(--success)" stroke={2.2} />
          : <Icons.Clock size={14} color="var(--ink-mute)" stroke={1.7} />}
        <span style={{ fontFamily: 'var(--body)', fontSize: 11.5, fontWeight: 500, color: answered ? 'var(--success)' : 'var(--ink-mute)' }}>
          {answered ? 'Answered' : 'Awaiting response'} · {q.when}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--body)', fontSize: 14.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{q.q}</div>
      {answered && q.a && (
        <div className="display-italic" style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.45, marginTop: 8 }}>{q.a}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)' }}>
          {q.privacy === 'Public' ? <Icons.Eye size={13} stroke={1.6} /> : <Icons.Lock size={12} stroke={1.6} />}
          {q.privacy}
        </span>
        {q.helped && <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)' }}>· Helped {q.helped} disciples</span>}
        {answered && <span style={{ marginLeft: 'auto', fontFamily: 'var(--body)', fontSize: 12, color: 'var(--copper-deep)', fontWeight: 500 }}>Read full response →</span>}
      </div>
    </div>
  );
}

// ── Ask Pastor: submit ──
function AskPastorNew({ onBack }) {
  const [text, setText] = React.useState('');
  const [cat, setCat] = React.useState(null);
  const [privacy, setPrivacy] = React.useState('public');
  const [urgent, setUrgent] = React.useState(false);
  const ready = text.trim().length > 4;
  return (
    <div className="surface modal-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px', borderBottom: '1px solid var(--rule-soft)' }}>
        <IconButton icon={Icons.Close} onClick={onBack} label="Close" />
        <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', flex: 1, textAlign: 'center' }}>Ask a question</div>
        <button disabled={!ready} style={{ background: 'none', border: 'none', cursor: ready ? 'pointer' : 'default', fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: 600, color: ready ? 'var(--copper-deep)' : 'var(--ink-faint)', paddingRight: 8 }}>Submit</button>
      </div>
      <div className="scroll" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))}
            placeholder="What's on your heart? Be specific so the pastor can serve you well..."
            style={{ width: '100%', minHeight: 120, resize: 'none', borderRadius: 14, border: '1px solid var(--rule)', background: 'var(--paper)', padding: '14px 16px', fontFamily: 'var(--body)', fontSize: 15, lineHeight: 1.5, color: 'var(--ink)', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--copper)'} onBlur={e => e.target.style.borderColor = 'var(--rule)'} />
          <div style={{ textAlign: 'right', fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>{text.length} / 500</div>
        </div>

        <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Categorize (optional)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {ASK_PASTOR.categories.map(c => {
            const on = cat === c;
            return (
              <button key={c} onClick={() => setCat(on ? null : c)} style={{
                padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500,
                border: '1px solid ' + (on ? 'var(--copper)' : 'var(--rule)'),
                background: on ? 'color-mix(in oklch, var(--copper) 12%, var(--paper))' : 'transparent',
                color: on ? 'var(--copper-deep)' : 'var(--ink-soft)',
              }}>{c}</button>
            );
          })}
        </div>

        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Privacy</div>
        <RadioCard selected={privacy === 'public'} onClick={() => setPrivacy('public')}
          title="Public response (anonymized)"
          desc="Your question helps your house-mates. The pastor's response is posted to the public Q&A feed. Your name is never shown." />
        <RadioCard selected={privacy === 'private'} onClick={() => setPrivacy('private')}
          title="Private response only"
          desc="The pastor responds only to you. The conversation does not appear in the public feed." />

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--rule)', background: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--body)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Mark as urgent (sparingly)</div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 2 }}>Used for genuine crisis situations. The pastor is notified immediately.</div>
          </div>
          <Toggle on={urgent} onClick={() => setUrgent(u => !u)} />
        </div>

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 14, background: 'color-mix(in oklch, var(--copper) 8%, var(--paper))' }}>
          <div style={{ fontFamily: 'var(--body)', fontSize: 12, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
            If you're in immediate emotional crisis, please also reach out to a house leader or call the parish helpline: <strong style={{ color: 'var(--copper-deep)' }}>0810-978-3454</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadioCard({ selected, onClick, title, desc }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', gap: 12, width: '100%', textAlign: 'left', marginBottom: 10,
      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
      border: '1px solid ' + (selected ? 'var(--copper)' : 'var(--rule)'),
      background: selected ? 'color-mix(in oklch, var(--copper) 7%, var(--paper))' : 'var(--paper)',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1, border: selected ? 'none' : '1.5px solid var(--rule)', background: selected ? 'var(--copper)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 12, lineHeight: 1.45, color: 'var(--ink-mute)', marginTop: 3 }}>{desc}</div>
      </div>
    </button>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 42, height: 25, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? 'var(--copper)' : 'var(--rule)', position: 'relative', flexShrink: 0, transition: 'background 200ms ease' }}>
      <div style={{ position: 'absolute', top: 2.5, left: on ? 19.5 : 2.5, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

Object.assign(window, { Announcements, AnnouncementCard, AskPastor, AskPastorNew, ReactionButtons, RadioCard, Toggle });
