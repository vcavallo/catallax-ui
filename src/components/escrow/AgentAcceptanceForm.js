import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function AgentAcceptanceForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [taskId, setTaskId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [acceptanceDetails, setAcceptanceDetails] = useState("");

  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3401) {
      setTaskId(selectedEvent.id);
      const pubkeyTags = selectedEvent.tags.filter(([t]) => t === 'p');
      if (pubkeyTags[0]) setCreatorPubkey(pubkeyTags[0][1]);
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", taskId],
      ["p", creatorPubkey],
      ["p", publicKey],  // Include our own pubkey as the agent
    ];

    await publishEvent({
      kind: 3402,
      tags,
      content: acceptanceDetails,
    });

    setTaskId("");
    setCreatorPubkey("");
    setAcceptanceDetails("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Accept Task</h3>
      <div className="space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Task Event ID"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Creator Pubkey"
          value={creatorPubkey}
          onChange={(e) => setCreatorPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Acceptance Details"
          value={acceptanceDetails}
          onChange={(e) => setAcceptanceDetails(e.target.value)}
          rows={4}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Accept Task
        </button>
      </div>
    </form>
  );
}
