'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import EventList from '@/components/EventList'
import PublishForm from '@/components/PublishForm'
import UserProfile from '@/components/UserProfile'
import { useNostr, NostrProvider } from '@/lib/nostr'

function Home() {
  const { publicKey, events } = useNostr()
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link 
          href="/escrow" 
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Escrow Dashboard
        </Link>
      </div>
      <UserProfile publicKey={publicKey} />
      <PublishForm />
      <EventList events={events.filter(e => e.kind === 1)} />
    </div>
  )
}

export default function HomeWrapper() {
  return (
    <NostrProvider>
      <Home />
    </NostrProvider>
  )
}
