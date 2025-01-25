import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function PublishForm() {
  const [message, setMessage] = useState("");
  const { publishNote } = useNostr();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await publishNote(message);
    setMessage("");
  };

  const conso = (e) => {
    console.log("conso", { e });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        placeholder="What's on your mind?"
        onZapComplete={conso}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Publish
      </button>
    </form>
  );
}
