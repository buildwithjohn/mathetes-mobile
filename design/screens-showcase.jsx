// Mathetes — community component showcase (v3)

function CommunityShowcase({ onBack }) {
  const Lbl = ({ children }) => (
    <div className="eyebrow" style={{ marginTop: 28, marginBottom: 12 }}>{children}</div>
  );
  const houses = Object.entries(HC);
  return (
    <div className="surface modal-page">
      <SettingsHeader onBack={onBack} title="Components · v3" />
      <div className="scroll" style={{ padding: '8px 20px 40px' }}>
        <p style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink-mute)', marginTop: 8, lineHeight: 1.5 }}>
          The community layer system. Every surface is built from these parts.
        </p>

        <Lbl>Avatars · house rings</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {houses.map(([name, color]) => (
            <div key={name} style={{ textAlign: 'center' }}>
              <HAvatar initials={name.slice(0, 2).toUpperCase()} ring={color} size={42} />
              <div style={{ fontFamily: 'var(--body)', fontSize: 9, color: 'var(--ink-mute)', marginTop: 4, textTransform: 'capitalize' }}>{name}</div>
            </div>
          ))}
        </div>

        <Lbl>Avatars · states</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <AvDemo label="Initials"><HAvatar id="daniel" size={44} /></AvDemo>
          <AvDemo label="Verified"><HAvatar id="pastor" size={44} /></AvDemo>
          <AvDemo label="Leader"><HAvatar id="tope" size={44} /></AvDemo>
          <AvDemo label="Online"><HAvatar id="esther" size={44} online /></AvDemo>
          <AvDemo label="Anonymous"><HAvatar anon size={44} /></AvDemo>
          <AvDemo label="Group"><HAvatar group={['daniel', 'esther', 'david']} size={38} /></AvDemo>
        </div>

        <Lbl>Chat bubbles</Lbl>
        <div style={{ background: 'var(--paper-raised)', borderRadius: 16, padding: '14px 14px 4px' }}>
          <ChatMessage msg={{ kind: 'msg', who: 'daniel', time: '7:14 AM', text: 'The disciple is one who keeps coming back.' }} />
          <ChatMessage msg={{ kind: 'msg', who: 'esther', time: '7:15 AM', sameAuthor: true, text: 'Amen to that 🙏', reactions: [{ e: '🙏', n: 4 }, { e: 'Amen', n: 3, text: true }] }} />
          <ChatMessage msg={{ kind: 'msg', who: 'david', time: '7:22 AM', voice: '0:38' }} />
          <ChatMessage msg={{ kind: 'msg', who: 'you', mine: true, time: '7:45 AM', read: true, text: 'Saving this one.' }} />
          <ChatMessage msg={{ kind: 'msg', who: 'tope', time: '8:02 AM', leaderMsg: true, text: 'See you Thursday at 5 PM in the chapel.' }} />
        </div>

        <Lbl>Daily prompt + date marker</Lbl>
        <div style={{ background: 'var(--paper-raised)', borderRadius: 16, padding: '8px 14px' }}>
          <DateSep label="TODAY · TUESDAY, MAY 12" />
          <PromptCard label="DAILY PROMPT · 6:30 AM" text="What stood out from today's Word?" />
        </div>

        <Lbl>Prayer + reactions</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <PrayingButton count={23} />
          <PrayingButton count={24} prayed />
        </div>
        <div style={{ marginTop: 12 }}>
          <ReactionButtons reactions={[{ e: '🙏', label: 'Praying', n: 47 }, { e: '❤️', label: 'Amen', n: 23 }, { e: '✋', label: 'Got it', n: 89 }]} />
        </div>

        <Lbl>Pinned banner</Lbl>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule-soft)' }}>
          <PinnedBanner verse={HOUSE.verse} cite="Acts 17:11 · House verse" accent={HC.berea} onHow={() => {}} />
        </div>

        <Lbl>DM preview row</Lbl>
        <div className="card" style={{ overflow: 'hidden' }}>
          <InboxItem item={INBOX.today[0]} onClick={() => {}} />
        </div>

        <Lbl>Prayer request cards</Lbl>
        <PrayerCard p={PRAYER_WALL.sections[0].items[0]} />
        <PrayerCard p={PRAYER_WALL.sections[0].items[1]} />
        <PrayerCard p={PRAYER_WALL.sections[1].items[1]} />

        <Lbl>Announcement card</Lbl>
        <AnnouncementCard a={ANNOUNCEMENTS[1]} />

        <Lbl>Chat input bar</Lbl>
        <div style={{ border: '1px solid var(--rule-soft)', borderRadius: 14, overflow: 'hidden' }}>
          <ChatInputBar placeholder="Message Berea..." />
        </div>

        <Lbl>Oversight notice</Lbl>
        <div style={{ border: '1px solid var(--rule-soft)', borderRadius: 14, padding: '4px 0' }}>
          <OversightNote text="Your conversations are visible to Pastor Tunde for pastoral oversight." />
        </div>

        <Lbl>Tab bar · states</Lbl>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['today', 'bible', 'community', 'profile'].map(v => (
            <div key={v} style={{ border: '1px solid var(--rule-soft)', borderRadius: 14, overflow: 'hidden' }}>
              <TabBar value={v} onChange={() => {}} communityUnread={v === 'community' ? 3 : 3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AvDemo({ label, children }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {children}
      <div style={{ fontFamily: 'var(--body)', fontSize: 9.5, color: 'var(--ink-mute)', marginTop: 5 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { CommunityShowcase, AvDemo });
