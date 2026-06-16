// Mathetes — Profile + Settings, plus a third onboarding step (notifications)

function ProfileScreen({ goto, dark, setDark, accent, setAccent, readingSize, setReadingSize }) {
  return (
    <div className="surface fade-page">
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="eyebrow">Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => goto('edit-profile')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500, color: 'var(--copper-deep)' }}>Edit</button>
          <button onClick={() => goto('privacy')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)' }}>
            <Icons.Settings size={20} stroke={1.6} />
          </button>
        </div>
      </div>

      <div className="scroll" style={{ padding: '4px 22px 32px' }}>
        {/* header card with house accent stripe */}
        <div className="card" style={{ marginTop: 8, overflow: 'hidden' }}>
          <div style={{ height: 4, background: PROFILE.houseColor }} />
          <div style={{ padding: '20px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--copper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'var(--display)', fontSize: 24, fontWeight: 500,
              }}>{PROFILE.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="display" style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.1 }}>
                  {PROFILE.name}
                </div>
                <div style={{
                  fontFamily: 'var(--body)', fontSize: 11, fontWeight: 600,
                  color: PROFILE.houseColor, letterSpacing: '0.16em', textTransform: 'uppercase',
                  marginTop: 6,
                }}>{PROFILE.houseName} House</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>
                  {PROFILE.parish}
                </div>
              </div>
            </div>
            {/* stats row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 16,
              fontFamily: 'var(--body)', fontSize: 12, color: 'var(--ink-soft)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="13" viewBox="0 0 12 14" fill="var(--copper)">
                  <path d="M6 0.5c.4 1.4 2.4 2.2 2.4 4.4C8.4 6.5 7.4 7 6.4 7c.6-.7.6-1.7 0-2.4C5.4 5.5 4 6.5 4 8.5c0 1.6 1.2 2.6 2.6 2.6.4 1.6 0 2.4-2 2.4C2.4 13.5 1 11.7 1 9.4 1 5.5 5 4.5 6 0.5z" />
                </svg>
                <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{PROFILE.streak}-day</strong> streak
              </span>
              <span style={{ color: 'var(--ink-faint)' }}>·</span>
              <span><strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{PROFILE.bookmarks}</strong> saved</span>
              <span style={{ color: 'var(--ink-faint)' }}>·</span>
              <span><strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{PROFILE.highlights}</strong> highlights</span>
            </div>
          </div>
        </div>

        {/* library */}
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 8, paddingLeft: 4 }}>Your library</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Bookmarks', n: PROFILE.bookmarks, icon: Icons.Bookmark },
            { label: 'Highlights', n: PROFILE.highlights, icon: Icons.Highlight },
            { label: 'Devotionals', n: PROFILE.pastDevotionals, icon: Icons.Book },
          ].map(it => {
            const I = it.icon;
            return (
              <div key={it.label} className="card" style={{ padding: '14px 12px', textAlign: 'left' }}>
                <I size={18} stroke={1.6} color="var(--copper)" />
                <div className="display" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 8, fontWeight: 500 }}>{it.n}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{it.label}</div>
              </div>
            );
          })}
        </div>

        {/* recent notes */}
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 8, paddingLeft: 4 }}>Recent notes</div>
        <div className="card" style={{ padding: '4px 0' }}>
          {PROFILE.recentNotes.map((n, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              borderBottom: i < PROFILE.recentNotes.length - 1 ? '1px solid var(--rule-soft)' : 'none',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4,
              }}>
                <span style={{
                  fontFamily: 'var(--body)', fontSize: 11, fontWeight: 600,
                  color: 'var(--oxblood)', letterSpacing: '0.16em', textTransform: 'uppercase',
                }}>{n.ref}</span>
                <span className="muted" style={{ fontSize: 10.5 }}>{n.date}</span>
              </div>
              <div className="display-italic" style={{
                fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.4,
              }}>“{n.text}”</div>
            </div>
          ))}
        </div>

        {/* account & community */}
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 8, paddingLeft: 4 }}>Account & community</div>
        <div className="card" style={{ padding: '4px 0' }}>
          {[
            { label: 'Edit profile', icon: Icons.Profile, to: 'edit-profile' },
            { label: 'Berea members', icon: Icons.Users, to: 'members' },
            { label: 'Prayer wall', icon: Icons.HandHeart, to: 'prayer-wall' },
            { label: 'Privacy & safety', icon: Icons.Shield, to: 'privacy' },
          ].map((r, i, arr) => {
            const I = r.icon;
            return (
              <button key={r.to} onClick={() => goto(r.to)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: i < arr.length - 1 ? '1px solid var(--rule-soft)' : 'none',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', flexShrink: 0 }}>
                  <I size={17} stroke={1.6} />
                </div>
                <span style={{ flex: 1, fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{r.label}</span>
                <Icons.Chevron size={16} color="var(--ink-faint)" stroke={1.5} />
              </button>
            );
          })}
        </div>

        {/* preferences */}
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 8, paddingLeft: 4 }}>Preferences</div>
        <div className="card" style={{ padding: '4px 0' }}>
          <PrefRow icon={dark ? Icons.Moon : Icons.Sun} label="Theme"
            value={dark ? 'Dark' : 'Light'}
            action={
              <button onClick={() => setDark(!dark)} style={{
                width: 40, height: 24, borderRadius: 999,
                background: dark ? 'var(--copper)' : 'var(--rule)',
                position: 'relative', border: 'none', cursor: 'pointer',
                transition: 'background 200ms ease',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: dark ? 18 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 200ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            } />
          <PrefRow icon={Icons.Bell} label="Word of the Day reminder" value="6:30 AM" />
          <PrefRow icon={Icons.Book} label="Bible reading size" value={`${readingSize}px`}
            action={
              <input type="range" min="14" max="22" step="1" value={readingSize}
                onChange={e => setReadingSize(parseInt(e.target.value, 10))}
                style={{ width: 110, accentColor: 'var(--copper)' }} />
            } divider={false} />
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--oxblood)', fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500,
          }}>Sign out</button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--ink-faint)', fontFamily: 'var(--body)', fontSize: 11 }}>
          Mathetes · v0.4 · Follow daily.
        </div>
      </div>
    </div>
  );
}

function PrefRow({ icon: I, label, value, action, divider = true }) {
  return (
    <div style={{
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: divider ? '1px solid var(--rule-soft)' : 'none',
    }}>
      {I && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--paper-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-soft)',
        }}>
          <I size={17} stroke={1.6} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        {value && <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{value}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── Notification permission (3rd onboarding step) ─────────
function NotificationPermission({ onContinue, onBack }) {
  return (
    <div className="surface fade-page">
      <TopBar left={<IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />} title="" />
      <div className="scroll" style={{ padding: '0 28px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="eyebrow" style={{ marginTop: 16 }}>Almost there</div>
        <h1 className="display" style={{
          fontSize: 30, lineHeight: 1.15, margin: '6px 0 8px', fontWeight: 500,
        }}>One verse, each <span className="display-italic" style={{ color: 'var(--copper-deep)' }}>morning</span>.</h1>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>
          We'll send a single, gentle nudge with your Word of the Day. No marketing, no streak guilt. You can mute it anytime.
        </p>

        {/* Mock device notification */}
        <div style={{
          marginTop: 36, padding: '16px 18px', borderRadius: 18,
          background: 'var(--paper-raised)',
          border: '1px solid var(--rule)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'var(--ink)', color: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500,
            }}>M</div>
            <div className="muted" style={{ fontSize: 11, letterSpacing: '0.04em' }}>MATHETES · 6:30 AM</div>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>
            Word of the Day · Proverbs 3:5
          </div>
          <div className="display-italic" style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            “Trust in the LORD with all thine heart; and lean not unto thine own understanding.”
          </div>
        </div>

        <div style={{ marginTop: 'auto', flex: 1, minHeight: 24 }} />

        {/* Reminder time */}
        <div style={{
          marginTop: 32, marginBottom: 14, display: 'flex', alignItems: 'center',
          gap: 10, padding: '14px 16px', borderRadius: 14,
          background: 'var(--paper)', border: '1px solid var(--rule-soft)',
        }}>
          <Icons.Time size={18} color="var(--ink-soft)" stroke={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>Send at 6:30 AM</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>You can change this in settings.</div>
          </div>
          <Icons.Chevron size={14} color="var(--ink-faint)" stroke={1.5} />
        </div>

        <button className="btn btn-ink" style={{ width: '100%', height: 52, marginTop: 4 }} onClick={onContinue}>
          Allow notifications
        </button>
        <button onClick={onContinue} style={{
          marginTop: 8, height: 44, background: 'transparent',
          border: 'none', color: 'var(--ink-mute)',
          fontFamily: 'var(--body)', fontSize: 13.5, cursor: 'pointer',
        }}>Maybe later</button>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen, NotificationPermission, PrefRow });
