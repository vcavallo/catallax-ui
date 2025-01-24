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
import { NostrProvider, useNostr } from "@/lib/nostr";
import { useState } from "react";

const ROLES = {
  ARBITER: "Arbiter",
  PATRON: "Patron",
  FREE_AGENT: "Free Agent"
};

const ROLE_FORMS = {
  [ROLES.ARBITER]: ["register", "accept", "resolve"],
  [ROLES.PATRON]: ["propose", "finalize", "assign"],
  [ROLES.FREE_AGENT]: ["apply", "submit"]
};

function EscrowDashboard() {
  const [activeRole, setActiveRole] = useState(ROLES.PATRON);
  const [activeForm, setActiveForm] = useState("propose");
  const { publicKey } = useNostr();

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

  const handleRoleChange = (role) => {
    setActiveRole(role);
    // Set the first available form for this role as active
    setActiveForm(ROLE_FORMS[role][0]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        NIP-100 Escrow Dashboard
      </h1>

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
                onClick={() => setActiveForm(formKey)}
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

          {forms[activeForm]}
        </div>

        <div className="border rounded p-4">
          <div className="mb-2 text-sm text-gray-600">Event List Status:</div>
          <EscrowEventsList 
            role={activeRole} 
            publicKey={publicKey}
            onEventSelect={(event) => {
              // This will be implemented in EscrowEventsList
              console.log("Selected event:", event);
            }}
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
