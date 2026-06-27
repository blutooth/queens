// message.js — EDITABLE invitation message template.
//
// Export a single function (invitee, link) => string.
//   invitee = { slug, name, audience, email, url }
//   link    = full personal invitation URL, e.g.
//             "https://africanqueenssummit.com/invite/naano-dumaaley/"
//
// Edit the wording freely. Keep it personal and warm — these go to real,
// known contacts. The tone is selected per audience via the salutation map
// below. Anything not in the map falls back to the neutral/guest variant.

// Salutation by audience (per the summit handoff spec).
const SALUTATIONS = {
  queens: 'Your Majesty',
  kings: 'Your Majesty',
  politicians: 'Your Excellency',
  princesses: 'Your Royal Highness',
  guests: '', // warm neutral greeting used instead
};

// The audiences that receive the formal "royal" variant.
const FORMAL_AUDIENCES = new Set(['queens', 'kings', 'politicians', 'princesses']);

export function salutationFor(audience) {
  return SALUTATIONS[audience] ?? '';
}

export default function buildMessage(invitee, link) {
  const audience = (invitee.audience || '').toLowerCase();
  const salutation = salutationFor(audience);

  if (FORMAL_AUDIENCES.has(audience)) {
    // Formal variant for royals, politicians and princesses.
    return (
      `${salutation}, on behalf of Her Majesty Obonganwan Marie Erete, ` +
      `Queen Aruk II, you are warmly invited to the African Global Queens ` +
      `Summit — United Kingdom, 14–31 August 2026.\n\n` +
      `Your personal invitation: ${link}\n\n` +
      `Kindly RSVP via the page. With royal regard,\n` +
      `Aruk II Humanitarian Services.`
    );
  }

  // Neutral / guest variant — warm, friendly greeting.
  const firstName = (invitee.name || '').trim().split(/\s+/)[0] || '';
  const greeting = firstName ? `Dear ${firstName},` : 'Dear friend,';
  return (
    `${greeting} on behalf of Her Majesty Obonganwan Marie Erete, ` +
    `Queen Aruk II, it is my joy to invite you to the African Global ` +
    `Queens Summit — United Kingdom, 14–31 August 2026.\n\n` +
    `Your personal invitation: ${link}\n\n` +
    `Please do RSVP via the page — we would be delighted to welcome you. ` +
    `Warm regards,\n` +
    `Aruk II Humanitarian Services.`
  );
}
