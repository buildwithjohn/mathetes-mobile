// Mathetes — Bible reader + Verse image generator

// ─── Bible reader ─────────────────────────────────────────────
function BibleScreen({ goto }) {
  const [translation, setTranslation] = React.useState(BIBLE.translation);
  const [verses, setVerses] = React.useState(BIBLE.verses);
  const [selected, setSelected] = React.useState(null);
  const [showNav, setShowNav] = React.useState(false);
  const [showTrans, setShowTrans] = React.useState(false);

  const verseEl = (v) => {
    const isSel = selected === v.n;
    let bg = 'transparent';
    if (isSel) bg = 'color-mix(in oklch, var(--copper) 18%, transparent)';
    else if (v.highlight === 'gold') bg = 'color-mix(in oklch, var(--copper) 14%, transparent)';
    else if (v.highlight === 'strong') bg = 'color-mix(in oklch, var(--copper) 26%, transparent)';

    return (
      <span key={v.n} onClick={() => setSelected(isSel ? null : v.n)}
        style={{
          display: 'inline', padding: '0 1px', borderRadius: 3, cursor: 'pointer',
          background: bg, color: 'var(--ink)',
          transition: 'background 200ms ease',
        }}>
        <sup style={{
          fontFamily: 'var(--body)', fontSize: 11, fontWeight: 600,
          color: isSel ? 'var(--oxblood)' : 'var(--copper-deep)',
          marginRight: 4, verticalAlign: 'super', letterSpacing: '0.02em',
        }}>{v.n}</sup>
        {v.text}{' '}
      </span>
    );
  };

  return (
    <div className="surface fade-page">
      {/* Slim top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px',
      }}>
        <button onClick={() => setShowNav(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 999, background: 'transparent', border: '1px solid var(--rule)',
          fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)',
          fontWeight: 500, cursor: 'pointer',
        }}>
          <span>{BIBLE.ref}</span>
          <Icons.ChevronDown size={14} stroke={2} color="var(--ink-mute)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setShowTrans(true)} style={{
            padding: '8px 12px', borderRadius: 999, background: 'transparent',
            border: '1px solid var(--rule)', fontFamily: 'var(--body)',
            fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500,
            letterSpacing: '0.06em', cursor: 'pointer',
          }}>{translation}</button>
          <IconButton icon={Icons.Search} label="Search" />
        </div>
      </div>

      {/* Reader */}
      <div className="scroll" style={{ padding: '12px 28px 120px' }}>
        <div className="eyebrow" style={{ textAlign: 'center', marginTop: 12, marginBottom: 8 }}>
          The Gospel according to <span className="display-italic" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, color: 'var(--ink-soft)' }}>{BIBLE.book}</span>
        </div>
        <h2 className="display" style={{
          textAlign: 'center', fontSize: 38, fontWeight: 400, margin: '4px 0 6px',
          color: 'var(--ink)',
        }}>{BIBLE.chapter}</h2>
        <div style={{
          width: 60, height: 1, background: 'var(--copper)', opacity: 0.5,
          margin: '0 auto 24px',
        }} />

        <p style={{
          fontFamily: 'var(--read)', fontSize: 'var(--reading-size)',
          lineHeight: 'var(--reading-leading)', color: 'var(--ink)',
          textAlign: 'left', textIndent: 0, margin: 0, letterSpacing: '0.005em',
        }}>
          {verses.map(v => verseEl(v))}
        </p>

        {/* footnote-ish */}
        <div style={{
          marginTop: 36, fontSize: 11.5, color: 'var(--ink-mute)',
          fontFamily: 'var(--body)', textAlign: 'center', lineHeight: 1.6,
        }}>
          John 3:1–16 above. Continue reading <span className="gold-link" style={{ fontSize: 11.5 }}>John 3:17–36</span>.
        </div>
      </div>

      {/* Floating action when verse selected */}
      {selected !== null && <VerseActionBar n={selected} onClose={() => setSelected(null)} goto={goto} />}

      {/* Translation switcher */}
      {showTrans && (
        <Sheet onClose={() => setShowTrans(false)} title="Translation">
          {BIBLE.translations.map(t => {
            const locked = t.includes('locked');
            const name = t.replace(' (locked)', '');
            return (
              <button key={t} onClick={() => { if (!locked) { setTranslation(name); setShowTrans(false); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '14px 4px',
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid var(--rule-soft)',
                  textAlign: 'left', cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--paper-raised)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--display)', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500,
                }}>{name.slice(0,3)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>{name}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>
                    {name === 'WEB' ? 'World English Bible · public domain' :
                     name === 'KJV' ? 'King James Version · public domain' :
                     name === 'BSB' ? 'Berean Standard Bible · public domain' :
                     'Available with publisher license'}
                  </div>
                </div>
                {translation === name && <Icons.Check size={18} color="var(--copper)" stroke={2} />}
              </button>
            );
          })}
        </Sheet>
      )}

      {/* Book navigator */}
      {showNav && <BibleNavigator onClose={() => setShowNav(false)} />}
    </div>
  );
}

function VerseActionBar({ n, onClose, goto }) {
  return (
    <div className="slide-up" style={{
      position: 'absolute', left: 12, right: 12, bottom: 16,
      background: 'var(--paper)', borderRadius: 18,
      boxShadow: 'var(--shadow-card)', border: '1px solid var(--rule)',
      padding: '12px 8px', display: 'flex', alignItems: 'center', gap: 4,
      zIndex: 30,
    }}>
      <div style={{
        padding: '0 12px', fontSize: 12, color: 'var(--ink-soft)',
        fontFamily: 'var(--body)', fontWeight: 500,
      }}>
        John 3:<strong style={{ color: 'var(--ink)' }}>{n}</strong>
      </div>
      <div style={{ width: 1, height: 20, background: 'var(--rule)', margin: '0 6px' }} />
      <ActionPill icon={Icons.Highlight} label="Highlight" />
      <ActionPill icon={Icons.Note} label="Note" />
      <ActionPill icon={Icons.Bookmark} label="Save" />
      <ActionPill icon={Icons.Image} label="Share" onClick={() => goto('verse-image')} primary />
      <button onClick={onClose} style={{
        marginLeft: 'auto', width: 32, height: 32, borderRadius: '50%',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icons.Close size={16} />
      </button>
    </div>
  );
}

function ActionPill({ icon: I, label, onClick, primary }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      flex: 1, height: 40, border: 'none', borderRadius: 12, cursor: 'pointer',
      background: primary ? 'var(--copper)' : 'transparent',
      color: primary ? '#fff' : 'var(--ink-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: 'var(--body)', fontSize: 11.5, fontWeight: 500,
      letterSpacing: '0.02em', transition: 'background 160ms ease',
    }}>
      <I size={16} stroke={1.7} />
      <span style={{ display: primary ? 'inline' : 'none' }}>{label}</span>
    </button>
  );
}

function Sheet({ children, onClose, title }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(28,27,26,0.32)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="slide-up" style={{
        width: '100%', background: 'var(--bg)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '14px 22px 28px',
        maxHeight: '70%', overflow: 'auto',
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 2,
          background: 'var(--rule)', margin: '0 auto 16px',
        }} />
        {title && (
          <div className="display" style={{
            fontSize: 19, color: 'var(--ink)', fontWeight: 500,
            marginBottom: 8,
          }}>{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}

function BibleNavigator({ onClose }) {
  const [tab, setTab] = React.useState('NT');
  const NT = ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
  const OT = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'];
  const list = tab === 'NT' ? NT : OT;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }} className="slide-up">
      <TopBar
        left={<IconButton icon={Icons.Close} onClick={onClose} label="Close" />}
        title="Bible"
        right={<IconButton icon={Icons.Search} label="Search" />}
      />
      <div style={{ padding: '0 22px 12px' }}>
        {/* Recent */}
        <div className="eyebrow" style={{ marginTop: 8, marginBottom: 10 }}>Recently read</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { ref: 'John 3', meta: 'today' },
            { ref: 'Proverbs 3', meta: 'yesterday' },
            { ref: 'Psalm 46', meta: '3d' },
            { ref: 'Genesis 28', meta: 'last week' },
          ].map(r => (
            <div key={r.ref} style={{
              padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rule)',
              background: 'var(--paper)', flexShrink: 0,
            }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{r.ref}</div>
              <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{r.meta}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', marginTop: 22, marginBottom: 10,
          borderBottom: '1px solid var(--rule)',
        }}>
          {['OT','NT'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 16px', background: 'transparent', border: 'none',
              fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500,
              color: tab === t ? 'var(--ink)' : 'var(--ink-mute)',
              borderBottom: tab === t ? '2px solid var(--copper)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}>{t === 'OT' ? 'Old Testament' : 'New Testament'}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ padding: '0 22px 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {list.map((b, i) => (
            <button key={b} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 6px', background: 'transparent', border: 'none',
              borderBottom: i < list.length - 1 ? '1px solid var(--rule-soft)' : 'none',
              fontFamily: 'var(--body)', fontSize: 15, color: 'var(--ink)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <span>{b}</span>
              <Icons.Chevron size={14} color="var(--ink-faint)" stroke={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Verse Image Generator (3 themes) ─────────────────────────
function VerseImageScreen({ onBack }) {
  const [theme, setTheme] = React.useState('minimal');
  const [aspect, setAspect] = React.useState('square'); // square | story
  const [watermark, setWatermark] = React.useState(true);

  return (
    <div className="surface modal-page" style={{ background: 'var(--bg)' }}>
      <TopBar
        left={<IconButton icon={Icons.ChevronLeft} onClick={onBack} label="Back" />}
        title="Share verse"
        right={<IconButton icon={Icons.More} label="More" />}
      />

      <div className="scroll" style={{ padding: '4px 22px 24px' }}>
        {/* live preview */}
        <div style={{
          padding: 22, marginTop: 6, borderRadius: 22,
          background: 'var(--paper-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: aspect === 'square' ? 320 : 460,
        }}>
          <div style={{
            width: aspect === 'square' ? 280 : 220,
            height: aspect === 'square' ? 280 : 392, // 1080x1920 ratio
            position: 'relative', overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 1px 0 rgba(28,27,26,0.04), 0 24px 36px -22px rgba(28,27,26,0.4)',
            transition: 'all 350ms cubic-bezier(.2,.7,.2,1)',
          }}>
            <VersePreview theme={theme} aspect={aspect} watermark={watermark} />
          </div>
        </div>

        {/* Theme picker */}
        <div className="eyebrow" style={{ marginTop: 26, marginBottom: 10 }}>Theme</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { id: 'minimal', name: 'Minimal' },
            { id: 'organic', name: 'Organic' },
            { id: 'bold', name: 'Bold' },
          ].map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              style={{
                flexShrink: 0, padding: 6, borderRadius: 12,
                border: '1.5px solid ' + (theme === t.id ? 'var(--copper)' : 'var(--rule)'),
                background: theme === t.id ? 'var(--paper)' : 'transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, transition: 'all 220ms ease',
              }}>
              <div style={{ width: 78, height: 78, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                <VersePreview theme={t.id} aspect="square" watermark={false} mini />
              </div>
              <div style={{
                fontFamily: 'var(--body)', fontSize: 11.5, fontWeight: 500,
                color: theme === t.id ? 'var(--ink)' : 'var(--ink-mute)',
                paddingBottom: 2,
              }}>{t.name}</div>
            </button>
          ))}
        </div>

        {/* Aspect */}
        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>Aspect</div>
        <div className="seg">
          <button aria-pressed={aspect === 'square'} onClick={() => setAspect('square')}>Square</button>
          <button aria-pressed={aspect === 'story'} onClick={() => setAspect('story')}>Story</button>
        </div>

        {/* Watermark */}
        <button onClick={() => setWatermark(w => !w)} style={{
          marginTop: 18, width: '100%', padding: '14px 16px',
          borderRadius: 14, border: '1px solid var(--rule)',
          background: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>Show Mathetes mark</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>A small wordmark in the corner</div>
          </div>
          <div style={{
            width: 40, height: 24, borderRadius: 999,
            background: watermark ? 'var(--copper)' : 'var(--rule)',
            position: 'relative', transition: 'background 200ms ease',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: watermark ? 18 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 200ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </button>
      </div>

      <div style={{
        padding: '12px 22px 24px',
        borderTop: '1px solid var(--rule-soft)', background: 'var(--bg)',
        display: 'flex', gap: 10,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1, height: 50 }}>Save to device</button>
        <button className="btn" style={{
          flex: 2, height: 50, background: 'var(--copper)', color: '#fff',
        }}>
          <Icons.Send size={16} stroke={1.7} /> <span>Share</span>
        </button>
      </div>
    </div>
  );
}

function VersePreview({ theme, aspect, watermark, mini }) {
  const verseShort = SHARE_VERSE.shortText;
  const verseLong = SHARE_VERSE.text;
  const ref = SHARE_VERSE.ref;
  const fontMain = mini ? 8 : (aspect === 'story' ? 16 : 18);
  const refSize = mini ? 5.5 : 10;

  if (theme === 'minimal') {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#F5F1EB',
        padding: mini ? 6 : (aspect === 'story' ? 22 : 22),
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative',
      }}>
        <div style={{ height: aspect === 'story' ? '38%' : '40%' }} />
        <div className="display" style={{
          fontFamily: 'Fraunces, Georgia, serif', fontWeight: 400,
          fontSize: fontMain, lineHeight: 1.26, color: '#1C1B1A',
          letterSpacing: '-0.012em',
        }}>“{aspect === 'story' ? verseLong : verseShort}”</div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: refSize, fontWeight: 600,
          color: '#B87333', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>{ref}</div>
        {watermark && !mini && (
          <div style={{
            position: 'absolute', bottom: 12, right: 14,
            fontFamily: 'Fraunces, serif', fontSize: 9,
            color: '#1C1B1A', opacity: 0.18, letterSpacing: '0.12em',
          }}>mathetes</div>
        )}
      </div>
    );
  }

  if (theme === 'organic') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#F0E9DB',
        padding: mini ? 6 : 20,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* paper grain */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
          background:
            "repeating-linear-gradient(132deg, rgba(184,115,51,0.05) 0 1px, transparent 1px 7px)",
        }} />
        {/* corner motif */}
        <svg viewBox="0 0 60 60" width={mini ? 18 : 50} height={mini ? 18 : 50}
          style={{ position: 'absolute', top: mini ? 4 : 12, left: mini ? 4 : 12, opacity: 0.6 }}>
          <path d="M5 30 Q 30 5 55 30 Q 30 55 5 30 Z" fill="none" stroke="#B87333" strokeWidth="1"/>
          <circle cx="30" cy="30" r="3" fill="#B87333"/>
        </svg>
        <div style={{ position: 'relative' }}>
          <div className="display-italic" style={{
            fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontWeight: 400,
            fontSize: fontMain, lineHeight: 1.3, color: '#1C1B1A',
          }}>“{verseShort}”</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: mini ? 6 : 14,
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: refSize, fontWeight: 600,
              color: '#B87333', letterSpacing: '0.18em', textTransform: 'uppercase',
              borderBottom: '1px solid #B87333', paddingBottom: 1,
            }}>{ref}</span>
          </div>
        </div>
        {watermark && !mini && (
          <div style={{
            position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center',
            fontFamily: 'Fraunces, serif', fontSize: 9,
            color: '#1C1B1A', opacity: 0.3, letterSpacing: '0.16em',
          }}>· mathetes ·</div>
        )}
      </div>
    );
  }

  // bold
  return (
    <div style={{
      width: '100%', height: '100%', background: '#F5F1EB',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{
        flex: '0 0 60%', background: '#722F37',
        padding: mini ? 6 : (aspect === 'story' ? 22 : 22),
        display: 'flex', alignItems: 'flex-end',
      }}>
        <div className="display" style={{
          fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500,
          fontSize: mini ? 9 : (aspect === 'story' ? 20 : 21), lineHeight: 1.1,
          color: '#F5F1EB', letterSpacing: '-0.02em',
        }}>“{verseShort}”</div>
      </div>
      <div style={{
        flex: '1', padding: mini ? 6 : 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: mini ? 7 : 13, fontWeight: 700,
          color: '#B87333', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>{ref}</div>
        {watermark && !mini && (
          <div style={{
            marginTop: 'auto', fontFamily: 'Fraunces, serif',
            fontSize: 11, color: '#1C1B1A', opacity: 0.4, letterSpacing: '0.16em',
            textAlign: 'right',
          }}>mathetes</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  BibleScreen, VerseImageScreen, VersePreview, BibleNavigator, Sheet,
});
