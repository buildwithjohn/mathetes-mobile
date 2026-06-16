// Mathetes — App shell, splash, router, Tweaks panel

const ROUTE_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "copper",
  "readingSize": 18,
  "showTweaks": true,
  "startScreen": "today"
}/*EDITMODE-END*/;

function ScreenRouter({ screen, param, goto, back, reset, dark, setDark, accent, setAccent, readingSize, setReadingSize }) {
  switch (screen) {
    case 'splash': return <Splash />;
    case 'welcome': return <Welcome onContinue={() => goto('signin')} />;
    case 'signin': return <SignIn onContinue={() => goto('house')} onBack={back} />;
    case 'house': return <HouseSelect onContinue={() => goto('notify')} onBack={back} />;
    case 'notify': return <NotificationPermission onContinue={() => reset('today')} onBack={back} />;
    case 'empty': return <EmptyStatesGallery onBack={back} />;

    case 'today': return <TodayScreen goto={goto} dark={dark} />;
    case 'bible': return <BibleScreen goto={goto} />;
    case 'profile': return <ProfileScreen goto={goto} dark={dark} setDark={setDark}
      accent={accent} setAccent={setAccent} readingSize={readingSize} setReadingSize={setReadingSize} />;

    case 'word': return <WordExpanded onBack={back} />;
    case 'devotional': return <DevotionalScreen onBack={back} goto={goto} />;
    case 'verse-image': return <VerseImageScreen onBack={back} />;
    case 'settings': return <ProfileScreen goto={goto} dark={dark} setDark={setDark}
      accent={accent} setAccent={setAccent} readingSize={readingSize} setReadingSize={setReadingSize} />;

    // ── community layer ──
    case 'community': return <CommunityHome goto={goto} />;
    case 'notifications': return <NotificationCenter onBack={back} goto={goto} />;
    case 'house-chat': return <HouseChat onBack={back} goto={goto} />;
    case 'announcements': return <Announcements onBack={back} />;
    case 'ask-pastor': return <AskPastor onBack={back} goto={goto} />;
    case 'ask-new': return <AskPastorNew onBack={back} />;
    case 'discipler': return <DisciplerChat onBack={back} />;
    case 'dm': return <DMChat onBack={back} goto={goto} param={param} />;
    case 'prayer-wall': return <PrayerWall onBack={back} goto={goto} />;
    case 'members': return <MembersDirectory onBack={back} goto={goto} />;
    case 'public-profile': return <PublicProfile onBack={back} goto={goto} param={param} />;
    case 'privacy': return <PrivacySettings onBack={back} />;
    case 'edit-profile': return <ProfilePhotoEdit onBack={back} />;
    case 'showcase': return <CommunityShowcase onBack={back} />;

    default: return <TodayScreen goto={goto} dark={dark} />;
  }
}

function Splash() {
  return (
    <div className="surface" style={{
      background: 'var(--bg)', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
        position: 'relative',
      }}>
        {/* copper glow */}
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in oklch, var(--copper) 45%, transparent) 0%, transparent 70%)',
          animation: 'glow 2.4s ease-out forwards',
        }} />
        <style>{`
          @keyframes glow {
            0% { opacity: 0; transform: scale(0.6); }
            40% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.4); }
          }
          @keyframes markIn {
            from { opacity: 0; transform: scale(0.92); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>
        <div style={{ animation: 'markIn 1.2s ease-out forwards', zIndex: 1 }}>
          <Wordmark size={36} />
        </div>
        <div className="display-italic reveal-line" style={{
          fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.04em',
          animationDelay: '900ms', zIndex: 1,
        }}>Follow daily.</div>
      </div>
    </div>
  );
}

function MathetesTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Theme">
        <TweakRadio label="Mode" value={t.dark ? 'dark' : 'light'}
          options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
          onChange={v => setTweak('dark', v === 'dark')} />
        <TweakColor label="Accent"
          value={t.accent}
          options={[
            { value: 'copper', color: '#B87333' },
            { value: 'oxblood', color: '#722F37' },
            { value: 'forest', color: '#5A7C5A' },
          ]}
          onChange={v => setTweak('accent', v)} />
      </TweakSection>
      <TweakSection title="Reading">
        <TweakSlider label="Bible size" min={14} max={22} step={1}
          value={t.readingSize} onChange={v => setTweak('readingSize', v)} unit="px" />
      </TweakSection>
      <TweakSection title="Daily loop">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['splash','Splash'],['welcome','Welcome'],['signin','Sign in'],
            ['house','Houses'],['notify','Notify'],['today','Today'],
            ['word','Word of Day'],['devotional','Devotional'],['bible','Bible'],
            ['verse-image','Share verse'],['profile','Profile'],['empty','Empty states'],
          ].map(([k, l]) => (
            <TweakButton key={k} onClick={() => window.__mathetesGo?.(k)}>{l}</TweakButton>
          ))}
        </div>
      </TweakSection>
      <TweakSection title="Community">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['community','Inbox'],['house-chat','House chat'],['announcements','Announcements'],
            ['ask-pastor','Ask Pastor'],['ask-new','Ask: new'],['discipler','Discipler'],
            ['dm','DM'],['prayer-wall','Prayer wall'],['members','Members'],
            ['public-profile','Public profile'],['privacy','Privacy'],['edit-profile','Edit profile'],
            ['notifications','Notifications'],['showcase','Components'],
          ].map(([k, l]) => (
            <TweakButton key={k} onClick={() => window.__mathetesGo?.(k)}>{l}</TweakButton>
          ))}
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

function MathetesApp() {
  const [t, setTweak] = useTweaks(ROUTE_DEFAULTS);
  const [stack, setStack] = React.useState(['splash']);
  const [navParam, setNavParam] = React.useState(null);
  const screen = stack[stack.length - 1];
  const goto = React.useCallback((s, p) => {
    if (p !== undefined) setNavParam(p);
    setStack(prev => [...prev, s]);
  }, []);
  const back = React.useCallback(() => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev), []);
  const reset = React.useCallback((s) => setStack([s]), []);

  // expose for tweak jump-to: replaces stack
  React.useEffect(() => { window.__mathetesGo = (s, p) => { if (p !== undefined) setNavParam(p); setStack([s]); }; }, []);

  React.useEffect(() => {
    if (screen === 'splash') {
      const id = setTimeout(() => setStack(['welcome']), 2200);
      return () => clearTimeout(id);
    }
  }, [screen]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-accent', t.accent);
    document.documentElement.style.setProperty('--reading-size', t.readingSize + 'px');
  }, [t.dark, t.accent, t.readingSize]);

  const tab = ['today','bible','community','profile'].includes(screen) ? screen : null;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(circle at 30% 20%, #34302d 0%, #1a1817 80%)',
    }}>
      <IOSDevice width={392} height={848} dark={t.dark}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          background: 'var(--bg)', color: 'var(--ink)',
          fontFamily: 'var(--body)',
        }}>
          <div style={{ height: 54, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <ScreenRouter screen={screen} param={navParam} goto={goto} back={back} reset={reset}
              dark={t.dark} setDark={(d) => setTweak('dark', d)}
              accent={t.accent} setAccent={(a) => setTweak('accent', a)}
              readingSize={t.readingSize} setReadingSize={(r) => setTweak('readingSize', r)} />
          </div>
          {tab && <TabBar value={tab} onChange={k => setStack([k])} />}
          {!tab && <div style={{ height: 16, flexShrink: 0, background: 'var(--bg)' }} />}
        </div>
      </IOSDevice>

      {t.showTweaks && <MathetesTweaks t={t} setTweak={setTweak} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MathetesApp />);
