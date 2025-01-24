import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function TaskFinalizationForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [acceptanceId, setAcceptanceId] = useState("");
  const [zapReceiptId, setZapReceiptId] = useState("");
  const [amountSats, setAmountSats] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");

  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3402) {
      setAcceptanceId(selectedEvent.id);
      const pubkeyTags = selectedEvent.tags.filter(([t]) => t === 'p');
      if (pubkeyTags[0]) setCreatorPubkey(pubkeyTags[0][1]);
      if (pubkeyTags[1]) setAgentPubkey(pubkeyTags[1][1]);
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", acceptanceId],
      ["e", zapReceiptId],
      ["amount", amountSats],
      ["p", agentPubkey],
      ["p", publicKey],  // Include our own pubkey as the creator
    ];

    await publishEvent({
      kind: 3403,
      tags,
      content: "",
    });

    setAcceptanceId("");
    setZapReceiptId("");
    setAmountSats("");
    setAgentPubkey("");
    setCreatorPubkey("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Finalize Task</h3>
      <div className="space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Acceptance Event ID"
          value={acceptanceId}
          onChange={(e) => setAcceptanceId(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Zap Receipt ID"
          value={zapReceiptId}
          onChange={(e) => setZapReceiptId(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Amount in sats"
          value={amountSats}
          onChange={(e) => setAmountSats(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Agent Pubkey"
          value={agentPubkey}
          onChange={(e) => setAgentPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Finalize Task
        </button>
      </div>
    </form>
  );
}
