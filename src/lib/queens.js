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
    body: 'The Royal Gala Night at Porchester Hall in London\'s West End, a prestigious Royal High Tea, and attendance at Buckingham Palace — subject to protocol confirmation.',
    items: [
      'Royal Gala Night · Porchester Hall',
      'Royal High Tea at a distinguished London venue',
      'Buckingham Palace attendance (subject to protocol)',
    ],
  },
  {
    idx: '04',
    group: 'Strategic & Diplomatic',
    title: 'Queens\' Roundtables',
    body: 'High-level Queens\' Roundtables, closed leadership dialogues, and international stakeholder engagements for the royal delegations.',
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
