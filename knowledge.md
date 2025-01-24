# Nostr Web Client Project

A minimal Nostr web client built with Next.js 13+ (App Router), React, and TailwindCSS.

## Project Structure

- `/src/app/` - Next.js 13+ app directory containing pages and layouts
- `/src/components/` - React components
- `/src/lib/` - Shared utilities and hooks

## Key Features

- Real-time connection to Nostr network via WebSocket
- Publish and view notes
- User authentication via browser extension (nos2x/Alby)
- Responsive design with TailwindCSS

## Technical Notes

- Uses Next.js 13+ App Router with client-side components
- Requires Nostr browser extension for signing
- Real-time updates using WebSocket connection
- Configuration files (postcss.config.mjs, tailwind.config.mjs, etc.) must use ES modules syntax with `export default`

## Nostr Protocol Notes

- Event signature must be a string, not an object
- window.nostr.signEvent() returns an object with sig containing the actual signature string
- Event structure:
  ```js
  {
    kind: number,
    pubkey: string,
    created_at: number,
    tags: string[][],
    content: string,
    id: string,
    sig: string  // Must be string from signedEvent.sig
  }
  ```

## Dependencies

- nostr-tools: Nostr protocol implementation
- TailwindCSS: Utility-first CSS framework
- Next.js 13+: React framework with App Router
