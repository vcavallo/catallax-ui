import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function WorkerApplicationForm() {
  const { publishEvent } = useNostr();
  const [taskId, setTaskId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");
  const [applicationDetails, setApplicationDetails] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", taskId],
      ["p", creatorPubkey],
      ["p", agentPubkey],
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
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Creator Pubkey"
          value={creatorPubkey}
          onChange={(e) => setCreatorPubkey(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Agent Pubkey"
          value={agentPubkey}
          onChange={(e) => setAgentPubkey(e.target.value)}
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
