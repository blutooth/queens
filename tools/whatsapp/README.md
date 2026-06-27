# WhatsApp Invitation Sender (local tool)

A small **local** command-line tool that connects to **your own WhatsApp**,
matches the summit invitees to your saved WhatsApp contacts, drafts each a
personalised invitation with their personal link, and — only when you explicitly
confirm — sends them. It records who has been sent so you never double-send.

This is for **Queen Aruk II** inviting **known personal contacts** to the
African Global Queens Summit. It is **not** a bulk/marketing/spam tool.

---

## ⚠️ IMPORTANT WARNING — read before using

> **Automating WhatsApp Web (which this tool does, via `whatsapp-web.js`) is
> against WhatsApp's Terms of Service and can result in your number being
> temporarily or permanently BANNED / suspended — there is no appeal guarantee.**
>
> To reduce the risk:
> - Use **small batches** (the per-run cap defaults to 20; go lower).
> - Message **only real people you actually know** who expect to hear from you.
> - Keep the message **personal** — edit `message.js` so it does not read like an ad.
> - Spread sends over time (this tool already throttles 20–45s between sends).
>
> **You use this tool entirely at your own risk.** The authors accept no
> responsibility for any account action taken by WhatsApp.

---

## Setup

```bash
cd tools/whatsapp
npm install
```

This installs `whatsapp-web.js` and `qrcode-terminal` **inside this folder only**
(`tools/whatsapp/node_modules/`); it does not touch the website's dependencies.

### First-run login (QR code)

The first time you run any real mode (dry-run / report / send), the tool opens a
headless browser and prints a **QR code** in your terminal:

1. Open WhatsApp on your phone → **Settings → Linked Devices → Link a Device**.
2. Scan the QR code shown in the terminal.

The session is saved locally in `tools/whatsapp/.wwebjs_auth/`, so you only scan
once. Delete that folder to log out / re-link.

---

## Test it first (send yourself one message)

Before any bulk run, prove that real sending works end-to-end by sending **one**
message to **your own number**:

```bash
node send.mjs --to 447700900123        # <- put YOUR number, international format, digits only
```

What this does:
- On first run, prints the **QR code** to link your WhatsApp (same as above).
- **Ignores the manifest and contact matching entirely** — it sends to that exact
  number only.
- Uses the real `message.js` template with a sample invite link
  (`https://africanqueenssummit.com/invite/naano-dumaaley/`) so it looks genuine.
- Checks the number is registered on WhatsApp; if not, it prints a clear error
  and exits without sending.
- Prints the exact number + message, then asks you to type **`SEND`** to confirm.
- This test is **NOT** written to `sent.json` (it's a test, not a real invitee).

Options:
```bash
node send.mjs --to 447700900123 --link https://africanqueenssummit.com/invite/abbie/
node send.mjs --to 447700900123 --name "Marie"      # personalise the greeting
```

`--to` is mutually exclusive with `--send` (bulk manifest send) and refuses
`--mock-contacts` (because `--to` is a real send).

---

## How to run

Always run the **dry run first**. Nothing is ever sent unless you pass `--send`
AND type the confirmation phrase.

```bash
# 1) DRY RUN (default) — connects, matches, prints each message + masked phone,
#    sends NOTHING:
node send.mjs

# 2) REPORT — counts of matched / unmatched / already-sent / pending, and lists
#    the unmatched names so you can fix them:
node send.mjs --report

# 3) SEND — actually sends. Prints a summary, then requires you to type
#    exactly "SEND <N>" to proceed. Throttled and capped.
node send.mjs --send

# Options:
node send.mjs --send --max 10              # cap this run at 10 sends (default 20)
node send.mjs --manifest ../../path.json   # use a different manifest
node send.mjs --selftest                   # offline matcher + template test (no WhatsApp)
node send.mjs --to 447700900123            # REAL single-number test send (see "Test it first")
```

`npm run dry-run`, `npm run report`, `npm run selftest`, `npm run send` are
shortcuts for the above.

### Manifest

By default the tool reads `../../content/data/invitees.json` (an array of
`{ slug, name, audience, email, url }`). If that file does not exist it falls
back to `../../content/data/invitees.sample.json`. The full personal link is
`https://africanqueenssummit.com` + the invitee's `url`.

---

## Matching: how it works & its limits

For each invitee `name`, the tool normalises both the name and each contact's
`name` / `pushname` / `verifiedName` (lowercase, strip accents & punctuation,
strip honorifics/titles like *Hon., Dr, Chief, Nana, HRH, Amb.*, collapse
spaces) and then:

- **Exact**: the title-stripped token sets are identical (order-independent, so
  "Acheampong Theresa" matches a contact "Theresa Acheampong").
- **Token overlap**: one name's tokens are a subset of the other with ≥2 shared
  tokens (so "Abigail Ama Oforiwaa" matches "Abigail Oforiwaa"), or first+last
  name overlap.

Decision rule:
- **Exactly one** confident contact → **matched**.
- **Zero** contacts → **UNMATCHED** (manual review).
- **Two or more** plausible contacts → **UNMATCHED** (ambiguous; never guess-send).

**Limitations:**
- Single first-name-only invitees (e.g. "Abbie") only match a contact whose
  whole name is that single token — they will **not** match "John Abbie Mensah".
  If two contacts share that bare name it becomes ambiguous → unmatched.
- Nicknames, misspellings, or contacts saved under a company/relationship label
  ("Mum", "Office") will not match. Fix by saving the contact under the
  person's real name, or editing the invitee's `name` in the manifest.
- Matching never sends to UNMATCHED entries. Run `--report` to get the list to
  fix, then re-run.

---

## The message

The message text lives in **`message.js`** — an editable template exporting
`(invitee, link) => string`. It picks a tone per audience:

- **queens / kings** → "Your Majesty" (formal)
- **politicians** → "Your Excellency" (formal)
- **princesses** → "Your Royal Highness" (formal)
- **guests / (blank)** → warm neutral greeting ("Dear <first name>, …")

Edit `message.js` freely to change wording. Run `node send.mjs --selftest` to
preview how every audience renders, or `node send.mjs` (dry run) to preview the
real invitees.

---

## `sent.json` — the source of truth

Every successful send is appended to `tools/whatsapp/sent.json` as:

```json
{ "slug": "...", "name": "...", "phone": "...", "audience": "...", "sentAt": "ISO-8601" }
```

On every run, anyone whose `slug` is already in `sent.json` is **skipped**, so
you can safely re-run, raise `--max`, and continue another day without
double-messaging. This file is **local and private** and is git-ignored. To
re-send to someone, remove their entry.

---

## Safety summary

- **Default = dry run.** Sends nothing without `--send`.
- `--send` still requires a typed `SEND <N>` confirmation.
- Per-run cap (`--max`, default 20) and randomised 20–45s throttle between sends.
- Never messages UNMATCHED or already-sent invitees.
