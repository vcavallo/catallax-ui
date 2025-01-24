# Catallax - Escrow-backed bounties on nostr and Lightning

_Value for Value for real_.

A web application for managing bounties and escrow agreements on the Nostr network using [NIP-3400 (_pending_)](https://github.com/nostr-protocol/nips/pull/1714).

## Early-stage pre-alpha warning!

**Catallax is under active early development and is currently not guaranteed to work properly.**  
I've built an [early relay implementation of the Kinds proposed in NIP-3400](https://github.com/vcavallo/khatru/blob/escrow/nip100.md), but it, too is under active development and the fate of NIP-3400 is yet to be determined.

Even if NIP-3400 is not accepted, Catallax may still be developed.

There is not _yet_ a live relay that implements Catallax, but that will likely change over the next few weeks - at which time you'll be able to play with an online demo.  
Follow me on nostr [njump profile](https://njump.me/npub19ma2w9dmk3kat0nt0k5dwuqzvmg3va9ezwup0zkakhpwv0vcwvcsg8axkl) for updates, comment on [NIP-3400](https://github.com/nostr-protocol/nips/pull/1714), and leave feedback on this repo.

## Overview

![catallax](https://github.com/user-attachments/assets/6561b70c-b3cc-496b-86ea-33cc9c48cd62)


This application provides a user interface for participating in bounty/escrow workflows on Nostr. Users can take on different roles:

- **Patron**: Create tasks, finalize agreements with **Arbiters**, and assign **Free Agents**
- **Arbiter**: Register as an escrow agent, accept tasks, and judge outcomes
- **Free Agent**: Browse available tasks, submit applications, deliver work and get paid

## How It Works

The application implements the NIP-3400 protocol for escrow workflows:

1. Arbiters register themselves with terms and conditions
2. Patrons create task proposals with requirements and bounty amounts
3. Arbiters can accept task proposals and hold escrow
4. Patrons finalize tasks by funding the escrow
5. Free Agents can apply for tasks
6. Patrons assign Free Agents to tasks
7. Free Agents submit completed work
8. Arbiters resolve tasks and release funds (or refund the Patron)

**Catallax trust-maxxes**. We don't rely on blockchains or smart contracts for escrow or other agreements, but rather on trust and reputation. All activity will live forever(ish) in Nostr events, which allows positive reputation to flow to honest actors and for scammers, ruggers and cheaters to be forever besmirched.  
This is a proper free market where anyone can participate and the goat-trails of **real value** will pave themselves down into highways of human flourishing.

All interactions are performed through Nostr events.

## Features

- Role-based interface for Patrons, Arbiters, and Free Agents
- Real-time event updates via WebSockets
- Form validation and event chain verification

## Technical Details

- Built with Next.js 13+ App Router
- TailwindCSS
- WebSocket connection to Nostr relays
- Supports NIP-3400 event kinds (3400-3407)
- Browser extension integration for nostr login

# Building

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
