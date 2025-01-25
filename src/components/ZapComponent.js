"use client";
import { useEffect, useRef } from "react";
import { init, initTarget, injectCSS } from "nostr-zap/src/view";

// Inject CSS only once when component is first loaded
if (typeof window !== "undefined") {
  injectCSS();
}

export default function ZapComponent({ npub, noteId, relays }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      // Set the required data attributes
      console.log({ npub, noteId, relays });
      buttonRef.current.setAttribute("data-npub", npub);
      if (noteId) {
        buttonRef.current.setAttribute("data-note-id", noteId);
      }
      if (relays) {
        buttonRef.current.setAttribute("data-relays", relays);
      }

      // Initialize this specific target
      initTarget(buttonRef.current);
    }
  }, [npub, noteId, relays]);

  return (
    <button
      ref={buttonRef}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
    >
      ⚡️ Zap
    </button>
  );
}
