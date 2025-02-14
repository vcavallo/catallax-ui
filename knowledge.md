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
- NIP-100 Escrow/Bounty system support

## Technical Notes

- Uses Next.js 13+ App Router with client-side components
- Requires Nostr browser extension for signing
- Real-time updates using WebSocket connection
- Configuration files (postcss.config.mjs, tailwind.config.mjs, etc.) must use ES modules syntax with `export default`
- Each page using NostrProvider must wrap its content with the provider, even if parent pages also use it
- Components that need to reference the current user's pubkey should destructure it from useNostr along with any other needed methods  - WebSocket connections should:
    - Track connection status
    - Deduplicate events by ID
    - Implement reconnection with exponential backoff (starting at 1s, max 10s)
    - Request full event history on each successful connection
    - Use unique subscription IDs to avoid conflicts with other clients
    - Set connection timeouts (5s recommended)
    - Clean up event handlers before closing
    - Handle all WebSocket close codes (1000-1015)
    - Retry on any non-normal closure

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

## NIP-100 Implementation Notes

## UI Patterns

### Form Pre-filling
- Forms should accept a selectedEvent prop
- Use useEffect to watch selectedEvent changes and pre-fill form fields
- Make pre-filled fields read-only
- Clear form state after successful submission
- Only show response forms when an event is selected
- Show initial forms (Register/Propose) by default for Arbiter/Patron roles


- Event kinds 3400-3407 for escrow workflow
- Content should be JSON stringified for structured data (agent info, task details)
- Each event after registration must reference previous events in the chain using "e" tags
- Events form chains: Proposal -> Acceptance -> Finalization -> Application -> Assignment -> Submission -> Resolution
- Agent Registration (3400) events are standalone and not part of task chains
- Each event after registration must reference previous events in the chain using "e" tags
- Acceptance events (3402) should only reference their task proposal
- Later events may reference multiple previous events in the chain
- Event validation rules:
  - Agent Acceptance (3402): Must be from agent referenced in task proposal
  - Task Finalization (3403): Must reference valid agent acceptance
  - Worker Assignment (3405): Must be from original task creator
  - Task Resolution (3407): Must be from escrow agent
- Required tags vary by event kind:
  - Agent Registration (3400): ["r", terms_url], ["p", agent_pubkey] (must include agent's own pubkey)
  - Task Proposal (3401): ["amount", sats], ["p", creator_pubkey], ["p", agent_pubkey] // Order of p tags matters: creator first, then agent
  - Task Acceptance (3402): ["e", task_id], ["p", creator_pubkey], ["p", agent_pubkey]
  - Task Finalization (3403): ["e", acceptance_id], ["e", zap_receipt], ["amount", sats], ["p", agent_pubkey], ["p", creator_pubkey]
  - Worker Application (3404): ["e", task_id], ["p", creator_pubkey], ["p", agent_pubkey], ["p", worker_pubkey]
  - Worker Assignment (3405): ["e", task_id], ["e", application_id], ["p", worker_pubkey], ["p", agent_pubkey], ["p", creator_pubkey]
  - Work Submission (3406): ["e", assignment_id], ["p", creator_pubkey], ["p", agent_pubkey], ["p", worker_pubkey]
  - Task Resolution (3407): ["e", submission_id], ["e", zap_receipt], ["amount", sats], ["p", creator_pubkey], ["p", worker_pubkey], ["p", agent_pubkey]

## Dependencies

- nostr-tools: Nostr protocol implementation
- TailwindCSS: Utility-first CSS framework
- Next.js 13+: React framework with App Router
