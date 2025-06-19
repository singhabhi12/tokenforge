'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-text font-sans px-4 py-16">
      {/* Top section */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 9.5 8.5 3 10l6.5 2 2.5 6.5 2.5-6.5L21 10l-6.5-1.5L12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TokenForge</h1>
        </div>

        <p className="text-base sm:text-lg text-text/80 mb-1">Generate Design Tokens with AI, Built for Your Brand</p>
        <p className="text-sm text-text/60 mb-8">Transform your brand into a complete design system instantly</p>

        <Link href="/brand">
          <button className="bg-[#9AA5FA] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#7F8EF5] transition">
            Start Building
          </button>
        </Link>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white shadow-md p-6 text-center flex flex-col items-center space-y-4 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-soft flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{feature.title}</h3>
            <p className="text-sm text-text/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

import { Sparkles, Target, Zap } from 'lucide-react'

const features = [
  {
    title: 'Features Highlights',
    description:
      'Complete design tokens for colors, typography, spacing, and more. Export to Figma, JSON, or Tailwind CSS.',
    icon: Target
  },
  {
    title: 'Testimonials / Use Cases',
    description:
      'Trusted by design teams at startups and enterprises. Perfect for brand redesigns, new products, and design systems.',
    icon: Sparkles
  },
  {
    title: 'AI-Powered Simplicity',
    description:
      'Just describe your brand and style preferences. Our AI generates professional design tokens in seconds.',
    icon: Zap
  }
]