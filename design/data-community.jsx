// Mathetes — community layer content. Names + register reflect a Nigerian
// CCCFSP campus parish. Scripture is KJV. Pidgin / Yoruba used sparingly.

const HOUSE = { id: 'berea', name: 'Berea', color: '#A87C3E', members: 12,
  verse: 'They received the word, and searched the scriptures daily.', verseRef: 'Acts 17:11' };

// house accent colours, for rings
const HC = {
  bethel: '#B87333', antioch: '#722F37', berea: '#A87C3E', bethany: '#7A8A6E',
  zion: '#C9A24A', hebron: '#A85838', salem: '#6B7F8A',
};

const PASTOR = { id: 'pastor', name: 'Pastor Tunde Akinwale', initials: 'TA', ring: HC.antioch,
  role: 'Parish Pastor', verified: true };

const MEMBERS = [
  { id: 'tope',   name: 'Brother Tope Adesanya', initials: 'TA', ring: HC.berea, role: 'House Leader', leader: true,
    year: 'Leader', dept: '3rd year leading', verse: 'Searching the scriptures daily.', verseRef: 'Acts 17:11' },
  { id: 'femi',   name: 'Brother Femi Adeyemi', initials: 'FA', ring: HC.antioch, role: 'Discipler', discipler: true,
    year: 'Year 5', dept: 'Discipler' },
  { id: 'kemi',   name: 'Sister Kemi Olufemi', initials: 'KO', ring: HC.bethany, role: 'Discipler', discipler: true,
    year: 'Year 5', dept: 'Discipler' },
  { id: 'daniel', name: 'Daniel Salami', initials: 'DS', ring: HC.berea, year: 'Year 3', dept: 'Mechanical Engineering',
    verse: 'Be strong and of a good courage; be not afraid, neither be thou dismayed.', verseRef: 'Joshua 1:9',
    streak: 47, days: 120, prayed: 12, joined: 'Joined September 2023' },
  { id: 'david',  name: 'David Okonkwo', initials: 'DO', ring: HC.berea, year: 'Year 2', dept: 'Computer Science' },
  { id: 'esther', name: 'Esther Okafor', initials: 'EO', ring: HC.berea, year: 'Year 2', dept: 'Microbiology' },
  { id: 'faith',  name: 'Faith Olusola', initials: 'FO', ring: HC.berea, year: 'Year 4', dept: 'Law' },
  { id: 'you',    name: 'John Akinola', initials: 'JA', ring: HC.berea, year: 'Year 2', dept: 'Computer Science', you: true },
  { id: 'joshua', name: 'Joshua Bello', initials: 'JB', ring: HC.berea, year: 'Year 3', dept: 'Economics' },
  { id: 'mary',   name: 'Mary Akinwale', initials: 'MA', ring: HC.berea, year: 'Year 1', dept: 'Mass Communication' },
  { id: 'ruth',   name: 'Ruth Adebayo', initials: 'RA', ring: HC.berea, year: 'Year 4', dept: 'Architecture' },
  { id: 'tobi',   name: 'Tobi Adeyemi', initials: 'TA', ring: HC.berea, year: 'Year 2', dept: 'Statistics' },
  { id: 'grace',  name: 'Grace Eze', initials: 'GE', ring: HC.berea, year: 'Year 1', dept: 'Nursing' },
  { id: 'samuel', name: 'Samuel Adeleke', initials: 'SA', ring: HC.berea, year: 'Year 3', dept: 'Physics' },
  { id: 'blessing', name: 'Blessing Udo', initials: 'BU', ring: HC.berea, year: 'Year 1', dept: 'Accounting' },
];
const M = Object.fromEntries([...MEMBERS, PASTOR].map(m => [m.id, m]));

// ── Community inbox ──
const INBOX = {
  pinned: {
    kind: 'announcements', icon: 'Megaphone', tone: HC.antioch, title: 'Parish Announcements',
    preview: 'Mid-week prayer is moved to Chapel A tonight at 7 PM...', time: '2h', badge: 'Pastor',
  },
  today: [
    { id: 'house-chat', kind: 'house', title: 'Berea House', ring: HC.berea,
      group: ['daniel', 'esther', 'david'], preview: 'Daniel: That hit me. Selah.', time: '12m', unread: 3 },
    { id: 'ask-pastor', kind: 'pastor', title: 'Pastor Tunde', verified: true,
      preview: 'Re: Can a Christian still struggle with doubt?', time: '1h' },
    { id: 'discipler', kind: 'discipler', title: 'Brother Femi · Discipler', ring: HC.antioch, initials: 'FA',
      preview: 'Looking forward to our Saturday call.', time: '3h' },
  ],
  earlier: [
    { id: 'dm-esther', kind: 'dm', title: 'Esther Okafor', ring: HC.berea, initials: 'EO',
      preview: 'You: Amen. Praying for the test 🙏', time: 'Yesterday' },
    { id: 'prayer-wall', kind: 'prayer', title: 'Prayer Wall · Berea', tone: HC.bethany,
      preview: '12 new requests this week', time: 'Yesterday' },
    { id: 'dm-joshua', kind: 'dm', title: 'Joshua Bello', ring: HC.berea, initials: 'JB',
      preview: 'Joshua: Send me the verse you mentioned.', time: '2d' },
  ],
};

// ── House group chat (Berea) ──
const HOUSE_CHAT = [
  { kind: 'date', label: 'TODAY · TUESDAY, MAY 12' },
  { kind: 'prompt', label: 'DAILY PROMPT · 6:30 AM', text: 'What stood out from today’s Word?' },
  { kind: 'msg', who: 'daniel', time: '7:14 AM',
    text: 'The “lean not unto thine own understanding” part... I’ve been leaning so hard on my plans this semester. God is humbling me.' },
  { kind: 'msg', who: 'esther', time: '7:15 AM', sameAuthor: true,
    text: 'Daniel that hit me too. I want to share what God said to me about my internship rejection. Selah 🙏',
    reactions: [{ e: '🙏', n: 4 }, { e: '❤️', n: 2 }, { e: 'Amen', n: 3, text: true }] },
  { kind: 'msg', who: 'david', time: '7:22 AM', voice: '0:38' },
  { kind: 'msg', who: 'you', time: '7:45 AM', mine: true, read: true,
    text: 'Davo your voice notes are always Spirit-led. Saving this one.' },
  { kind: 'msg', who: 'tope', time: '8:02 AM', leaderMsg: true,
    text: 'Beloveds, see you Thursday at 5 PM in the chapel. Wear white. Bring your Bibles and your hearts. Brother Daniel will share.' },
  { kind: 'date', label: 'EARLIER · MONDAY, MAY 11' },
  { kind: 'msg', who: 'faith', time: '9:18 PM',
    text: 'Quick prayer request: my mum’s surgery is tomorrow. Stand with me 🙏',
    reactions: [{ e: '🙏', n: 9 }] },
];

// ── Parish announcements ──
const ANNOUNCEMENTS = [
  { date: 'TUESDAY, MAY 12', time: '2 hours ago',
    title: 'Mid-week prayer moved to Chapel A',
    body: 'Beloved CCCFSP family, due to the engineering faculty event in the main hall, tonight’s mid-week prayer service will hold in Chapel A at 7 PM sharp. Come prepared. We will be standing on Psalm 91 over our exams. Pass the word to your house-mates.',
    ref: 'PSALM 91',
    reactions: [{ e: '🙏', label: 'Praying', n: 47 }, { e: '❤️', label: 'Amen', n: 23 }, { e: '✋', label: 'Got it', n: 89 }] },
  { date: 'MONDAY, MAY 11', time: 'Yesterday', banner: 'EVENT',
    title: 'Annual Power Night · Friday May 23',
    body: 'Mark your calendar. Power Night is our annual all-night service. Theme: “Mathetes: Disciples Indeed.” Worship begins 10 PM, runs until dawn. House leaders will share details in your house chats.',
    event: { date: 'Friday, May 23', time: '10:00 PM', place: 'Main Chapel' },
    reactions: [{ e: '✋', label: 'Going', n: 156 }, { e: '🙏', label: 'Praying', n: 12 }] },
  { date: 'FRIDAY, MAY 8', time: '4 days ago',
    title: 'Welcoming our 14 new disciples',
    body: 'Last Sunday, fourteen students gave their lives to Christ at the campus outreach. Glory to God. Please welcome them when you see them, and pray for them. They will be placed into houses this week.',
    photos: 4,
    reactions: [{ e: '❤️', label: 'Amen', n: 234 }, { e: '🙏', label: 'Praying', n: 89 }] },
];

// ── Ask Pastor ──
const ASK_PASTOR = {
  stats: '247 questions answered · 89% public',
  questions: [
    { status: 'awaiting', when: '1 day ago', privacy: 'Private',
      q: 'How do I know if a decision is from God or just my own desire?' },
    { status: 'answered', when: '5 days ago', privacy: 'Public', helped: 23,
      q: 'Can a Christian still struggle with doubt?',
      a: 'Doubt is not the opposite of faith. Doubt is faith in process...' },
    { status: 'answered', when: '2 weeks ago', privacy: 'Private',
      q: 'I keep falling into the same sin. Is there hope for me?',
      a: 'There is always hope. Hear me carefully...' },
  ],
  categories: ['Faith & Doubt', 'Relationships', 'Sin & Repentance', 'Calling & Career', 'Family', 'School & Studies', 'Spiritual Disciplines', 'Other'],
};

// ── Discipler chat ──
const DISCIPLER = {
  who: 'femi',
  overview: { started: 'February 14', last: 'Saturday, May 9', next: 'Saturday, May 16 at 4 PM', walking: 'Spiritual disciplines' },
  messages: [
    { kind: 'date', label: 'SATURDAY, MAY 9 · AFTER OUR CALL' },
    { kind: 'msg', who: 'femi', time: '5:15 PM',
      text: 'John, that was a powerful conversation today. I’m proud of you for being honest about the struggle with prayer consistency. Here’s what I want you to try this week: 5 minutes, same time daily, no phone. Even if you say nothing.' },
    { kind: 'msg', who: 'femi', time: '5:16 PM', sameAuthor: true,
      text: 'Read Matthew 6:6 every morning before you start. Let me know how it goes.' },
    { kind: 'system', text: 'John added a daily 5:00 AM reminder · Matthew 6:6' },
    { kind: 'msg', who: 'you', mine: true, time: '5:32 PM',
      text: 'Thank you Brother Femi. I will. The honesty was hard but I needed to speak it out loud.' },
    { kind: 'date', label: 'WEDNESDAY, MAY 13' },
    { kind: 'msg', who: 'you', mine: true, time: '5:18 AM', read: true,
      text: 'Day 4. I missed yesterday but I started again today. Felt the Lord meet me in the silence.' },
    { kind: 'msg', who: 'femi', time: '6:40 AM',
      text: 'That is the path. Don’t aim for perfect. Aim for return. The disciple is one who keeps coming back. Looking forward to our Saturday call.' },
    { kind: 'date', label: 'TODAY · TUESDAY, MAY 12' },
    { kind: 'msg', who: 'femi', time: '6:12 AM',
      text: 'Quick check: how is your heart this morning? I prayed for you at 6.' },
  ],
};

// ── DM threads ──
const DMS = {
  esther: {
    who: 'esther', sub: 'Berea · Year 2', firstTime: true,
    messages: [
      { kind: 'date', label: 'MONDAY, MAY 11' },
      { kind: 'msg', who: 'esther', time: '8:42 PM',
        text: 'Hey John, I saw what you shared in house chat today. It blessed me. Can I ask you something?' },
      { kind: 'msg', who: 'esther', time: '8:42 PM', sameAuthor: true,
        text: 'How did you start journaling? I want to start but I don’t know where to begin.' },
      { kind: 'msg', who: 'you', mine: true, time: '9:15 PM', text: 'Hey Esther 🙏 So glad it blessed you.' },
      { kind: 'msg', who: 'you', mine: true, time: '9:16 PM', sameAuthor: true,
        text: 'Honestly I just started by writing down ONE verse from the day’s Word and what I felt while reading it. No structure. Just being honest with God on paper.' },
      { kind: 'msg', who: 'you', mine: true, time: '9:17 PM', sameAuthor: true, read: true,
        text: 'Brother Femi taught me: “The page won’t judge you. Write what’s there.”' },
      { kind: 'msg', who: 'esther', time: '9:20 PM',
        text: 'That’s so freeing. I’ve been putting too much pressure on it. Thank you, brother.',
        reactions: [{ e: '❤️', n: 1 }] },
      { kind: 'date', label: 'TODAY · TUESDAY, MAY 12' },
      { kind: 'msg', who: 'esther', time: '11:40 AM', text: 'Quick prayer request: my chemistry test is at 3 PM today. Stand with me 🙏' },
      { kind: 'msg', who: 'you', mine: true, time: '11:42 AM', text: 'Amen. Praying for the test 🙏' },
      { kind: 'system', text: 'Esther reacted with 🙏' },
    ],
  },
  joshua: {
    who: 'joshua', sub: 'Berea · Year 3',
    messages: [
      { kind: 'date', label: 'TODAY · TUESDAY, MAY 12' },
      { kind: 'msg', who: 'joshua', time: '10:02 AM', text: 'Bro that word you shared on Sunday still dey my spirit.' },
      { kind: 'msg', who: 'joshua', time: '10:02 AM', sameAuthor: true, text: 'Send me the verse you mentioned.' },
    ],
  },
};

// ── Prayer wall (Berea) ──
const PRAYER_WALL = {
  active: 47,
  sections: [
    { header: 'URGENT · NEEDS PRAYER NOW', items: [
      { who: 'faith', time: '2h ago', urgent: true,
        text: 'My mother is having major surgery this morning at LUTH. The doctors are concerned. Please stand with me. Isaiah 41:10.', pray: 47 },
      { who: 'anon', name: 'Anonymous · Berea', time: '5h ago', anon: true,
        text: 'I’ve been struggling with thoughts of giving up. Please pray for my mind.', pray: 89,
        note: 'Anonymous requests get extra prayer coverage.' },
    ]},
    { header: 'PRAYING TOGETHER', items: [
      { who: 'daniel', time: 'Yesterday',
        text: 'Final defense in 2 weeks. Standing on Joshua 1:9, be strong and of a good courage.', pray: 23, youPrayed: true },
      { who: 'ruth', time: '2 days ago', praise: true,
        text: 'Praise report 🙏 The job I prayed for last month came through. To God be the glory. Thank you all for praying with me.', pray: 67, heart: 89 },
      { who: 'joshua', time: '3 days ago',
        text: 'Wisdom for the right choice between two opportunities. Both seem good.', pray: 12 },
    ]},
  ],
};

// ── Notifications ──
const NOTIFICATIONS = [
  { group: 'TODAY', items: [
    { icon: 'Megaphone', tone: HC.antioch, title: 'Pastor Tunde posted in Announcements', preview: 'Mid-week prayer moved to Chapel A...', time: '2h ago', unread: true },
    { icon: 'MessageCircle', tone: HC.berea, title: 'Daniel mentioned you in Berea House', preview: '@John your reflection on lean not... thank you', time: '4h ago', unread: true },
    { icon: 'HandHeart', tone: HC.bethany, title: '12 disciples prayed for your request', preview: '“Wisdom for my final defense”', time: '5h ago' },
  ]},
  { group: 'YESTERDAY', items: [
    { avatar: 'pastor', title: 'Pastor Tunde answered your question', preview: 'How do I know if a decision is from God...', time: 'Yesterday' },
    { icon: 'BadgeCheck', tone: HC.bethel, title: 'You extended your streak to 12 days', preview: 'Faithful in the little, faithful in the much.', time: 'Yesterday' },
    { icon: 'MessageCircle', tone: HC.berea, title: 'Esther sent you a message', preview: 'Quick prayer request...', time: 'Yesterday', unread: true },
  ]},
  { group: 'EARLIER', items: [
    { icon: 'Calendar', tone: HC.antioch, title: 'Reminder: Saturday call with Brother Femi', preview: 'Tomorrow at 4 PM', time: '2 days ago' },
    { icon: 'Sparkles', tone: HC.bethel, title: 'Daily prompt in Berea House', preview: 'What stood out from today’s Word?', time: '3 days ago' },
  ]},
];

Object.assign(window, {
  HOUSE, HC, PASTOR, MEMBERS, M, INBOX, HOUSE_CHAT, ANNOUNCEMENTS,
  ASK_PASTOR, DISCIPLER, DMS, PRAYER_WALL, NOTIFICATIONS,
});
