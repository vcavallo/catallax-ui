import { useState } from "react";
import { useNostr } from "@/lib/nostr";

export default function AgentRegistrationForm() {
  const { publishEvent, publicKey } = useNostr();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [feeRate, setFeeRate] = useState(0.01);
  const [minAmount, setMinAmount] = useState(1000);
  const [maxAmount, setMaxAmount] = useState(1000000);
  const [disputePolicy, setDisputePolicy] = useState(
    "Mediation first, then arbitration"
  );
  const [termsUrl, setTermsUrl] = useState("https://terms.example.com");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentObj = {
      name,
      about,
      fee_rate: parseFloat(feeRate),
      min_amount: parseInt(minAmount, 10),
      max_amount: parseInt(maxAmount, 10),
      dispute_resolution_policy: disputePolicy,
      supported_currencies: ["BTC"],
    };

    const tags = [
      ["r", termsUrl],
      ["p", publicKey], // Include agent's own pubkey
    ];

    console.log({ kind: 3400, tags, contentObj });
    await publishEvent({
      kind: 3400,
      tags,
      content: JSON.stringify(contentObj),
    });

    // Reset form
    setName("");
    setAbout("");
    setFeeRate(0.01);
    setMinAmount(1000);
    setMaxAmount(1000000);
    setDisputePolicy("Mediation first, then arbitration");
    setTermsUrl("https://terms.example.com");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Register as Escrow Agent</h3>
      <div className="space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="About"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Fee Rate"
          type="number"
          step="0.001"
          value={feeRate}
          onChange={(e) => setFeeRate(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Min Amount (sats)"
          type="number"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Max Amount (sats)"
          type="number"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Dispute resolution policy"
          value={disputePolicy}
          onChange={(e) => setDisputePolicy(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Terms URL"
          value={termsUrl}
          onChange={(e) => setTermsUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Register as Agent
        </button>
      </div>
    </form>
  );
}
