export default function UserProfile({ publicKey }) {
  return publicKey ? (
    <div className="bg-gray-100 p-4 rounded hover:bg-gray-200 transition-colors cursor-pointer shadow-sm hover:shadow-md">
      <h2 className="text-lg font-medium">Connected as:</h2>
      <p className="text-sm font-mono break-all text-gray-600">{publicKey}</p>
    </div>
  ) : (
    <div className="bg-yellow-100 p-4 rounded hover:bg-yellow-200 transition-colors shadow-sm hover:shadow-md">
      <p>Please install a Nostr extension (like nos2x or Alby)</p>
    </div>
  )
}
