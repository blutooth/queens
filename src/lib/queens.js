import { asset } from './asset.js';

export const summit = {
  name: 'African Queens Summit',
  longName: 'African & Diaspora Queens Summit',
  dates: '14 – 31 August 2026',
  cities: ['London', 'Oxford'],
  tagline: 'Inspire · Empower · Unite',
  motto: 'Royalty Defined by Impact',
};

export const venues = [
  {
    id: 'porchester',
    kicker: 'The Ceremonies',
    name: 'Porchester Hall',
    city: 'London · Bayswater',
    image: asset('/images/porchester-1.jpg'),
    description: 'A grand Edwardian hall with soaring ceilings, a gilded ballroom, and capacity for 500 — host to the opening processional, royal receptions, and the closing gala in the heart of London.',
    features: [
      'Historic Edwardian ballroom',
      'Gilded proscenium & chandeliers',
      'Capacity for 500 guests',
      'Central London · Zone 1',
    ],
  },
  {
    id: 'hawkhill',
    kicker: 'The Residence',
    name: 'Hawkhill Place',
    city: 'Oxfordshire',
    image: asset('/images/hawkhill-grounds.png'),
    description: 'An eight-bedroom country retreat set in private gated grounds, with dedicated spa and wellness facilities — the residential home of the queens for the duration of the summit.',
    features: [
      '8 ensuite bedrooms',
      'Private spa & wellness',
      'Walled gardens & gated grounds',
      '45 minutes from London',
    ],
  },
  {
    id: 'oxford',
    kicker: 'The Academy',
    name: 'University of Oxford',
    city: 'Oxford',
    image: asset('/images/oxford-colleges.jpg'),
    description: 'A capacity-building course at one of the world\'s oldest universities — academic sessions, lectures, and scholarly dialogue on leadership, governance, and heritage.',
    features: [
      'Capacity-building curriculum',
      'Leadership & governance',
      'Lectures by Oxford faculty',
      'Honorary banquet & convocation',
    ],
  },
];

export const pillars = [
  {
    name: 'Unity',
    caption: 'One lineage, many crowns',
    body: 'A convocation of queens and first-class kings from across Africa and the Diaspora, gathered in common purpose.',
  },
  {
    name: 'Legacy',
    caption: 'Carrying the flame forward',
    body: 'Honouring the matriarchs who shaped a continent and committing their wisdom to the next generation.',
  },
  {
    name: 'Sovereignty',
    caption: 'The dignity of tradition',
    body: 'Reaffirming the standing of African royalty on the world stage and the integrity of ancestral authority.',
  },
  {
    name: 'Empowerment',
    caption: 'Women leading, communities rising',
    body: 'Advancing women\'s leadership and humanitarian initiatives that reach from the palace to the village.',
  },
];

export const highlights = [
  {
    num: '01',
    title: 'Inspiring Speakers',
    body: 'Keynotes from queens, scholars, and humanitarians whose lives bridge tradition and statecraft.',
  },
  {
    num: '02',
    title: 'Networking Events',
    body: 'Salons, dinners, and private audiences that forge enduring bonds between royal houses and allies.',
  },
  {
    num: '03',
    title: 'Royal Ceremonies',
    body: 'Processions, libations, and honours befitting a convocation of African royalty in the heart of England.',
  },
];

export const matriarchs = [
  {
    name: 'Nefertiti',
    reign: 'c. 1353–1336 BCE',
    region: 'Egypt',
    title: 'Great Royal Wife',
    bio: 'Great Royal Wife of Akhenaten, presiding over one of the wealthiest and most transformative eras of ancient Egypt.',
    image: asset('/images/matriarchs/nefertiti.jpg'),
    artifact: 'Painted limestone bust, Berlin',
  },
  {
    name: 'Hatshepsut',
    reign: 'c. 1479–1458 BCE',
    region: 'Egypt',
    title: 'Pharaoh of Egypt',
    bio: 'One of the most successful pharaohs, a prolific builder who commissioned hundreds of projects and expanded trade.',
    image: asset('/images/matriarchs/hatshepsut.jpg'),
    artifact: 'Limestone seated statue',
  },
  {
    name: 'Makeda',
    reign: '10th century BCE',
    region: 'Ethiopia · Saba',
    title: 'Queen of Sheba',
    bio: 'The legendary queen whose wisdom, wealth, and diplomacy thread through Ethiopian, biblical, and Quranic traditions.',
    image: asset('/images/matriarchs/makeda.jpg'),
    artifact: 'Safavid manuscript painting',
  },
  {
    name: 'Amanirenas',
    reign: 'c. 40–10 BCE',
    region: 'Kush · Nubia',
    title: 'Kandake of Meroë',
    bio: 'The one-eyed warrior queen who led Kushite armies against Rome and negotiated peace with Augustus himself.',
    image: asset('/images/matriarchs/amanirenas.jpg'),
    artifact: '19th c. Lepsius engraving',
  },
  {
    name: 'Amina',
    reign: 'c. 1576–1610',
    region: 'Zazzau · Nigeria',
    title: 'Warrior Queen',
    bio: 'A Hausa warrior queen who expanded her territory through a celebrated military career and mastered the Saharan trade.',
    image: asset('/images/matriarchs/amina.jpg'),
    artifact: 'Equestrian statue, Lagos',
  },
  {
    name: 'Nzinga Mbande',
    reign: '1624–1663',
    region: 'Ndongo · Angola',
    title: 'Queen of Ndongo',
    bio: 'A diplomat and strategist who resisted Portuguese colonisation for four decades, leading armies into her sixties.',
    image: asset('/images/matriarchs/nzinga.jpg'),
    artifact: 'Hand-coloured 19th c. engraving',
  },
  {
    name: 'Yaa Asantewaa',
    reign: '1900',
    region: 'Ashanti · Ghana',
    title: 'Queen Mother of Ejisu',
    bio: 'At sixty, she led the Ashanti in the War of the Golden Stool against the British Empire.',
    image: asset('/images/matriarchs/yaa.jpg'),
    artifact: 'Yaa Asantewaa Museum, Ejisu',
  },
];

export const programme = [
  {
    idx: '01',
    group: 'Academic & Intellectual',
    title: 'The Oxford Convocation',
    body: 'A short executive course and royal lecture series at the University of Oxford — a curriculum on leadership, governance, and global influence.',
    image: asset('/images/oxford-colleges.jpg'),
    items: [
      'Executive course at Oxford',
      'Royal lecture series',
      'Honorary banquet',
    ],
  },
  {
    idx: '02',
    group: 'Royal & Cultural',
    title: 'Heritage, Theatre & Immersion',
    body: 'An African theatrical production celebrating heritage and identity, set alongside curated cultural immersion experiences across London.',
    image: asset('/images/queen-aruk-ii-canopy.jpg'),
    items: [
      'African theatrical production',
      'Cultural immersion in London',
      'Heritage exhibitions',
    ],
  },
  {
    idx: '03',
    group: 'Prestige Engagements',
    title: 'Royal Gala, High Tea & Palace',
    body: 'The State Rooms & Royal Mews at Buckingham Palace on 23 August, a prestigious Royal High Tea, and the Royal Gala Night at Porchester Hall in London\'s West End on 25 August — subject to protocol confirmation.',
    image: asset('/images/porchester-2.jpg'),
    items: [
      'Buckingham Palace · State Rooms & Royal Mews · 23 Aug',
      'Royal High Tea at a distinguished London venue',
      'Royal Gala Night · Porchester Hall · 25 Aug',
    ],
  },
  {
    idx: '04',
    group: 'Strategic & Diplomatic',
    title: 'Queens\' Roundtables',
    body: 'High-level Queens\' Roundtables, closed leadership dialogues, and international stakeholder engagements for the royal delegations.',
    image: asset('/images/ipada-diaspora.jpg'),
    items: [
      'High-level Queens\' Roundtables',
      'Closed leadership dialogues',
      'International stakeholder engagements',
    ],
  },
  {
    idx: '05',
    group: 'Cultural Finale',
    title: 'Notting Hill Carnival',
    body: 'Participation in the Notting Hill Carnival on 31 August 2026 — celebrating African and Caribbean cultural excellence on a global stage.',
    image: asset('/images/dancers.jpg'),
    items: [
      'Procession on 31 August 2026',
      'African & Caribbean cultural excellence',
      'Global stage finale',
    ],
  },
  {
    idx: '06',
    group: 'Hospitality',
    title: 'Residence, Transport & Protocol',
    body: 'Luxury accommodation arranged for every attending Queen, with coordinated transport and protocol support throughout the summit.',
    image: asset('/images/hawkhill-grounds.png'),
    items: [
      'Luxury accommodation',
      'Coordinated transport',
      'Protocol support',
    ],
  },
];

export const dignitaries = [
  {
    honorific: 'Her Royal Majesty',
    name: 'Queen Aruk II',
    role: 'Obonganwan of Efik Kingdom',
    region: 'Cross River · Nigeria',
    status: 'Convener',
  },
  {
    honorific: 'His Imperial Majesty',
    name: 'The Ooni of Ife',
    role: 'Spiritual Head of Yoruba Race',
    region: 'Ile-Ife · Nigeria',
    status: 'Invited',
  },
  {
    honorific: 'Her Royal Majesty',
    name: 'The Queen Mother of Ejisu',
    role: 'Traditional Matriarch of Ashanti',
    region: 'Ashanti Region · Ghana',
    status: 'Invited',
  },
  {
    honorific: 'Her Royal Highness',
    name: 'The Nabagereka of Buganda',
    role: 'Queen Consort of Buganda',
    region: 'Buganda · Uganda',
    status: 'Invited',
  },
  {
    honorific: 'His Royal Majesty',
    name: 'King Silamba of Ndebele',
    role: 'Traditional King of Ndebele',
    region: 'Mpumalanga · South Africa',
    status: 'Confirmed',
  },
  {
    honorific: 'Otunba',
    name: 'Dr Wanle Akinboboye',
    role: 'Founder, Motherland Beckons',
    region: 'Atlanta · Lagos',
    status: 'Confirmed',
  },
  {
    honorific: 'Her Royal Highness',
    name: 'The Queen of Ashanti Diaspora',
    role: 'Ceremonial Head of Diaspora Court',
    region: 'London · Accra',
    status: 'Invited',
  },
  {
    honorific: 'Chief Dr',
    name: 'The Olori of Lagos',
    role: 'Traditional Consort',
    region: 'Lagos · Nigeria',
    status: 'Invited',
  },
];

// Four registration packages. Each includes the three flagship engagements.
// `retail` is the indicative à-la-carte value, shown struck through to convey
// the saving against the summit package rate.
export const packages = [
  { name: 'Signature', price: 550, retail: 600, note: 'The three flagship engagements', body: 'Oxford, the Royal Gala and Buckingham Palace — the heart of the summit.', image: asset('/images/oxford-university.jpg'), stripe: 'https://buy.stripe.com/test_00w9ATfdCdJV8Cl4rQ8og01' },
  { name: 'Signature + 2', price: 650, retail: 760, note: 'Flagships + any two excursions', body: 'Add two further outings of your choosing from the programme.', image: asset('/images/oxford-magdalen.jpg'), stripe: 'https://buy.stripe.com/test_7sY8wP3uU7lx6ud4rQ8og03' },
  { name: 'Signature + 3', price: 750, retail: 920, note: 'Flagships + any three excursions', body: 'Add three further outings of your choosing from the programme.', featured: true, image: asset('/images/dancers.jpg'), stripe: 'https://buy.stripe.com/test_eVq9AT9TiaxJ3i1bUi8og02' },
  { name: 'Full Programme', price: 900, retail: 1100, note: 'Any available engagement', body: 'The complete convocation — any available excursion across the seventeen days.', premium: true, image: asset('/images/queen-aruk-ii-throne.jpg'), stripe: 'https://buy.stripe.com/test_00w9ATc1q0X97yhbUi8og04' },
];

// The day-by-day programme. `price` is a number (GBP) or a label / null.
// `image` is set where a real photograph exists; cards without one fall back
// to a branded placeholder.
// `price` is the summit (conference) rate paid by attendees; `retail` is the
// indicative individual / on-the-door value, shown struck through to make the
// saving visible.
export const itinerary = [
  { date: '14–15 Aug', title: 'Arrival & Welcome', price: null, image: asset('/images/queen-aruk-ii-throne.jpg'), detail: 'Reception of the royal delegations and settling into residence.' },
  { date: '16 Aug', title: 'Opening Ceremony', price: 'Included', image: asset('/images/porchester-1.jpg'), detail: 'The grand opening processional and royal reception.' },
  { date: '17–18 Aug', title: 'Oxford University', price: 150, retail: 220, flagship: true, image: asset('/images/oxford-university.jpg'), detail: 'Executive course, the royal lecture series and the honorary banquet.' },
  { date: '19 Aug', title: 'Blenheim Palace', price: 72, image: asset('/images/blenheim-palace.jpg'), detail: 'A private visit to the birthplace of Sir Winston Churchill.' },
  { date: '20 Aug', title: "Lord Mayor's Reception", price: 40, retail: 60, image: asset('/images/lord-mayor.jpg'), detail: 'A civic reception in the historic City of London.' },
  { date: '21 Aug', title: 'Bicester Village', price: 75, image: asset('/images/bicester-village.jpg'), detail: 'A luxury shopping excursion — lunch included.' },
  { date: '22 Aug', title: 'Rest, Art & Leisure', price: 20, retail: 30, image: asset('/images/hawkhill-grounds.png'), detail: 'A restful day at Hawkhill with art, spa and wellness.' },
  { date: '23 Aug', title: 'Buckingham Palace', price: 100, retail: 140, flagship: true, image: asset('/images/buckingham-palace.jpg'), detail: 'The State Rooms & Royal Mews, subject to protocol confirmation.' },
  { date: '24 Aug', title: 'London Sightseeing & River Cruise', price: 65, image: asset('/images/london-sightseeing.jpg'), detail: 'A guided open-top coach tour of the capital with a Thames river cruise — a 24-hour pass.' },
  { date: '25 Aug', title: 'Royal Gala Night', price: 150, retail: 220, flagship: true, image: asset('/images/porchester-2.jpg'), detail: 'The black-tie Gala at Porchester Hall, London.' },
  { date: '26 Aug', title: 'Kew Gardens', price: 60, image: asset('/images/kew-gardens.jpg'), detail: 'The Royal Botanic Gardens at Kew.' },
  { date: '27 Aug', title: "St Paul's & Tower of London", price: 100, image: asset('/images/st-pauls.jpg'), detail: 'The cathedral, the Tower and the Crown Jewels.' },
  { date: '28 Aug', title: 'Westminster Abbey', price: 55, image: asset('/images/westminster.jpg'), detail: 'A visit to the historic Westminster Abbey.' },
  { date: '29–30 Aug', title: 'Rest', price: 'Free', image: asset('/images/london-rest.jpg'), detail: 'Leisure days and personal engagements.' },
  { date: '31 Aug', title: 'Notting Hill Carnival', price: 'Free', image: asset('/images/celebration-carnival.jpg'), detail: 'The cultural finale on a global stage.' },
];

// Optional London attractions, bookable as add-ons. Per person.
export const extras = [
  { name: 'London Eye', price: '£33' },
  { name: 'Madame Tussauds', price: '£51' },
  { name: 'Thames River Cruise', price: '£18' },
];

export const tiers = [
  {
    name: 'Observer',
    price: '£50',
    tag: 'Entry pass',
    body: 'Access to public convocations, exhibitions, and the opening processional. Ideal for scholars, press, and supporters.',
    includes: [
      'Opening processional · 14 Aug',
      'Cultural heritage exhibition',
      'One plenary keynote',
      'Closing cultural performance',
    ],
    featured: false,
  },
  {
    name: 'Royal Guest',
    price: '£200',
    tag: 'Full programme',
    body: 'Full access to the summit programme — ceremonies, forums, Oxford convocation, and the closing gala at Porchester Hall.',
    includes: [
      'All Observer benefits',
      'Leadership forum & panels',
      'Oxford academic convocation',
      'Honorary banquet · Oxford',
      'Closing gala · Porchester Hall',
    ],
    featured: true,
  },
  {
    name: 'Patron',
    price: '£500',
    tag: 'Residence included',
    body: 'The complete convocation with residence at Hawkhill Place, private audiences, and patronage recognition in the official programme.',
    includes: [
      'All Royal Guest benefits',
      'Residence at Hawkhill Place',
      'Spa & wellness access',
      'Private royal audience',
      'Patronage in the programme',
    ],
    featured: false,
  },
];

export const partners = [
  { name: 'Queen Aruk II Foundation', role: 'Convener' },
  { name: 'IPADA Initiatives', role: 'Principal Partner', featured: true },
  { name: 'Forum of African Traditional Authorities', role: 'Institutional Partner' },
  { name: 'Maasai Tourism Festival', role: 'Cultural Partner' },
  { name: 'Motherland Beckons', role: 'Diaspora Partner' },
];
