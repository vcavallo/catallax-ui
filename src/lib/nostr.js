import { useState, useEffect, createContext, useContext } from "react";
import { getEventHash } from "nostr-tools";

const RELAY_URL = "ws://localhost:3334";  // Switch back to localhost
const CLOSE_CODES = {
  1000: "Normal Closure",
  1001: "Going Away",
  1002: "Protocol Error",
  1003: "Unsupported Data",
  1004: "Reserved",
  1005: "No Status Received",
  1006: "Abnormal Closure",
  1007: "Invalid frame payload data",
  1008: "Policy Violation",
  1009: "Message too big",
  1010: "Missing Extension",
  1011: "Internal Error",
  1012: "Service Restart",
  1013: "Try Again Later",
  1014: "Bad Gateway",
  1015: "TLS Handshake"
};
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

  // Track connection status
  const [isConnected, setIsConnected] = useState(false);

  // Handle WebSocket connection
  useEffect(() => {
    let ws = null;
    let retryCount = 0;
    const maxRetries = 3;

    const connect = () => {
      if (retryCount >= maxRetries) {
        console.log("Max retries reached, giving up");
        return;
      }

      try {
        // Clean up existing connection if any
        if (ws) {
          console.log("Cleaning up existing connection");
          ws.onclose = null; // Remove existing close handler
          ws.onerror = null; // Remove existing error handler
          ws.close();
        }

        console.log(`Connecting to relay: ${RELAY_URL} (attempt ${retryCount + 1}/${maxRetries})`);
        ws = new WebSocket(RELAY_URL);

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.log("Connection timeout, closing socket");
            ws.close();
          }
        }, 5000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("WebSocket connected");
          setIsConnected(true);
          retryCount = 0;

          // Generate a unique subscription ID for each connection
          const subId = `sub_${Math.random().toString(36).slice(2, 9)}`;
          console.log("Creating subscription:", subId);

          // Request all existing events
          ws.send(
            JSON.stringify([
              "REQ",
              subId,
              {
                kinds: [1, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407],
                limit: 1000,
              },
            ])
          );
        };

        ws.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (data[0] === "EVENT") {
            setEvents((prev) => {
              const existing = new Set(prev.map(e => e.id));
              if (existing.has(data[2].id)) {
                return prev;
              }
              return [data[2], ...prev];
            });
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          const closeReason = CLOSE_CODES[event.code] || "Unknown";
          console.log("WebSocket disconnected:", {
            code: event.code,
            codeMeaning: closeReason,
            reason: event.reason || "No reason provided",
            wasClean: event.wasClean
          });
          setIsConnected(false);
          setSocket(null);
          
          // Retry on any unexpected closure
          if (event.code !== 1000) {
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
            console.log(`Retrying connection in ${delay/1000} seconds...`);
            setTimeout(connect, delay);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error details:", {
            error,
            readyState: ws.readyState,
            readyStateText: ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][ws.readyState],
            url: RELAY_URL
          });
        };

        setSocket(ws);
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(connect, 1000 * retryCount);
        }
      }

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        retryCount = 0;

        // Generate a unique subscription ID for each connection
        const subId = `sub_${Math.random().toString(36).slice(2, 9)}`;
        console.log("Creating subscription:", subId);

        // Request all existing events
        ws.send(
          JSON.stringify([
            "REQ",
            subId,
            {
              kinds: [1, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407],
              limit: 1000,
            },
          ])
        );
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data[0] === "EVENT") {
          setEvents((prev) => {
            // Deduplicate events by ID
            const existing = new Set(prev.map(e => e.id));
            if (existing.has(data[2].id)) {
              return prev;
            }
            return [data[2], ...prev];
          });
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        setSocket(null);
        
        // Only retry if it wasn't a clean close
        if (!event.wasClean) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Retrying connection in ${retryCount} seconds...`);
            setTimeout(connect, 1000 * retryCount);
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error details:", {
          error,
          readyState: ws.readyState,
          url: RELAY_URL
        });
      };

      setSocket(ws);
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
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
    <NostrContext.Provider
      value={{ publicKey, events, publishEvent, publishNote }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export const useNostr = () => useContext(NostrContext);
