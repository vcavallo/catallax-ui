import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function WorkSubmissionForm() {
  const { publishEvent } = useNostr();
  const [assignmentId, setAssignmentId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");
  const [workDetails, setWorkDetails] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", assignmentId],
      ["p", creatorPubkey],
      ["p", agentPubkey],
    ];

    await publishEvent({
      kind: 3406,
      tags,
      content: workDetails,
    });

    setAssignmentId("");
    setCreatorPubkey("");
    setAgentPubkey("");
    setWorkDetails("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Submit Work</h3>
      <div className="space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Assignment Event ID"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
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
          placeholder="Work Details/Proof"
          value={workDetails}
          onChange={(e) => setWorkDetails(e.target.value)}
          rows={4}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Submit Work
        </button>
      </div>
    </form>
  );
}
