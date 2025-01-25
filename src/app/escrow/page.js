"use client";
import AgentRegistrationForm from "@/components/escrow/AgentRegistrationForm";
import TaskProposalForm from "@/components/escrow/TaskProposalForm";
import AgentAcceptanceForm from "@/components/escrow/AgentAcceptanceForm";
import TaskFinalizationForm from "@/components/escrow/TaskFinalizationForm";
import WorkerApplicationForm from "@/components/escrow/WorkerApplicationForm";
import WorkerAssignmentForm from "@/components/escrow/WorkerAssignmentForm";
import WorkSubmissionForm from "@/components/escrow/WorkSubmissionForm";
import TaskResolutionForm from "@/components/escrow/TaskResolutionForm";
import EscrowEventsList from "@/components/escrow/EscrowEventsList";
import ZapComponent from "@/components/ZapComponent";
import { NostrProvider, useNostr } from "@/lib/nostr";
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

const ROLES = {
  ARBITER: "Arbiter",
  PATRON: "Patron",
  FREE_AGENT: "Free Agent",
};

const ROLE_FORMS = {
  [ROLES.ARBITER]: ["register", "accept", "resolve"],
  [ROLES.PATRON]: ["propose", "finalize", "assign"],
  [ROLES.FREE_AGENT]: ["apply", "submit"],
};

// Forms that should be visible without clicking an event
const INITIAL_FORMS = {
  [ROLES.ARBITER]: ["register"],
  [ROLES.PATRON]: ["propose"],
  [ROLES.FREE_AGENT]: [],
};

function EscrowDashboard() {
  const [activeRole, setActiveRole] = useState(ROLES.PATRON);
  const [activeForm, setActiveForm] = useState("propose");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { publicKey } = useNostr();

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setActiveForm(event.action);
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setSelectedEvent(null);
    // Set the first available initial form for this role as active
    setActiveForm(INITIAL_FORMS[role][0] || ROLE_FORMS[role][0]);
  };

  // Only show form if it's an initial form or if we have a selected event
  const shouldShowForm = (formKey) => {
    if (selectedEvent && selectedEvent.action === formKey) return true;
    return INITIAL_FORMS[activeRole].includes(formKey);
  };

  const forms = {
    register: <AgentRegistrationForm />,
    propose: <TaskProposalForm />,
    accept: <AgentAcceptanceForm selectedEvent={selectedEvent} />,
    finalize: <TaskFinalizationForm selectedEvent={selectedEvent} />,
    apply: <WorkerApplicationForm selectedEvent={selectedEvent} />,
    assign: <WorkerAssignmentForm selectedEvent={selectedEvent} />,
    submit: <WorkSubmissionForm selectedEvent={selectedEvent} />,
    resolve: <TaskResolutionForm selectedEvent={selectedEvent} />,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        NIP-100 Escrow Dashboard
      </h1>
      <ZapComponent
        npub="npub19ma2w9dmk3kat0nt0k5dwuqzvmg3va9ezwup0zkakhpwv0vcwvcsg8axkl"
        relays="wss://nos.lol,ws://localhost:3334"
        onZapComplete={(event) => {
          console.log("Zap completed!", event);
        }}
      />

      {/* Role Selection */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          {Object.values(ROLES).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-4 py-2 rounded-lg ${
                activeRole === role
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* Form Selection - Only show forms relevant to the active role */}
          <div className="mb-4 flex flex-wrap gap-2">
            {ROLE_FORMS[activeRole].map((formKey) => (
              <button
                key={formKey}
                onClick={() => {
                  setActiveForm(formKey);
                  setSelectedEvent(null);
                }}
                className={`px-3 py-1 rounded ${
                  activeForm === formKey
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {formKey.charAt(0).toUpperCase() + formKey.slice(1)}
              </button>
            ))}
          </div>

          {shouldShowForm(activeForm) && forms[activeForm]}

          {selectedEvent && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">Selected Event:</h3>
              <p className="text-sm">
                {KIND_LABELS[selectedEvent.kind]} -{" "}
                {selectedEvent.id.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>

        <div className="border rounded p-4">
          <div className="mb-2 text-sm text-gray-600">
            Event List Status:
          </div>
          <EscrowEventsList
            role={activeRole}
            publicKey={publicKey}
            onEventSelect={handleEventSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default function EscrowPage() {
  return (
    <NostrProvider>
      <EscrowDashboard />
    </NostrProvider>
  );
}
