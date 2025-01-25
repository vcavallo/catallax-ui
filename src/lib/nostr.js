import { useState, useEffect, createContext, useContext } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKNip46Signer,
} from "@nostr-dev-kit/ndk";

const NostrContext = createContext();
const nip07signer = new NDKNip07Signer();

export function NostrProvider({ children }) {
  const [publicKey, setPublicKey] = useState("");
  const [events, setEvents] = useState([]);
  const [ndk, setNdk] = useState(null);

  useEffect(() => {
    const connectNostr = async () => {
      console.log("Initializing NDK...");

      // Create a new NDK instance with explicit relays
      const ndkInstance = new NDK({
        signer: nip07signer,
        explicitRelayUrls: ["ws://localhost:3334"],
      });

      try {
        // Connect to specified relays
        await ndkInstance.connect();
        console.log("NDK Connected");
        setNdk(ndkInstance);

        // Get signer from extension
        if (typeof window.nostr !== "undefined") {
          const pubkey = await window.nostr.getPublicKey();
          setPublicKey(pubkey);
        }

        // Subscribe to relevant events
        const subscription = ndkInstance.subscribe(
          {
            kinds: [1, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407],
            limit: 1000,
          },
          { closeOnEose: false }
        );

        subscription.on("event", (event) => {
          setEvents((prev) => {
            const existing = new Set(prev.map((e) => e.id));
            if (existing.has(event.id)) {
              return prev;
            }
            return [event, ...prev];
          });
        });
      } catch (err) {
        console.error("Error connecting NDK:", err);
      }
    };

    connectNostr();

    return () => {
      if (ndk) {
        ndk.pool.close();
      }
    };
  }, []);

  const validateEvent = (kind, tags, pubkey) => {
    // Find referenced events
    const eventRefs = tags
      .filter(([t]) => t === "e")
      .map(([_, id]) => id);
    const pubkeyRefs = tags
      .filter(([t]) => t === "p")
      .map(([_, pk]) => pk);

    // Find the referenced events in our events array
    const referencedEvents = events.filter((e) =>
      eventRefs.includes(e.id)
    );

    switch (kind) {
      case 3402: // Agent Acceptance
        // Must reference a task proposal
        const taskProposal = referencedEvents.find(
          (e) => e.kind === 3401
        );
        if (!taskProposal) {
          throw new Error("Must reference a valid task proposal");
        }
        // Must be referenced in the task proposal
        if (
          !taskProposal.tags.some(([t, p]) => t === "p" && p === pubkey)
        ) {
          throw new Error(
            "Only the specified agent can accept this task"
          );
        }
        break;

      case 3403: // Task Finalization
        if (!referencedEvents.some((e) => e.kind === 3402)) {
          throw new Error("Must reference a valid agent acceptance");
        }
        break;

      case 3405: // Worker Assignment
        // Must be done by task creator
        const task = referencedEvents.find((e) => e.kind === 3401);
        if (task && task.pubkey !== pubkey) {
          throw new Error("Only the task creator can assign workers");
        }
        break;

      case 3407: // Task Resolution
        // Must be done by agent
        const originalTask = events.find((e) => {
          const acceptanceEvent = referencedEvents.find(
            (re) => re.kind === 3402
          );
          return (
            acceptanceEvent &&
            e.id === acceptanceEvent.tags.find(([t]) => t === "e")?.[1]
          );
        });
        if (
          originalTask &&
          !originalTask.tags.some(([t, p]) => t === "p" && p === pubkey)
        ) {
          throw new Error("Only the escrow agent can resolve tasks");
        }
        break;
    }

    return true;
  };

  // example of a 'blocking event'
  // const event = new NDKEvent(ndk, { kind: 1, content: 'My note
  // content' });
  // const publishedToRelays = await event.publish();
  // console.log(publishedToRelays); // relays where the event has published to

  const publishEvent = async (eventFields) => {
    if (!publicKey || !ndk) return;

    try {
      // Validate the event before publishing
      validateEvent(eventFields.kind, eventFields.tags || [], publicKey);

      // Create a new NDKEvent with our fields
      const event = new NDKEvent(ndk, {
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        ...eventFields
      });

      // Sign and publish the event
      await event.publish();
      console.log("Published event:", event);
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
    <NostrContext.Provider
      value={{ publicKey, events, publishEvent, publishNote }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export const useNostr = () => useContext(NostrContext);
