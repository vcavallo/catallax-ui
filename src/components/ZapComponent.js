"use client";
import { useEffect, useRef } from "react";
import { init, initTarget, injectCSS } from "../../nostr-zap/src/view";

// Inject CSS only once when component is first loaded
if (typeof window !== "undefined") {
  injectCSS();
}

export default function ZapComponent({
  npub,
  noteId,
  relays,
  onZapComplete,
}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const current = buttonRef.current;
    if (!current) return;

    current.setAttribute("data-npub", npub);
    if (noteId) {
      current.setAttribute("data-note-id", noteId);
    }
    if (relays) {
      current.setAttribute("data-relays", relays);
    }
    
    // Initialize once
    initTarget(current, onZapComplete);

    // Cleanup on unmount
    return () => {
      if (current.parentNode) {
        current.replaceWith(current.cloneNode(true));
      }
    };
  }, []); // Empty deps since we only want to init once

  return (
    <button
      ref={buttonRef}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
    >
      ⚡️ Zap
    </button>
  );
}
