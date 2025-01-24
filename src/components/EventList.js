export default function EventList({ events }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl mb-4">Recent Notes</h2>
      {events.map(event => (
        <div key={event.id} className="border p-4 mb-2 rounded">
          <p className="text-gray-600 text-sm mb-2">
            {new Date(event.created_at * 1000).toLocaleString()}
          </p>
          <p>{event.content}</p>
        </div>
      ))}
    </div>
  )
}
