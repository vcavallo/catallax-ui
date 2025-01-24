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
import { NostrProvider } from "@/lib/nostr";
import { useState } from "react";

function EscrowDashboard() {
  const [activeForm, setActiveForm] = useState("register");

  const forms = {
    register: <AgentRegistrationForm />,
    propose: <TaskProposalForm />,
    accept: <AgentAcceptanceForm />,
    finalize: <TaskFinalizationForm />,
    apply: <WorkerApplicationForm />,
    assign: <WorkerAssignmentForm />,
    submit: <WorkSubmissionForm />,
    resolve: <TaskResolutionForm />,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        NIP-100 Escrow Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(forms).map(([key, _]) => (
              <button
                key={key}
                onClick={() => setActiveForm(key)}
                className={`px-3 py-1 rounded ${
                  activeForm === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {forms[activeForm]}
        </div>

        <div className="border rounded p-4">
          <div className="mb-2 text-sm text-gray-600">Event List Status:</div>
          <EscrowEventsList />
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
