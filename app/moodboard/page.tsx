// @ts-nocheck
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ColorThief from 'color-thief-browser'

// Types
interface AnalysisResult {
  mainColor: { name: string; hex: string }
  style: string
  colors: string[]
}

// Real API call for GPT-4o moodboard analysis
async function analyzeImageWithGPT(imageBase64: string, colors: string[]): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze-moodboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, colors })
  })
  if (!res.ok) throw new Error('Failed to analyze moodboard image')
  return await res.json()
}

export default function MoodboardPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemove = () => {
    setFile(null)
    setAnalysis(null)
    setImageDataUrl(null)
    setError(null)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setAnalysis(null)
    setError(null)
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        setImageDataUrl(dataUrl)
        // Extract colors
        try {
          const img = new window.Image()
          img.crossOrigin = 'Anonymous'
          img.src = dataUrl
          img.onload = async () => {
            const colorThief = new ColorThief()
            const palette = colorThief.getPalette(img, 5) as [number, number, number][]
            const hexColors = palette.map((rgb: [number, number, number]) =>
              '#' + rgb.map((x: number) => x.toString(16).padStart(2, '0')).join('')
            )
            // Call GPT-4o via real API
            try {
              const gptResult = await analyzeImageWithGPT(dataUrl, hexColors)
              setAnalysis(gptResult)
            } catch (apiErr) {
              setError('AI analysis failed. Please try again.')
            }
          }
        } catch (err) {
          setError('Could not analyze image colors.')
        }
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    setError(null)
    if (file && imageDataUrl) {
      try {
        sessionStorage.setItem('moodboardImageBase64', imageDataUrl)
        // You may want to store analysis as well
        router.push('/preview')
      } catch (err: any) {
        setError('Something went wrong.')
        setUploading(false)
      }
    } else {
      router.push('/preview')
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] flex flex-col items-center px-4 py-10">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {[1, 2, 3].map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg font-semibold transition-colors duration-200
                ${step === 3 ? 'bg-[#C7CCF8] text-white' : 'bg-[#E9EAF3] text-[#B0B3C7]'}
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
        <h2 className="text-2xl font-bold mb-2 text-[#23272F]">Add your moodboard</h2>
        <p className="text-sm text-[#6B7280] mb-8">Upload images that inspire your brand's visual direction. Our AI will analyze colors, styles, and aesthetics to create more accurate tokens. (Optional)</p>

        {/* Upload Area */}
        {!file && (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#E9EAF3] rounded-2xl bg-white py-10 mb-8 cursor-pointer transition hover:border-[#C7CCF8]"
            style={{ minHeight: 220 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-[#F8F9FB] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#B0B3C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0-3.5 3.5M12 8l3.5 3.5" />
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="#E9EAF3" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div className="text-base font-semibold text-[#23272F] mb-1">Upload inspiration images</div>
              <div className="text-xs text-[#6B7280] mb-4">Drag & drop or click to browse • PNG, JPG up to 10MB</div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EAF3] bg-white text-[#23272F] font-medium text-sm hover:bg-[#F8F9FB] transition"
                onClick={e => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B0B3C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-3A2.25 2.25 0 0 0 8.25 5.25V9m-3.5 3.75h14.5M12 16v-7" />
                </svg>
                Choose Files
              </button>
            </div>
          </div>
        )}

        {/* Uploaded Image Card */}
        {file && analysis && (
          <div className="mb-6 flex flex-col items-start">
            <div className="relative w-40 rounded-2xl overflow-hidden shadow border border-[#E9EAF3] mb-2">
              <div className="h-24 w-full" style={{ background: analysis.mainColor.hex }} />
              <button
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#E9EAF3] flex items-center justify-center text-[#D32F2F] hover:bg-[#F8F9FB]"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white p-4 rounded-b-2xl flex flex-col items-center">
                <div className="font-semibold text-sm text-[#23272F] mb-1">{analysis.mainColor.name}</div>
                <div className="text-xs text-[#B0B3C7] mb-2">{analysis.mainColor.hex}</div>
                <div className="flex items-center mb-2">
                  <span className="text-xs text-[#6B7280] mr-1">Detected Style:</span>
                  <span className="text-xs bg-[#F8F9FB] rounded px-2 py-0.5 text-[#23272F] border border-[#E9EAF3]">{analysis.style}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#6B7280] mr-1">Colors:</span>
                  {analysis.colors.map((color, idx) => (
                    <span key={color+idx} className="w-4 h-4 rounded-full border border-[#E9EAF3]" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Status Bar */}
            <div className="w-full mt-2 flex items-center justify-between bg-[#F8F9FB] rounded-full px-4 py-2 text-sm border border-[#E9EAF3]">
              <span>1 image uploaded</span>
              <span className="text-[#6B7280]">AI will analyze these for token generation</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            className="px-6 py-2.5 rounded-full border border-[#E9EAF3] text-base font-medium bg-white text-[#23272F] hover:bg-[#F8F9FB] transition"
            onClick={() => router.push('/style')}
            disabled={uploading}
          >
            Back
          </button>

          <button
            onClick={handleUpload}
            className="flex-1 ml-4 bg-[#C7CCF8] text-white px-6 py-3 rounded-full font-semibold text-base shadow-md hover:bg-[#B0B3C7] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !file || !analysis}
          >
            {uploading ? 'Processing...' : 'Generate Tokens'}
          </button>
        </div>
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
      </div>
    </main>
  )
}