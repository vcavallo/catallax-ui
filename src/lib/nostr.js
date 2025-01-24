import { useState, useEffect, createContext, useContext } from "react";
import { getEventHash } from "nostr-tools";

const RELAY_URL = "ws://localhost:3334";
const NostrContext = createContext();

export function NostrProvider({ children }) {
  const [publicKey, setPublicKey] = useState("");
  const [events, setEvents] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectNostr = async () => {
      console.log("Checking for Nostr extension...", {
        windowNostr: window.nostr,
      });
      if (typeof window.nostr === "undefined") {
        console.log("No Nostr extension found");
        return;
      }
      try {
        const pubkey = await window.nostr.getPublicKey();
        setPublicKey(pubkey);
      } catch (err) {
        console.error("Error getting public key:", err);
      }
    };
    connectNostr();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(RELAY_URL);

    ws.onopen = () => {
      // Subscribe to both regular notes and NIP-100 events
      ws.send(
        JSON.stringify([
          "REQ",
          "my-sub",
          {
            kinds: [1, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407],
            limit: 100,
          },
        ])
      );
      console.log("Subscribed to events:", [1, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407]);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Received websocket message:", data);
      if (data[0] === "EVENT") {
        setEvents((prev) => {
          const newEvents = [data[2], ...prev];
          console.log("Updated events array:", newEvents);
          console.log("Event kinds present:", newEvents.map(e => e.kind));
          return newEvents;
        });
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data[0] === "EVENT") {
        setEvents((prev) => [data[2], ...prev]);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const validateEvent = (kind, tags, pubkey) => {
    // Find referenced events
    const eventRefs = tags.filter(([t]) => t === 'e').map(([_, id]) => id);
    const pubkeyRefs = tags.filter(([t]) => t === 'p').map(([_, pk]) => pk);
    
    // Find the referenced events in our events array
    const referencedEvents = events.filter(e => eventRefs.includes(e.id));

    switch (kind) {
      case 3402: // Agent Acceptance
        // Must reference a task proposal
        const taskProposal = referencedEvents.find(e => e.kind === 3401);
        if (!taskProposal) {
          throw new Error("Must reference a valid task proposal");
        }
        // Must be referenced in the task proposal
        if (!taskProposal.tags.some(([t, p]) => t === 'p' && p === pubkey)) {
          throw new Error("Only the specified agent can accept this task");
        }
        break;

      case 3403: // Task Finalization
        if (!referencedEvents.some(e => e.kind === 3402)) {
          throw new Error("Must reference a valid agent acceptance");
        }
        break;

      case 3405: // Worker Assignment
        // Must be done by task creator
        const task = referencedEvents.find(e => e.kind === 3401);
        if (task && task.pubkey !== pubkey) {
          throw new Error("Only the task creator can assign workers");
        }
        break;

      case 3407: // Task Resolution
        // Must be done by agent
        const originalTask = events.find(e => {
          const acceptanceEvent = referencedEvents.find(re => re.kind === 3402);
          return acceptanceEvent && e.id === acceptanceEvent.tags.find(([t]) => t === 'e')?.[1];
        });
        if (originalTask && !originalTask.tags.some(([t, p]) => t === 'p' && p === pubkey)) {
          throw new Error("Only the escrow agent can resolve tasks");
        }
        break;
    }

    return true;
  };

  const publishEvent = async (eventFields) => {
    if (!publicKey || !socket) return;

    const event = {
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      ...eventFields,
    };

    try {
      // Validate the event before publishing
      validateEvent(event.kind, event.tags, publicKey);

      event.id = getEventHash(event);
      const signedEvent = await window.nostr.signEvent(event);
      event.sig = signedEvent.sig;

      console.log("Publishing event:", event);
      socket.send(JSON.stringify(["EVENT", event]));
    } catch (error) {
      console.error("Event validation failed:", error.message);
      alert(error.message);
    }
  };

  // Helper to publish a regular note (kind 1)
  const publishNote = async (content) => {
    await publishEvent({
      kind: 1,
      content,
      tags: [],
    });
  };

  return (
    <NostrContext.Provider value={{ publicKey, events, publishEvent, publishNote }}>
      {children}
    </NostrContext.Provider>
  );
}

export const useNostr = () => useContext(NostrContext);
