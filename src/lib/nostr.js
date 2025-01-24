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
      ws.send(
        JSON.stringify(["REQ", "my-sub", { kinds: [1], limit: 20 }])
      );
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

  const publishNote = async (content) => {
    if (!publicKey || !content || !socket) return;

    const event = {
      kind: 1,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content,
    };

    // Get the event hash before signing
    event.id = getEventHash(event);

    // Sign the event and get signature as string
    const signedEvent = await window.nostr.signEvent(event);

    // Extract just the signature string from the response
    const sig = signedEvent.sig;

    // Create the final event object with the string signature
    const finalEvent = {
      kind: event.kind,
      pubkey: event.pubkey,
      created_at: event.created_at,
      tags: event.tags,
      content: event.content,
      id: event.id,
      sig: sig,
    };

    console.log("Event being sent:", finalEvent);
    socket.send(JSON.stringify(["EVENT", finalEvent]));
  };

  return (
    <NostrContext.Provider value={{ publicKey, events, publishNote }}>
      {children}
    </NostrContext.Provider>
  );
}

export const useNostr = () => useContext(NostrContext);
