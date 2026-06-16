// Mathetes — chat surfaces: House group, Discipler, DM

function useScrollBottom() {
  const ref = React.useRef(null);
  React.useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, []);
  return ref;
}

// ── House group chat ──
function HouseChat({ onBack }) {
  const scrollRef = useScrollBottom();
  return (
    <div className="surface modal-page">
      <ChatHeader
        onBack={onBack}
        title="Berea House"
        sub="12 members · your house"
        subColor={HC.berea}
        accent={HC.berea}
        underline
        right={<><IconButton icon={Icons.Info} label="Info" /><IconButton icon={Icons.MoreVertical} label="More" /></>}
      />
      <PinnedBanner verse={HOUSE.verse} cite="Acts 17:11 · House verse" accent={HC.berea} onHow={() => {}} />
      <div ref={scrollRef} className="scroll" style={{ padding: '14px 16px 8px' }}>
        {HOUSE_CHAT.map((m, i) => <ChatMessage key={i} msg={m} />)}
      </div>
      <ChatInputBar placeholder="Message Berea..." />
    </div>
  );
}

// ── Discipler chat ──
function DisciplerChat({ onBack }) {
  const scrollRef = useScrollBottom();
  const o = DISCIPLER.overview;
  return (
    <div className="surface modal-page">
      <ChatHeader
        onBack={onBack}
        title="Brother Femi Adeyemi"
        sub="Your discipler · 3 months"
        avatar={<HAvatar id="femi" size={36} />}
        right={<><IconButton icon={Icons.Calendar} label="Schedule" /><IconButton icon={Icons.MoreVertical} label="More" /></>}
      />
      <div className="scroll" ref={scrollRef} style={{ padding: '0 0 8px' }}>
        {/* Walk overview */}
        <div style={{ margin: '14px 16px 4px', padding: '16px 18px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--rule-soft)' }}>
          <div className="eyebrow" style={{ color: 'var(--copper-deep)', marginBottom: 10 }}>Walk overview</div>
          <OverviewRow label="Started" value={o.started} />
          <OverviewRow label="Last meeting" value={o.last} />
          <OverviewRow label="Next call" value={o.next} icon={Icons.CalendarPlus} accent />
          <OverviewRow label="Walking through" value={o.walking} last />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px 6px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--rule-soft)' }} />
          <span className="eyebrow" style={{ fontSize: 10 }}>Messages</span>
          <div style={{ flex: 1, height: 1, background: 'var(--rule-soft)' }} />
        </div>
        <div style={{ padding: '4px 16px 0' }}>
          {DISCIPLER.messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
        </div>
      </div>
      <OversightNote text="Your conversations are visible to Pastor Tunde for pastoral oversight." />
      <ChatInputBar placeholder="Message Brother Femi..." />
    </div>
  );
}

function OverviewRow({ label, value, icon: I, accent, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: last ? 'none' : '1px solid var(--rule-soft)' }}>
      <span style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-mute)' }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500, color: accent ? 'var(--copper-deep)' : 'var(--ink)' }}>
        {I && <I size={14} color="var(--copper)" stroke={1.7} />}{value}
      </span>
    </div>
  );
}

// ── DM ──
function DMChat({ onBack, param }) {
  const who = (param && DMS[param]) ? param : 'esther';
  const thread = DMS[who];
  const m = window.M[thread.who];
  const first = m.name.split(' ')[0];
  const scrollRef = useScrollBottom();
  const [showBanner, setShowBanner] = React.useState(!!thread.firstTime);
  return (
    <div className="surface modal-page">
      <ChatHeader
        onBack={onBack}
        title={m.name}
        sub={thread.sub}
        avatar={<HAvatar id={thread.who} size={36} />}
        right={<>
          <span style={{ opacity: 0.4 }}><IconButton icon={Icons.Phone} label="Call (soon)" /></span>
          <IconButton icon={Icons.MoreVertical} label="More" />
        </>}
      />
      {showBanner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'color-mix(in oklch, var(--copper) 7%, var(--paper))', borderBottom: '1px solid var(--rule-soft)' }}>
          <Icons.Lock size={13} color="var(--copper-deep)" stroke={1.6} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.4 }}>
            Your DMs are private. House leader Brother Tope has oversight visibility for pastoral care.
          </span>
          <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)', display: 'flex', flexShrink: 0 }}>
            <Icons.Close size={14} />
          </button>
        </div>
      )}
      <div ref={scrollRef} className="scroll" style={{ padding: '14px 16px 8px' }}>
        {thread.messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
      </div>
      <ChatInputBar placeholder={`Message ${first}...`} />
    </div>
  );
}

Object.assign(window, { HouseChat, DisciplerChat, DMChat, OverviewRow });
