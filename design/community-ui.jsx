// Mathetes — community UI primitives (avatars, bubbles, headers, cards).

// ── Filled verified tick ──
function VerifiedBadge({ size = 15, tone = 'var(--copper)', ring }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      width: size, height: size, borderRadius: '50%', background: tone,
      border: ring ? '1.5px solid var(--paper)' : 'none',
    }}>
      <Icons.Check size={size * 0.62} color="#fff" stroke={2.6} />
    </span>
  );
}

// ── Avatar with house ring + badges ──
function HAvatar({ id, member, size = 40, ring, initials, verified, leader, anon, online, group }) {
  const m = member || (id && window.M && window.M[id]) || null;
  if (group && group.length) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {group.slice(0, 3).map((gid, i) => (
          <div key={gid} style={{ marginLeft: i ? -10 : 0, zIndex: 3 - i }}>
            <HAvatar id={gid} size={size} />
          </div>
        ))}
      </div>
    );
  }
  const r = ring || (m && m.ring) || null;
  const init = anon ? 'A' : (initials || (m && m.initials) || '?');
  const ver = verified || (m && m.verified);
  const lead = leader || (m && m.leader);
  const inner = size - 8;
  const bg = anon ? 'var(--rule-soft)' : `color-mix(in oklch, ${r || 'var(--ink-mute)'} 20%, var(--paper))`;
  const fg = anon ? 'var(--ink-mute)' : (r || 'var(--ink-soft)');
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{
        width: inner, height: inner, borderRadius: '50%', background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--display)', fontWeight: 500, fontSize: inner * 0.42,
        boxShadow: r ? `0 0 0 2px var(--paper), 0 0 0 4px ${r}` : 'none',
      }}>{init}</div>
      {ver && (
        <div style={{ position: 'absolute', bottom: -1, right: -1 }}>
          <VerifiedBadge size={Math.round(size * 0.4)} ring />
        </div>
      )}
      {lead && !ver && (
        <div style={{
          position: 'absolute', top: -3, right: -4, width: size * 0.4, height: size * 0.4,
          borderRadius: '50%', background: 'var(--copper)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--paper)',
        }}>
          <Icons.Crown size={size * 0.26} color="#fff" stroke={1.8} />
        </div>
      )}
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%',
          background: 'var(--success)', border: '2px solid var(--paper)',
        }} />
      )}
    </div>
  );
}

// ── Chat header (sticky) ──
function ChatHeader({ onBack, title, sub, subColor, avatar, accent, right, underline }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px 10px 8px',
      background: 'var(--bg)', borderBottom: '1px solid var(--rule-soft)',
      position: 'relative', zIndex: 5,
    }}>
      <IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {avatar}
        <div style={{ minWidth: 0, textAlign: avatar ? 'left' : 'center', flex: avatar ? 'initial' : 1 }}>
          <div className="display" style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          {sub && <div style={{
            fontFamily: 'var(--body)', fontSize: 10.5, fontWeight: 600,
            color: subColor || 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2,
          }}>{sub}</div>}
          {underline && <div style={{ width: 22, height: 2, background: accent || 'var(--copper)', margin: avatar ? '5px 0 0' : '5px auto 0', borderRadius: 2 }} />}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{right}</div>
    </div>
  );
}

// ── Date separator + system message + daily prompt ──
function DateSep({ label }) {
  return (
    <div style={{ textAlign: 'center', margin: '20px 0 14px' }}>
      <span style={{
        fontFamily: 'var(--body)', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)',
        letterSpacing: '0.14em', textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  );
}
function SystemMsg({ text }) {
  return (
    <div style={{ textAlign: 'center', margin: '14px 0' }}>
      <span className="display-italic" style={{ fontSize: 12.5, color: 'var(--ink-mute)' }}>{text}</span>
    </div>
  );
}
function PromptCard({ label, text }) {
  return (
    <div style={{
      margin: '6px auto 18px', maxWidth: 300, textAlign: 'center',
      padding: '16px 20px', borderRadius: 16,
      border: '1px solid color-mix(in oklch, var(--copper) 45%, transparent)',
      background: 'color-mix(in oklch, var(--copper) 6%, var(--paper))',
    }}>
      <div className="eyebrow" style={{ color: 'var(--copper-deep)', fontSize: 9.5, marginBottom: 7 }}>{label}</div>
      <div className="display" style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.25 }}>{text}</div>
    </div>
  );
}

// ── Reaction row (on chat bubbles) ──
function BubbleReactions({ reactions, align }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginTop: 5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
      {reactions.map((r, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 999, background: 'var(--paper)',
          border: '1px solid var(--rule)', fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500,
        }}>
          {r.text ? <span style={{ fontFamily: 'var(--body)' }}>{r.e}</span> : <span>{r.e}</span>}
          <span style={{ color: 'var(--ink-mute)' }}>{r.n}</span>
        </span>
      ))}
    </div>
  );
}

// ── Voice note ──
function VoiceNote({ duration, mine }) {
  const bars = [6, 11, 16, 9, 14, 20, 12, 7, 15, 10, 18, 8, 13, 6, 11, 16, 9];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: mine ? 'var(--copper)' : 'color-mix(in oklch, var(--copper) 16%, var(--paper))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icons.Play size={13} color={mine ? '#fff' : 'var(--copper-deep)'} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 22 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: mine ? 'color-mix(in oklch, var(--copper) 60%, var(--ink))' : 'var(--copper)', opacity: i > 9 ? 0.4 : 0.85 }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--body)', fontSize: 11, color: 'var(--ink-mute)' }}>{duration}</span>
    </div>
  );
}

// ── One chat message (handles every kind) ──
function ChatMessage({ msg }) {
  if (msg.kind === 'date') return <DateSep label={msg.label} />;
  if (msg.kind === 'prompt') return <PromptCard label={msg.label} text={msg.text} />;
  if (msg.kind === 'system') return <SystemMsg text={msg.text} />;

  const m = window.M[msg.who] || {};
  const mine = msg.mine;

  if (mine) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 10 }}>
        <div style={{
          maxWidth: '78%', padding: msg.voice ? '12px 14px' : '10px 14px', borderRadius: 18, borderBottomRightRadius: 6,
          background: 'color-mix(in oklch, var(--copper) 16%, var(--paper))',
          color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.45,
        }}>
          {msg.voice ? <VoiceNote duration={msg.voice} mine /> : msg.text}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-mute)' }}>{msg.time}</span>
          {msg.read && <Icons.CheckCheck size={14} color="var(--copper)" stroke={1.8} />}
        </div>
        {msg.reactions && <BubbleReactions reactions={msg.reactions} align="right" />}
      </div>
    );
  }

  const leaderMsg = msg.leaderMsg;
  return (
    <div style={{ display: 'flex', gap: 9, marginBottom: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 38, flexShrink: 0 }}>
        {!msg.sameAuthor && <HAvatar id={msg.who} size={38} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        {!msg.sameAuthor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</span>
            {leaderMsg && (
              <span style={{
                fontFamily: 'var(--body)', fontSize: 9.5, fontWeight: 600, color: 'var(--copper-deep)',
                border: '1px solid var(--copper)', borderRadius: 999, padding: '1px 7px', letterSpacing: '0.04em',
              }}>Leader</span>
            )}
            <span style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-mute)' }}>{msg.time}</span>
          </div>
        )}
        <div style={{
          display: 'inline-block', maxWidth: '90%',
          padding: msg.voice ? '12px 14px' : '10px 14px', borderRadius: 18, borderTopLeftRadius: msg.sameAuthor ? 18 : 6,
          background: 'var(--paper)', border: '1px solid var(--rule-soft)',
          borderLeft: leaderMsg ? '2px solid var(--copper)' : undefined,
          color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.45,
          boxShadow: leaderMsg ? 'var(--shadow-soft)' : 'none',
        }}>
          {msg.voice ? <VoiceNote duration={msg.voice} /> : msg.text}
        </div>
        {msg.reactions && <BubbleReactions reactions={msg.reactions} />}
      </div>
    </div>
  );
}

// ── Chat input bar ──
function ChatInputBar({ placeholder }) {
  const [val, setVal] = React.useState('');
  return (
    <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--rule-soft)', padding: '10px 12px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button aria-label="Add" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--paper-raised)', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icons.Plus size={18} stroke={1.8} />
        </button>
        <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          style={{
            flex: 1, height: 40, borderRadius: 999, border: '1px solid var(--rule)',
            background: 'var(--paper)', padding: '0 16px', fontFamily: 'var(--body)', fontSize: 14,
            color: 'var(--ink)', outline: 'none',
          }} />
        <button aria-label="Send" style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: val.trim() ? 'var(--copper)' : 'var(--paper-raised)',
          color: val.trim() ? '#fff' : 'var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'background 160ms ease',
        }}>
          <Icons.Send size={17} stroke={1.8} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 18, paddingLeft: 44, marginTop: 8 }}>
        <Icons.Mic size={17} color="var(--ink-mute)" stroke={1.6} />
        <Icons.Camera size={17} color="var(--ink-mute)" stroke={1.6} />
        <Icons.Smile size={17} color="var(--ink-mute)" stroke={1.6} />
      </div>
    </div>
  );
}

// ── Oversight note (pastoral visibility footer) ──
function OversightNote({ text }) {
  return (
    <div style={{
      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 7,
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <Icons.Eye size={12} color="var(--ink-faint)" stroke={1.6} />
      <span style={{ fontFamily: 'var(--body)', fontSize: 10.5, color: 'var(--ink-faint)', textAlign: 'center' }}>{text}</span>
    </div>
  );
}

// ── Pinned message banner ──
function PinnedBanner({ verse, cite, accent, onHow }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px',
      background: `color-mix(in oklch, ${accent || 'var(--copper)'} 8%, var(--paper))`,
      borderBottom: '1px solid var(--rule-soft)',
    }}>
      <Icons.Pin size={15} color={accent || 'var(--copper-deep)'} stroke={1.7} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display-italic" style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.35 }}>
          “{verse}”
        </div>
        <div style={{ fontFamily: 'var(--body)', fontSize: 9.5, fontWeight: 600, color: accent || 'var(--copper-deep)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{cite}</div>
      </div>
      {onHow && <button onClick={onHow} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 11, color: 'var(--copper-deep)', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' }}>How we speak here →</button>}
    </div>
  );
}

// ── Section label (small caps) ──
function SectionLabel({ children, style }) {
  return (
    <div className="eyebrow" style={{ padding: '20px 18px 8px', ...style }}>{children}</div>
  );
}

// ── Praying button ──
function PrayingButton({ count, prayed, onClick, tone }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px',
      borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 13, fontWeight: 600,
      border: '1px solid ' + (prayed ? 'transparent' : 'var(--rule)'),
      background: prayed ? (tone || 'var(--copper)') : 'transparent',
      color: prayed ? '#fff' : 'var(--ink)',
    }}>
      <span>🙏</span>
      <span>{prayed ? 'Praying' : 'Pray'}</span>
      <span style={{ opacity: 0.75 }}>{count}</span>
    </button>
  );
}

Object.assign(window, {
  HAvatar, VerifiedBadge, ChatHeader, DateSep, SystemMsg, PromptCard, BubbleReactions, VoiceNote,
  ChatMessage, ChatInputBar, OversightNote, PinnedBanner, SectionLabel, PrayingButton,
});
