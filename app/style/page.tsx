'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type ThemeOption = {
  id: string
  name: string
}

const THEMES: ThemeOption[] = [
  { id: 'minimal', name: 'Minimal' },
  { id: 'bold', name: 'Bold' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'playful', name: 'Playful' },
  { id: 'futuristic', name: 'Futuristic' }
]

export default function StylePage() {
  const router = useRouter()

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null)
  const [warmth, setWarmth] = useState(40)
  const [brightness, setBrightness] = useState(40)
  const [typo, setTypo] = useState('')

  const handleNext = () => {
    if (!selectedTheme || !typo) return
    sessionStorage.setItem('theme', selectedTheme.id)
    sessionStorage.setItem('warmth', warmth.toString())
    sessionStorage.setItem('brightness', brightness.toString())
    sessionStorage.setItem('typography', typo)
    router.push('/moodboard')
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] flex flex-col items-center px-4 py-10">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {[1, 2, 3].map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg font-semibold transition-colors duration-200
                ${step === 2 ? 'bg-[#C7CCF8] text-white' : 'bg-[#E9EAF3] text-[#B0B3C7]'}
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
        <h2 className="text-2xl font-bold mb-8 text-[#23272F]">Choose your visual style</h2>

        {/* Visual Style Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              type="button"
              className={clsx(
                'h-16 rounded-2xl border text-lg font-medium transition flex items-center justify-center',
                selectedTheme?.id === theme.id
                  ? 'bg-[#F8F9FB] border-[#C7CCF8] text-[#23272F] shadow-sm'
                  : 'bg-white border-[#E9EAF3] text-[#23272F] hover:bg-[#F8F9FB]'
              )}
            >
              {theme.name}
            </button>
          ))}
        </div>

        {/* Color Tone Slider */}
        <div className="mb-6">
          <label className="block text-base font-medium mb-2 text-[#23272F]">Color Tone</label>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#B0B3C7]">Warm</span>
            <input
              type="range"
              min={0}
              max={100}
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              className="flex-1 accent-[#C7CCF8] h-2 rounded-full bg-[#E9EAF3]"
              style={{ background: `linear-gradient(to right, #C7CCF8 ${warmth}%, #E9EAF3 ${warmth}%)` }}
            />
            <span className="text-xs text-[#B0B3C7]">Cool</span>
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="mb-6">
          <label className="block text-base font-medium mb-2 text-[#23272F]">Brightness</label>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#B0B3C7]">Muted</span>
            <input
              type="range"
              min={0}
              max={100}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 accent-[#C7CCF8] h-2 rounded-full bg-[#E9EAF3]"
              style={{ background: `linear-gradient(to right, #C7CCF8 ${brightness}%, #E9EAF3 ${brightness}%)` }}
            />
            <span className="text-xs text-[#B0B3C7]">Vibrant</span>
          </div>
        </div>

        {/* Typography Style Dropdown */}
        <div className="mb-8">
          <label className="block text-base font-medium mb-2 text-[#23272F]">Typography Style</label>
          <select
            value={typo}
            onChange={(e) => setTypo(e.target.value)}
            className="w-full p-3 rounded-xl border-none bg-[#F8F9FB] text-[#23272F] placeholder:text-[#B0B3C7] focus:ring-2 focus:ring-[#C7CCF8] text-base outline-none transition"
          >
            <option value="" disabled>Select typography style</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="techy">Techy</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            className="px-6 py-2.5 rounded-full border border-[#E9EAF3] text-base font-medium bg-white text-[#23272F] hover:bg-[#F8F9FB] transition"
            onClick={() => router.push('/brand')}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex-1 ml-4 bg-[#C7CCF8] text-white px-6 py-3 rounded-full font-semibold text-base shadow-md hover:bg-[#B0B3C7] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedTheme || !typo}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  )
}