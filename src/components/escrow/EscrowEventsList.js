import { useNostr } from "@/lib/nostr";

const KIND_LABELS = {
  3400: "Agent Registration",
  3401: "Task Proposal",
  3402: "Agent Acceptance",
  3403: "Task Finalization",
  3404: "Worker Application",
  3405: "Worker Assignment",
  3406: "Work Submission",
  3407: "Task Resolution",
};

export default function EscrowEventsList() {
  const { events } = useNostr();

  // Filter only escrow events
  const escrowEvents = events.filter(evt => evt.kind >= 3400 && evt.kind <= 3407);

  const renderContent = (event) => {
    try {
      const content = JSON.parse(event.content);
      return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(content, null, 2)}</pre>;
    } catch {
      return <p className="text-sm">{event.content}</p>;
    }
  };

  const renderTags = (tags) => {
    return tags.map(([key, value], i) => (
      <div 
        key={i} 
        className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-2 cursor-pointer hover:bg-gray-200"
        onClick={() => navigator.clipboard.writeText(value)}
        title="Click to copy"
      >
        {key}: <span className="font-mono">{value.slice(0, 8)}...</span>
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">NIP-100 Events</h2>
      {escrowEvents.length === 0 && (
        <div className="p-4 border rounded bg-gray-50">
          No escrow events found. Events will appear here after they are published.
        </div>
      )}

      <div className="space-y-4">
        {escrowEvents.map(event => (
          <div key={event.id} className="border p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold">{KIND_LABELS[event.kind]}</span>
                <span className="text-gray-500 text-xs ml-2">
                  ({new Date(event.created_at * 1000).toLocaleString()})
                </span>
              </div>
              <span className="text-xs bg-gray-200 rounded px-2 py-1">
                Kind: {event.kind}
              </span>
            </div>
            
            <div className="mb-2">
              {renderTags(event.tags)}
            </div>

            <div className="bg-gray-50 p-2 rounded mb-2">
              {renderContent(event)}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div 
                className="cursor-pointer hover:text-gray-700"
                onClick={() => navigator.clipboard.writeText(event.id)}
              >
                ID: <span className="font-mono">{event.id}</span>
              </div>
              <div 
                className="cursor-pointer hover:text-gray-700"
                onClick={() => navigator.clipboard.writeText(event.pubkey)}
              >
                Pubkey: <span className="font-mono">{event.pubkey}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
