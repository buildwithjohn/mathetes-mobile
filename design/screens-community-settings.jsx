// Mathetes — Privacy & Safety + Profile Photo edit/crop

// ── Profile photo upload / crop (interactive: pre → crop → post) ──
function ProfilePhotoEdit({ onBack }) {
  const [stage, setStage] = React.useState('pre'); // pre | crop | post
  const [vis, setVis] = React.useState('Everyone in parish');
  const hasPhoto = stage === 'post';

  if (stage === 'crop') {
    return (
      <div className="surface modal-page">
        <SettingsHeader onBack={() => setStage('pre')} title="Crop your photo" />
        <div className="scroll" style={{ padding: 0 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'radial-gradient(circle at 50% 38%, #d8b98f 0%, #b98c5e 45%, #6f5235 100%)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,27,26,0.45)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '76%', aspectRatio: '1', borderRadius: '50%', boxShadow: '0 0 0 2000px rgba(28,27,26,0.45)', border: '2px solid rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>selected photo</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 24px 0', fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink-mute)' }}>Drag to position. Pinch to zoom.</div>
        </div>
        <div style={{ padding: '12px 18px 20px', display: 'flex', gap: 10, borderTop: '1px solid var(--rule-soft)' }}>
          <button className="btn btn-ghost" onClick={() => setStage('pre')} style={{ flex: 1, height: 50 }}>Cancel</button>
          <button className="btn" onClick={() => setStage('post')} style={{ flex: 1.4, height: 50, background: 'var(--copper)', color: '#fff' }}>Use photo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface modal-page">
      <SettingsHeader onBack={onBack} title="Edit profile"
        right={<button disabled={!hasPhoto} style={{ background: 'none', border: 'none', cursor: hasPhoto ? 'pointer' : 'default', fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600, color: hasPhoto ? 'var(--copper-deep)' : 'var(--ink-faint)', paddingRight: 8 }}>Save</button>} />
      <div className="scroll" style={{ padding: '24px 22px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* avatar */}
          <div style={{ width: 120, height: 120, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 112, height: 112, borderRadius: '50%',
              background: hasPhoto ? 'radial-gradient(circle at 50% 38%, #d8b98f 0%, #b98c5e 50%, #6f5235 100%)' : 'var(--copper)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontSize: 42, fontWeight: 500,
              boxShadow: `0 0 0 3px var(--paper), 0 0 0 5px ${HC.berea}`,
            }}>{hasPhoto ? '' : 'JA'}</div>
          </div>
          {hasPhoto ? (
            <button onClick={() => setStage('crop')} style={{ marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 13.5, fontWeight: 500, color: 'var(--copper-deep)' }}>Change photo</button>
          ) : (
            <button onClick={() => setStage('crop')} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600, color: 'var(--copper-deep)' }}>
              <Icons.Camera size={16} stroke={1.7} /> Upload photo
            </button>
          )}
          {!hasPhoto && <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--ink-mute)', marginTop: 8 }}>Optional. Default shows your initials.</div>}
        </div>

        {hasPhoto && (
          <div style={{ marginTop: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 8, textAlign: 'center' }}>Who can see your photo</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Everyone in parish', 'House only', 'No one'].map(o => {
                const on = vis === o;
                return (
                  <button key={o} onClick={() => setVis(o)} style={{
                    padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 12.5, fontWeight: 500,
                    border: '1px solid ' + (on ? 'transparent' : 'var(--rule)'),
                    background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--ink-soft)',
                  }}>{o}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* form fields */}
        <div className="card" style={{ marginTop: 24, padding: '4px 0' }}>
          <FieldRow label="Name" value="John Akinola" />
          <FieldRow label="House" value="Berea" locked />
          <FieldRow label="Year & department" value="Year 2 · Computer Science" edit />
          <FieldRow label="Pinned verse" value="Proverbs 3:5" edit last />
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, value, locked, edit, last }) {
  return (
    <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: last ? 'none' : '1px solid var(--rule-soft)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-mute)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 14.5, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
      </div>
      {locked && <Icons.Lock size={15} color="var(--ink-faint)" stroke={1.6} />}
      {edit && <Icons.Note size={15} color="var(--ink-mute)" stroke={1.6} />}
    </div>
  );
}

function SettingsHeader({ onBack, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 8px', borderBottom: '1px solid var(--rule-soft)' }}>
      <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
      <div className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', flex: 1, textAlign: 'center' }}>{title}</div>
      <div style={{ minWidth: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ── Privacy & Safety ──
function PrivacySettings({ onBack }) {
  return (
    <div className="surface modal-page">
      <SettingsHeader onBack={onBack} title="Privacy & Safety" />
      <div className="scroll" style={{ padding: '8px 18px 28px' }}>

        <PrivSection title="Who can see you">
          <PillSetting label="Profile photo" value="Everyone in parish" options={['Everyone in parish', 'House only', 'No one']} />
          <PillSetting label="Year & department" value="House only" options={['Everyone in parish', 'House only', 'No one']} />
          <PillSetting label="Pinned verse" value="Everyone in parish" options={['Everyone in parish', 'House only', 'No one']} />
          <PillSetting label="Prayer requests" value="House only" options={['Everyone in parish', 'House only', 'No one']} last />
        </PrivSection>

        <PrivSection title="Who can reach you">
          <PillSetting label="Direct messages" value="House-mates only" options={['All parish members', 'House-mates only', 'Discipler only', 'No one']} />
          <ToggleSetting label="Cross-gender DMs" sub="Require approval. You approve before someone of the opposite gender can DM you." defaultOn />
          <ToggleSetting label="Mentions in chats" sub="Notify me when mentioned." defaultOn last />
        </PrivSection>

        <PrivSection title="Pastoral oversight">
          <div style={{ padding: '14px 16px', borderRadius: 14, background: 'color-mix(in oklch, var(--copper) 8%, var(--paper))', margin: '0 0 4px' }}>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
              Your house leader Brother Tope has pastoral visibility into your house chat activity and DMs. This is for pastoral care, not surveillance. He can see that conversations are happening; he can only read content when concerns are raised.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 2px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink-faint)' }}>Disable oversight</div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 2 }}>Requires written request to Pastor Tunde</div>
            </div>
            <Icons.Lock size={16} color="var(--ink-faint)" stroke={1.6} />
          </div>
        </PrivSection>

        <PrivSection title="Blocked users">
          <div style={{ padding: '12px 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink-soft)' }}>You have blocked 0 users</span>
            <span style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-faint)' }}>Manage →</span>
          </div>
        </PrivSection>

        <PrivSection title="Report & safety">
          <ActionRow icon={Icons.Flag} color="var(--oxblood)" label="Report a problem" />
          <ActionRow icon={Icons.Phone} color="var(--copper-deep)" label="Crisis support" sub="If you're in immediate crisis, tap to call the parish helpline: 0810-978-3454" />
          <ActionRow icon={Icons.Shield} color="var(--ink-mute)" label="Safety guidelines" last />
        </PrivSection>

        <PrivSection title="Data & memory">
          <ActionRow icon={Icons.Info} color="var(--ink-mute)" label="Your data" />
          <ToggleSetting label="Term-end archive" sub="At the end of each academic term, your chat history is archived. Conversations stay accessible for 60 days, then are removed to keep our community fresh." defaultOn last />
        </PrivSection>

        <div style={{ textAlign: 'center', marginTop: 8, padding: '0 16px' }}>
          <span className="display-italic" style={{ fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
            Mathetes is a space of fellowship and accountability. These settings protect you while preserving the integrity of community.
          </span>
        </div>
      </div>
    </div>
  );
}

function PrivSection({ title, children }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="eyebrow" style={{ padding: '18px 2px 4px' }}>{title}</div>
      <div className="card" style={{ padding: '4px 16px' }}>{children}</div>
    </div>
  );
}

function PillSetting({ label, value, options, last }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(value);
  return (
    <div style={{ padding: '13px 2px', borderBottom: last ? 'none' : '1px solid var(--rule-soft)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>{label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-mute)' }}>
          {val}<Icons.ChevronDown size={14} stroke={1.8} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
          {options.map(o => {
            const on = val === o;
            return (
              <button key={o} onClick={() => { setVal(o); }} style={{
                padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500,
                border: '1px solid ' + (on ? 'transparent' : 'var(--rule)'),
                background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--ink-soft)',
              }}>{o}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, sub, defaultOn, last }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div style={{ padding: '13px 2px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: last ? 'none' : '1px solid var(--rule-soft)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      <Toggle on={on} onClick={() => setOn(v => !v)} />
    </div>
  );
}

function ActionRow({ icon: I, color, label, sub, last }) {
  return (
    <div style={{ padding: '13px 2px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: last ? 'none' : '1px solid var(--rule-soft)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in oklch, ${color} 12%, var(--paper))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <I size={16} color={color} stroke={1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { ProfilePhotoEdit, PrivacySettings, SettingsHeader, FieldRow, PrivSection, PillSetting, ToggleSetting, ActionRow });
