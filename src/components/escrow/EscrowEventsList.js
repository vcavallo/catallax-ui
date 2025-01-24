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

const ROLE_EVENT_FILTERS = {
  "Arbiter": (events, pubkey) => events.filter(evt => 
    // Show registrations from this pubkey
    (evt.kind === 3400 && evt.pubkey === pubkey) ||
    // Show task proposals where this pubkey is tagged as agent
    (evt.kind === 3401 && evt.tags.some(([t, p]) => t === 'p' && p === pubkey)) ||
    // Show acceptances and resolutions from this pubkey
    ([3402, 3407].includes(evt.kind) && evt.pubkey === pubkey)
  ),
  "Patron": (events, pubkey) => events.filter(evt =>
    // Show proposals created by this pubkey
    (evt.kind === 3401 && evt.pubkey === pubkey) ||
    // Show events related to tasks created by this pubkey
    evt.tags.some(([t, p]) => t === 'p' && p === pubkey)
  ),
  "Free Agent": (events, pubkey) => events.filter(evt =>
    // Show all open task proposals
    evt.kind === 3401 ||
    // Show applications from this pubkey
    (evt.kind === 3404 && evt.pubkey === pubkey) ||
    // Show assignments and submissions where this pubkey is tagged
    ([3405, 3406].includes(evt.kind) && evt.tags.some(([t, p]) => t === 'p' && p === pubkey))
  ),
};

export default function EscrowEventsList({ role, publicKey, onEventSelect }) {
  const { events } = useNostr();

  // Filter escrow events by kind and role
  const escrowEvents = events
    .filter(evt => evt.kind >= 3400 && evt.kind <= 3407)
    .sort((a, b) => b.created_at - a.created_at);

  const filteredEvents = ROLE_EVENT_FILTERS[role]?.(escrowEvents, publicKey) || escrowEvents;

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

  const getAvailableActions = (event) => {
    const actions = [];
    
    switch (role) {
      case "Arbiter":
        if (event.kind === 3401) actions.push({ label: "Accept", form: "accept" });
        if (event.kind === 3406) actions.push({ label: "Resolve", form: "resolve" });
        break;
      case "Patron":
        if (event.kind === 3402) actions.push({ label: "Finalize", form: "finalize" });
        if (event.kind === 3404) actions.push({ label: "Assign Worker", form: "assign" });
        break;
      case "Free Agent":
        if (event.kind === 3401) actions.push({ label: "Apply", form: "apply" });
        if (event.kind === 3405) actions.push({ label: "Submit Work", form: "submit" });
        break;
    }

    return actions;
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">NIP-100 Events</h2>
      {filteredEvents.length === 0 && (
        <div className="p-4 border rounded bg-gray-50">
          No relevant events found for your role.
        </div>
      )}

      <div className="space-y-4">
        {filteredEvents.map(event => (
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

            {/* Action Buttons */}
            <div className="flex gap-2 mb-2">
              {getAvailableActions(event).map((action, index) => (
                <button
                  key={index}
                  onClick={() => onEventSelect({ ...event, action: action.form })}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  {action.label}
                </button>
              ))}
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
