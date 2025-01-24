'use client'
import { useState, useEffect } from 'react'
import EventList from '@/components/EventList'
import PublishForm from '@/components/PublishForm'
import UserProfile from '@/components/UserProfile'
import { useNostr, NostrProvider } from '@/lib/nostr'

function Home() {
  const { publicKey, events } = useNostr()
  
  return (
    <div className="container mx-auto p-4">
      <UserProfile publicKey={publicKey} />
      <PublishForm />
      <EventList events={events} />
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
