// Mathetes — onboarding flow: Welcome, Sign in, House fellowship selection

function Welcome({ onContinue }) {
  return (
    <div className="surface" style={{ background: 'var(--bg)' }}>
      {/* Quiet morning paper texture: very subtle */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Top mark */}
        <div style={{ paddingTop: 100, paddingLeft: 28, paddingRight: 28 }}>
          <Wordmark />
        </div>

        {/* Centerpiece */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Follow daily</div>
          <h1 className="display" style={{
            fontSize: 44, lineHeight: 1.05, margin: 0,
            color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em',
          }}>
            <span className="reveal-line" style={{ animationDelay: '60ms' }}>A discipleship </span>
            <span className="display-italic reveal-line" style={{ animationDelay: '220ms', color: 'var(--gold-deep)' }}>companion</span>
            <span className="reveal-line" style={{ animationDelay: '380ms' }}>, </span>
            <br/>
            <span className="reveal-line" style={{ animationDelay: '500ms' }}>not a content stream.</span>
          </h1>
          <p className="reveal-line" style={{
            animationDelay: '720ms',
            marginTop: 22, color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.55,
            maxWidth: 320,
          }}>
            For students who want to be formed, not informed. Walk a daily path with the
            cloud of witnesses who came before.
          </p>
        </div>

        {/* Bottom: actions */}
        <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-ink" onClick={onContinue} style={{ width: '100%', height: 54, fontSize: 16 }}>
            Begin
          </button>
          <button className="btn btn-ghost" onClick={onContinue} style={{ width: '100%', height: 54, fontSize: 15 }}>
            I already have an account
          </button>
          <p className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {PARISH.abbr} · {PARISH.campus}
          </p>
        </div>
      </div>
    </div>
  );
}

function Wordmark({ size = 22, mute }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="13" fill="none" stroke={mute ? 'var(--ink-mute)' : 'var(--gold)'} strokeWidth="0.8" opacity="0.6"/>
        <path d="M8 18 L8 10 L14 16 L20 10 L20 18" fill="none" stroke={mute ? 'var(--ink-mute)' : 'var(--ink)'} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx="14" cy="20.5" r="0.9" fill={mute ? 'var(--ink-mute)' : 'var(--gold)'}/>
      </svg>
      <span className="display" style={{
        fontSize: size * 0.92, color: mute ? 'var(--ink-mute)' : 'var(--ink)',
        letterSpacing: '0.005em', fontWeight: 500,
      }}>mathetes</span>
    </div>
  );
}

function SignIn({ onContinue, onBack }) {
  const [method, setMethod] = React.useState(null);
  return (
    <div className="surface fade-page">
      <TopBar
        left={<IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />}
        title=""
      />
      <div className="scroll" style={{ padding: '0 28px' }}>
        <div className="eyebrow" style={{ marginTop: 16 }}>Step 1 of 2</div>
        <h1 className="display" style={{ fontSize: 32, lineHeight: 1.12, margin: '6px 0 8px', fontWeight: 500 }}>
          Make a place to <span className="display-italic" style={{ color: 'var(--gold-deep)' }}>return to</span>.
        </h1>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, marginTop: 0 }}>
          Your notes, your highlights, your streak, all kept quietly. Sign in once, return any morning.
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ProviderButton icon="g" label="Continue with Google" onClick={() => { setMethod('google'); setTimeout(onContinue, 600); }} active={method === 'google'} />
          <ProviderButton icon="" label="Continue with Apple" onClick={() => { setMethod('apple'); setTimeout(onContinue, 600); }} active={method === 'apple'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            <span className="muted" style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </div>
          <FormField label="Email" placeholder="john.akinola@fuoye.edu.ng" />
          <button className="btn btn-ink" style={{ marginTop: 8, height: 52 }} onClick={onContinue}>
            Send a sign-in link
          </button>
        </div>

        <div style={{ marginTop: 36, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--rule)', background: 'var(--paper)' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-deep)', marginBottom: 6 }}>A note</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>
            Mathetes never sells your reading. Your notes are private to you and your group leader, only if you choose.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProviderButton({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} className="btn btn-ghost" style={{
      height: 54, justifyContent: 'flex-start', paddingLeft: 16, fontSize: 15,
      background: active ? 'var(--rule-soft)' : 'var(--paper)',
      borderColor: active ? 'var(--gold)' : 'var(--rule)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6, marginRight: 12,
        background: 'var(--bg)', border: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)',
      }}>{icon || ''}</div>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </button>
  );
}

function FormField({ label, placeholder, value, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
      <input
        type="text" placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        style={{
          height: 50, borderRadius: 12, border: '1px solid var(--rule)',
          background: 'var(--paper)', padding: '0 14px',
          fontFamily: 'var(--body)', fontSize: 15, color: 'var(--ink)', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--rule)'}
      />
    </label>
  );
}

function HouseSelect({ onContinue, onBack }) {
  const [selected, setSelected] = React.useState('berea');
  return (
    <div className="surface fade-page">
      <TopBar left={<IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />} title="" />
      <div className="scroll" style={{ padding: '0 22px 16px' }}>
        <div className="eyebrow" style={{ marginTop: 28, paddingLeft: 4 }}>Step 2 of 2 · Your house</div>
        <h1 className="display" style={{
          fontSize: 28, lineHeight: 1.16, margin: '8px 0 6px',
          fontWeight: 500, paddingLeft: 4, letterSpacing: '-0.01em',
        }}>Choose your <span className="display-italic" style={{ color: 'var(--copper-deep)' }}>house</span> fellowship.</h1>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 22, paddingLeft: 4 }}>
          This is the group you will grow with.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {window.HOUSES.map(h => {
            const on = selected === h.id;
            return (
              <button key={h.id} onClick={() => setSelected(h.id)}
                style={{
                  position: 'relative', overflow: 'hidden', textAlign: 'left',
                  padding: '15px 16px 15px 22px', borderRadius: 16,
                  background: 'var(--paper)',
                  border: '1px solid ' + (on ? h.color : 'var(--rule)'),
                  cursor: 'pointer',
                  boxShadow: on ? 'var(--shadow-card)' : 'none',
                  transition: 'border-color 200ms ease, box-shadow 200ms ease',
                }}>
                {/* house accent stripe */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                  background: h.color,
                }} />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <div className="display" style={{ fontSize: 23, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.1 }}>
                    {h.name}
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: on ? 'none' : '1.5px solid var(--rule)',
                    background: on ? h.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 180ms ease',
                  }}>
                    {on && <Icons.Check size={13} color="#fff" stroke={2.4} />}
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2, letterSpacing: '0.01em' }}>
                  {h.meaning}
                </div>
                <div className="display-italic" style={{
                  fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.4, marginTop: 10,
                }}>
                  “{h.verse}”
                </div>
                <div style={{
                  fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 600,
                  color: h.color, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6,
                }}>{h.ref}</div>
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--copper-deep)',
            cursor: 'pointer', fontWeight: 500,
          }}>Pre-assigned to a house? Tap here.</span>
        </div>
      </div>
      <div style={{ padding: '12px 22px 24px', borderTop: '1px solid var(--rule-soft)', background: 'var(--bg)' }}>
        <button className="btn btn-ink" style={{ width: '100%', height: 52 }} onClick={onContinue}>
          Join {window.HOUSES.find(h => h.id === selected)?.name}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Welcome, SignIn, HouseSelect, Wordmark });
