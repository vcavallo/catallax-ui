import { useNostr } from "@/lib/nostr";
import { useState } from "react";

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
  const { events, publicKey } = useNostr();
  console.log("EscrowEventsList render:", { events, publicKey });
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Filter only escrow events
  const escrowEvents = events.filter(
    (evt) => evt.kind >= 3400 && evt.kind <= 3407
  );
  console.log("All events:", events);
  console.log("Filtered escrow events:", escrowEvents);

  // Group events by task chain
  const taskChains = escrowEvents.reduce((chains, event) => {
    if (event.kind === 3401) {
      console.log("Found task proposal:", event);
      // This is a task proposal - start of a new chain
      chains[event.id] = {
        proposal: event,
        acceptance: null,
        finalization: null,
        applications: [],
        assignment: null,
        submission: null,
        resolution: null,
      };
    } else {
      // Look through all chains to find where this event belongs
      Object.keys(chains).forEach((taskId) => {
        const chain = chains[taskId];
        const eventRefs = event.tags
          .filter(([t]) => t === "e")
          .map(([_, id]) => id);

        const matches =
          event.kind === 3402
            ? eventRefs.includes(taskId)
            : eventRefs.includes(taskId) ||
              eventRefs.includes(chain.acceptance?.id) ||
              eventRefs.includes(chain.finalization?.id) ||
              chain.applications.some((app) =>
                eventRefs.includes(app.id)
              ) ||
              eventRefs.includes(chain.assignment?.id) ||
              eventRefs.includes(chain.submission?.id);

        if (matches) {
          console.log("Matched event to chain:", {
            eventKind: event.kind,
            taskId,
            chainBefore: { ...chain },
          });

          switch (event.kind) {
            case 3402:
              chain.acceptance = event;
              break;
            case 3403:
              chain.finalization = event;
              break;
            case 3404:
              chain.applications.push(event);
              break;
            case 3405:
              chain.assignment = event;
              break;
            case 3406:
              chain.submission = event;
              break;
            case 3407:
              chain.resolution = event;
              break;
          }

          console.log("Updated chain:", {
            eventKind: event.kind,
            taskId,
            chainAfter: { ...chain },
          });
        }
      });
    }
    return chains;
  }, {});

  const renderContent = (event) => {
    try {
      const content = JSON.parse(event.content);
      return (
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
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

  const renderEvent = (event, isChild = false) => {
    if (!event) return null;

    return (
      <div
        key={event.id}
        className={`border p-4 rounded mb-2 ${
          selectedEventId === event.id ? "bg-blue-50" : ""
        } ${isChild ? "ml-4" : ""}`}
      >
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

        <div className="mb-2">{renderTags(event.tags)}</div>

        <div className="bg-gray-50 p-2 rounded mb-2">
          {renderContent(event)}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div
            className="cursor-pointer hover:text-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(event.id);
              setSelectedEventId(event.id);
            }}
          >
            ID: <span className="font-mono">{event.id}</span>
          </div>
          <div
            className="cursor-pointer hover:text-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(event.pubkey);
            }}
          >
            Pubkey: <span className="font-mono">{event.pubkey}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">NIP-100 Events</h2>
      {escrowEvents.length === 0 && (
        <div className="p-4 border rounded bg-gray-50">
          No escrow events found. Events will appear here after they are
          published.
        </div>
      )}
      {/* Agent Registrations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">
          Agent Registrations
        </h3>
        {escrowEvents
          .filter((event) => event.kind === 3400)
          .map((event) => renderEvent(event))}
      </div>

      {/* Task Chains */}
      {Object.keys(taskChains).length > 0 && (
        <div className="space-y-8">
          <h3 className="text-lg font-semibold mb-2">Task Chains</h3>
          {Object.entries(taskChains).map(([taskId, chain]) => (
            <div
              key={taskId}
              className="border-l-4 border-blue-500 pl-4"
            >
              {renderEvent(chain.proposal)}
              {chain.acceptance && (
                <div className="ml-4">
                  {renderEvent(chain.acceptance, true)}
                  {chain.finalization && (
                    <div className="ml-4">
                      {renderEvent(chain.finalization, true)}
                      <div className="ml-4">
                        {chain.applications.map((app) =>
                          renderEvent(app, true)
                        )}
                        {chain.assignment && (
                          <>
                            {renderEvent(chain.assignment, true)}
                            {chain.submission && (
                              <>
                                {renderEvent(chain.submission, true)}
                                {chain.resolution &&
                                  renderEvent(chain.resolution, true)}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
