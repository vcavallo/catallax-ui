import { useNostr } from '@/lib/nostr';

export default function WalletConnector() {
  const { walletConnected, setupManualWallet } = useNostr();

  if (!walletConnected) {
    return (
      <div className="p-4 border rounded mb-4">
        <h3 className="font-bold mb-2">Connect Lightning Wallet</h3>
        <div className="space-y-2">
          <button
            onClick={setupManualWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
          >
            Enable Manual Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded mb-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-bold">Manual Payments Enabled</span>
        </div>
      </div>
    </div>
  );
}
