import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function AgentAcceptanceForm() {
  const { publishEvent } = useNostr();
  const [taskId, setTaskId] = useState("");
  const [creatorPubkey, setCreatorPubkey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", taskId],
      ["p", creatorPubkey],
    ];

    await publishEvent({
      kind: 3402,
      tags,
      content: "",
    });

    setTaskId("");
    setCreatorPubkey("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Accept Task as Agent</h3>
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Accept Task
        </button>
      </div>
    </form>
  );
}
