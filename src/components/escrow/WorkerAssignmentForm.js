import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr";

export default function WorkerAssignmentForm({ selectedEvent }) {
  const { publishEvent, publicKey } = useNostr();
  const [taskId, setTaskId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [workerPubkey, setWorkerPubkey] = useState("");
  const [agentPubkey, setAgentPubkey] = useState("");

  useEffect(() => {
    if (selectedEvent && selectedEvent.kind === 3404) {
      setApplicationId(selectedEvent.id);
      // Get task ID from the application's e tag
      const taskTag = selectedEvent.tags.find(([t]) => t === 'e');
      if (taskTag) setTaskId(taskTag[1]);
      
      // Get pubkeys from p tags (creator, agent, worker)
      const pubkeyTags = selectedEvent.tags.filter(([t]) => t === 'p');
      if (pubkeyTags[2]) setWorkerPubkey(pubkeyTags[2][1]); // Worker is the third p tag
      if (pubkeyTags[1]) setAgentPubkey(pubkeyTags[1][1]); // Agent is the second p tag
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = [
      ["e", taskId],
      ["e", applicationId],
      ["p", workerPubkey],
      ["p", agentPubkey],
      ["p", publicKey],  // Include our own pubkey as the creator
    ];

    await publishEvent({
      kind: 3405,
      tags,
      content: "",
    });

    setTaskId("");
    setApplicationId("");
    setWorkerPubkey("");
    setAgentPubkey("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Assign Worker to Task</h3>
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
          placeholder="Application Event ID"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
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
          placeholder="Agent Pubkey"
          value={agentPubkey}
          onChange={(e) => setAgentPubkey(e.target.value)}
          readOnly={!!selectedEvent}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Assign Worker
        </button>
      </div>
    </form>
  );
}
