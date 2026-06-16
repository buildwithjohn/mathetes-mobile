// Mathetes — content for the prototype.
// Scripture is King James Version (public domain), per the design brief.
// All devotional / reflection copy is original.

const PARISH = {
  abbr: 'CCCFSP',
  full: 'Celestial Church of Christ Federal Students Parish',
  campus: 'Federal University Oye-Ekiti',
  short: 'CCCFSP · Federal University Oye-Ekiti',
};

const TODAY = {
  date: 'Tuesday, May 12',
  greeting: 'Good morning, John',
  firstName: 'John',
  streak: 12,
  weekProgress: 0.71, // 5 of 7 days
};

const WORD = {
  ref: 'Proverbs 3:5',
  passage: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
  short: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
  theme: 'When wisdom whispers',
  reflection: "Wisdom rarely shouts. The disciple learns to recognise the quiet voice of the Spirit, the One who knows what we cannot see. Today, before you decide, before you speak, before you act, pause. Lean not on what you understand. Lean on the One who understands all.",
  prompt: 'Where are you leaning on your own understanding today?',
  author: 'Pastor Tunde Akinwale',
};

const DEVOTIONAL = {
  series: 'Proverbs for the Called',
  day: 5,
  total: 31,
  title: 'When Wisdom Whispers',
  author: 'Pastor Tunde Akinwale',
  readingTime: '4 min read',
  passageRef: 'Proverbs 3:5–6',
  passage: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
  body: [
    "There is a kind of knowing that comes only when we are quiet enough to receive it. Solomon, who asked God for wisdom before he asked for anything else, did not tell us to lean on our own understanding only when it fails us. He told us to lean not on it at all.",
    "This is harder than it sounds. We are students. We are trained, rewarded, and ranked for the strength of our own understanding. To set it down feels like setting down the very thing that has carried us this far.",
    "But notice what the proverb does not say. It does not ask you to stop thinking. It asks you to stop leaning. There is a difference between using your mind and resting your whole weight upon it. The disciple thinks clearly precisely because he is not afraid: he has somewhere else to stand.",
    "So before you decide, before you speak, before you send the message you have already written in your head, pause. Acknowledge him in the way you cannot yet see. The promise that follows is quiet and enormous: he shall direct thy paths.",
  ],
  pullQuote: 'Wisdom is not the absence of thinking. It is the presence of trust before thinking.',
  prompt: 'Sit with this today: where are you leaning on your own understanding?',
  tomorrow: 'The Beginning of Knowledge',
};

const BIBLE = {
  book: 'John',
  chapter: 3,
  ref: 'John 3',
  translation: 'KJV',
  translations: ['KJV', 'WEB', 'BSB', 'NIV (locked)'],
  verses: [
    { n: 1, text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:' },
    { n: 2, text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.' },
    { n: 3, text: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.', note: 'Nicodemus comes by night. The teacher of Israel comes to be taught.' },
    { n: 4, text: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother’s womb, and be born?' },
    { n: 5, text: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.' },
    { n: 6, text: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.' },
    { n: 7, text: 'Marvel not that I said unto thee, Ye must be born again.' },
    { n: 8, text: 'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.', highlight: 'gold' },
    { n: 9, text: 'Nicodemus answered and said unto him, How can these things be?' },
    { n: 10, text: 'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?' },
    { n: 11, text: 'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.' },
    { n: 12, text: 'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?' },
    { n: 13, text: 'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.' },
    { n: 14, text: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:' },
    { n: 15, text: 'That whosoever believeth in him should not perish, but have eternal life.' },
    { n: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', highlight: 'strong' },
  ],
};

// The verse used by the share-image generator.
const SHARE_VERSE = {
  text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  shortText: 'For God so loved the world, that he gave his only begotten Son.',
  ref: 'John 3:16',
};

// The seven house fellowships — the heart of the parish.
const HOUSES = [
  { id: 'bethel',  name: 'Bethel',  color: '#B87333', meaning: 'House of God',
    verse: 'Surely the LORD is in this place.', ref: 'Genesis 28:16' },
  { id: 'antioch', name: 'Antioch', color: '#722F37', meaning: 'The sending city',
    verse: 'Separate me Barnabas and Saul for the work.', ref: 'Acts 13:2' },
  { id: 'berea',   name: 'Berea',   color: '#A87C3E', meaning: 'The studious',
    verse: 'They received the word, and searched the scriptures daily.', ref: 'Acts 17:11' },
  { id: 'bethany', name: 'Bethany', color: '#7A8A6E', meaning: 'House of figs, place of rest',
    verse: 'Mary hath chosen that good part.', ref: 'Luke 10:42' },
  { id: 'zion',    name: 'Zion',    color: '#C9A24A', meaning: 'Dwelling place of God',
    verse: 'Out of Zion, the perfection of beauty, God hath shined.', ref: 'Psalm 50:2' },
  { id: 'hebron',  name: 'Hebron',  color: '#A85838', meaning: 'Fellowship, communion',
    verse: 'Abram came and dwelt in the plain of Mamre.', ref: 'Genesis 13:18' },
  { id: 'salem',   name: 'Salem',   color: '#6B7F8A', meaning: 'Peace',
    verse: 'He brought forth bread and wine: and he was the priest of the most high God.', ref: 'Genesis 14:18' },
];

const PROFILE = {
  name: 'John Akinola',
  initials: 'JA',
  house: 'berea',
  houseName: 'Berea',
  houseColor: '#A87C3E',
  parish: PARISH.short,
  joined: 'Joined September 2024',
  streak: 12,
  longestStreak: 31,
  bookmarks: 47,
  highlights: 23,
  pastDevotionals: 62,
  recentNotes: [
    { ref: 'Proverbs 3:5', text: 'Lean not. Not "lean less." That one undoes me.', date: 'Today' },
    { ref: 'John 3:8', text: 'The wind bloweth where it listeth. I cannot schedule the Spirit.', date: 'Yesterday' },
    { ref: 'Psalm 46:10', text: '"Be still" first. Then "and know."', date: '3 days ago' },
  ],
};

Object.assign(window, {
  PARISH, TODAY, WORD, DEVOTIONAL, BIBLE, SHARE_VERSE, HOUSES, PROFILE,
});
