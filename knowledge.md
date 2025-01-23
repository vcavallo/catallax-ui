i set up Next.js with Router, src/ and Turbopack.
please create a minimal nostr web client using the following rough guide:

// pages/_app.js
import '@/styles/globals.css'
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// pages/index.js
import { useState, useEffect } from 'react'
import EventList from '@/components/EventList'
import PublishForm from '@/components/PublishForm'
import UserProfile from '@/components/UserProfile'
import { useNostr } from '@/lib/nostr'

export default function Home() {
  const { publicKey, events } = useNostr()
  
  return (
    <div className="container mx-auto p-4">
      <UserProfile publicKey={publicKey} />
      <PublishForm />
      <EventList events={events} />
    </div>
  )
}

// components/EventList.js
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

// components/PublishForm.js
import { useState } from 'react'
import { useNostr } from '@/lib/nostr'

export default function PublishForm() {
  const [message, setMessage] = useState('')
  const { publishNote } = useNostr()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await publishNote(message)
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        placeholder="What's on your mind?"
      />
      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Publish
      </button>
    </form>
  )
}

// components/UserProfile.js
export default function UserProfile({ publicKey }) {
  return publicKey ? (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="text-lg font-medium">Connected as:</h2>
      <p className="text-sm font-mono break-all">{publicKey}</p>
    </div>
  ) : (
    <div className="bg-yellow-100 p-4 rounded">
      <p>Please install a Nostr extension (like nos2x or Alby)</p>
    </div>
  )
}

// lib/nostr.js
import { useState, useEffect, createContext, useContext } from 'react'
import { getEventHash } from 'nostr-tools'

const RELAY_URL = 'wss://relay.damus.io'

const NostrContext = createContext()

export function NostrProvider({ children }) {
  const [publicKey, setPublicKey] = useState('')
  const [events, setEvents] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const connectNostr = async () => {
      if (typeof window.nostr === 'undefined') return
      try {
        const pubkey = await window.nostr.getPublicKey()
        setPublicKey(pubkey)
      } catch (err) {
        console.error('Error getting public key:', err)
      }
    }
    connectNostr()
  }, [])

  useEffect(() => {
    const ws = new WebSocket(RELAY_URL)
    
    ws.onopen = () => {
      ws.send(JSON.stringify([
        "REQ",
        "my-sub",
        { kinds: [1], limit: 20 }
      ]))
    }

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data[0] === 'EVENT') {
        setEvents(prev => [data[2], ...prev])
      }
    }

    setSocket(ws)
    return () => ws.close()
  }, [])

  const publishNote = async (content) => {
    if (!publicKey || !content || !socket) return

    const event = {
      kind: 1,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content
    }

    event.id = getEventHash(event)
    event.sig = await window.nostr.signEvent(event)

    socket.send(JSON.stringify(["EVENT", event]))
  }

  return (
    <NostrContext.Provider value={{ publicKey, events, publishNote }}>
      {children}
    </NostrContext.Provider>
  )
}

export const useNostr = () => useContext(NostrContext)

// styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// package.json
{
  "name": "nostr-client",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.4.19",
    "nostr-tools": "^1.17.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3"
  }
}

// next.config.js
module.exports = {
  reactStrictMode: true,
}

// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// .gitignore
node_modules
.next
.env*.local
