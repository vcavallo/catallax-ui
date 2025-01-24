import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function WorkSubmissionForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [assignmentId, setAssignmentId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");
  const [submissionDetails, setSubmissionDetails] = useState("");

  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3405) {
      setAssignmentId(selectedEvent.id);
      // Get pubkeys from p tags (worker, agent, creator)
      const pubkeyTags = selectedEvent.tags.filter(([t]) => t === 'p');
      if (pubkeyTags[2]) setCreatorPubkey(pubkeyTags[2][1]); // Creator is third p tag
      if (pubkeyTags[1]) setAgentPubkey(pubkeyTags[1][1]); // Agent is second p tag
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", assignmentId],
      ["p", creatorPubkey],
      ["p", agentPubkey],
      ["p", publicKey],  // Include our own pubkey as the worker
    ];

    await publishEvent({
      kind: 3406,
      tags,
      content: submissionDetails,
    });

    setAssignmentId("");
    setCreatorPubkey("");
    setAgentPubkey("");
    setSubmissionDetails("");
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
          placeholder="Submission Details"
          value={submissionDetails}
          onChange={(e) => setSubmissionDetails(e.target.value)}
          rows={4}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Submit Work
        </button>
      </div>
    </form>
  );
}
