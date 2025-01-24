import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function TaskProposalForm() {
  const { publishEvent, publicKey } = useNostr();
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amountSats, setAmountSats] = useState("100000");
  const [agentPubkey, setAgentPubkey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentObj = {
      description,
      requirements,
      deadline: Math.floor(new Date(deadline).getTime() / 1000),
    };

    const tags = [
      ["amount", amountSats],
      ["p", publicKey],  // Include our own pubkey as the creator
      ["p", agentPubkey],  // Then the agent's pubkey
    ];

    await publishEvent({
      kind: 3401,
      tags,
      content: JSON.stringify(contentObj),
    });

    // Reset form
    setDescription("");
    setRequirements("");
    setDeadline("");
    setAmountSats("");
    setAgentPubkey("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Create Task Proposal</h3>
      <div className="space-y-2">
        <textarea 
          className="border p-2 w-full rounded"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <textarea 
          className="border p-2 w-full rounded"
          placeholder="Requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Create Task
        </button>
      </div>
    </form>
  );
}
