'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePageRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/landing')
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center text-lg text-gray-500">
      Redirecting to landing page...
    </div>
  )
}