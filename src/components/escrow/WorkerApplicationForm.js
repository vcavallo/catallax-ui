import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function WorkerApplicationForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [taskId, setTaskId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");
  const [applicationDetails, setApplicationDetails] = useState("");

  // Pre-fill form when selectedEvent changes
  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3401) {
      setTaskId(selectedEvent.id);
      // Find creator and agent pubkeys from tags
      const creatorTag = selectedEvent.tags.find(([t, p]) => t === 'p' && p !== agentPubkey);
      const agentTag = selectedEvent.tags.find(([t, p]) => t === 'p' && p === agentPubkey);
      
      if (creatorTag) setCreatorPubkey(creatorTag[1]);
      if (agentTag) setAgentPubkey(agentTag[1]);
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", taskId],
      ["p", creatorPubkey],
      ["p", agentPubkey],
      ["p", publicKey],  // Include our own pubkey as the worker
    ];

    await publishEvent({
      kind: 3404,
      tags,
      content: applicationDetails,
    });

    setTaskId("");
    setCreatorPubkey("");
    setAgentPubkey("");
    setApplicationDetails("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Apply for Task</h3>
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
        <input
          className="border p-2 w-full rounded"
          placeholder="Agent Pubkey"
          value={agentPubkey}
          onChange={(e) => setAgentPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Application Details"
          value={applicationDetails}
          onChange={(e) => setApplicationDetails(e.target.value)}
          rows={4}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Submit Application
        </button>
      </div>
    </form>
  );
}
