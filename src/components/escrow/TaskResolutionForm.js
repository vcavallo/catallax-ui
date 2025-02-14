import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function TaskResolutionForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [submissionId, setSubmissionId] = useState("");
  const [zapReceiptId, setZapReceiptId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");
  const [workerPubkey, setWorkerPubkey] = useState("");
  const [amountSats, setAmountSats] = useState("");
  const [resolution, setResolution] = useState("completed");
  const [resolutionDetails, setResolutionDetails] = useState("");

  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3406) {
      setSubmissionId(selectedEvent.id);
      // Get pubkeys from p tags (creator, agent, worker)
      const pubkeyTags = selectedEvent.tags.filter(([t]) => t === 'p');
      if (pubkeyTags[0]) setCreatorPubkey(pubkeyTags[0][1]); // Creator is first p tag
      if (pubkeyTags[2]) setWorkerPubkey(pubkeyTags[2][1]); // Worker is third p tag
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentObj = {
      resolution,
      resolution_details: resolutionDetails,
    };

    const tags = [
      ["amount", amountSats],
      ["e", submissionId],
      ["e", zapReceiptId],
      ["p", creatorPubkey],
      ["p", workerPubkey],
      ["p", publicKey],  // Include our own pubkey as the agent
    ];

    await publishEvent({
      kind: 3407,
      tags,
      content: JSON.stringify(contentObj),
    });

    setSubmissionId("");
    setZapReceiptId("");
    setCreatorPubkey("");
    setWorkerPubkey("");
    setAmountSats("");
    setResolution("completed");
    setResolutionDetails("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Resolve Task</h3>
      <div className="space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Work Submission Event ID"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
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
          placeholder="Creator Pubkey"
          value={creatorPubkey}
          onChange={(e) => setCreatorPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Worker Pubkey"
          value={workerPubkey}
          onChange={(e) => setWorkerPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Amount in sats"
          value={amountSats}
          onChange={(e) => setAmountSats(e.target.value)}
        />
        <select
          className="border p-2 w-full rounded"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="canceled">Canceled</option>
        </select>
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Resolution Details"
          value={resolutionDetails}
          onChange={(e) => setResolutionDetails(e.target.value)}
          rows={4}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Resolve Task
        </button>
      </div>
    </form>
  );
}
