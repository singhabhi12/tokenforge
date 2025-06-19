'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const niches = ['tech', 'fashion', 'health', 'finance', 'nonprofit']

export default function BrandPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    purpose: '',
    values: '',
    niche: [] as string[]
  })

  const toggleNiche = (value: string) => {
    setForm(prev => ({
      ...prev,
      niche: prev.niche.includes(value)
        ? prev.niche.filter(n => n !== value)
        : [...prev.niche, value]
    }))
  }

  const handleContinue = () => {
    if (!form.name || !form.purpose || !form.values) return
    sessionStorage.setItem('brandForm', JSON.stringify(form))
    router.push('/style')
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] text-[#23272F] font-sans px-4 py-10 flex flex-col items-center">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {[1, 2, 3].map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg font-semibold transition-colors duration-200
                ${step === 1 ? 'bg-[#C7CCF8] text-white' : 'bg-[#E9EAF3] text-[#B0B3C7]'}
              `}
            >
              {step}
            </div>
            {idx < 2 && (
              <div className="w-12 md:w-16 h-0.5 bg-[#E9EAF3] mx-2 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 flex flex-col items-stretch border border-[#F2F3F7]">
        <h2 className="text-2xl font-bold mb-6 text-[#23272F]">Tell us about your brand</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-base font-medium mb-2 text-[#23272F]">Brand Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your brand name"
              className="w-full p-3 rounded-xl border-none bg-[#F8F9FB] focus:ring-2 focus:ring-[#C7CCF8] text-base outline-none transition placeholder:text-[#B0B3C7]"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2 text-[#23272F]">Brand Purpose</label>
            <textarea
              rows={2}
              value={form.purpose}
              onChange={e => setForm({ ...form, purpose: e.target.value })}
              placeholder="What does your brand do? What problem does it solve?"
              className="w-full p-3 rounded-xl border-none bg-[#F8F9FB] focus:ring-2 focus:ring-[#C7CCF8] text-base outline-none transition placeholder:text-[#B0B3C7]"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2 text-[#23272F]">Values / Vision / Mission</label>
            <textarea
              rows={2}
              value={form.values}
              onChange={e => setForm({ ...form, values: e.target.value })}
              placeholder="What are your brand values, vision, and mission?"
              className="w-full p-3 rounded-xl border-none bg-[#F8F9FB] focus:ring-2 focus:ring-[#C7CCF8] text-base outline-none transition placeholder:text-[#B0B3C7]"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2 text-[#23272F]">
              Niche (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {niches.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleNiche(tag)}
                  type="button"
                  className={`px-3 py-1.5 rounded-full border text-sm capitalize transition font-medium
                    ${form.niche.includes(tag)
                      ? 'bg-[#C7CCF8] text-white border-none shadow-sm'
                      : 'bg-white text-[#23272F] border border-[#E9EAF3] hover:bg-[#F8F9FB]'}
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            className="px-6 py-2.5 rounded-full border border-[#E9EAF3] text-base font-medium bg-white text-[#23272F] hover:bg-[#F8F9FB] transition"
            onClick={() => router.push('/landing')}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="flex-1 ml-4 bg-[#C7CCF8] text-white px-6 py-3 rounded-full font-semibold text-base shadow-md hover:bg-[#B0B3C7] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!form.name || !form.purpose || !form.values}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  )
}