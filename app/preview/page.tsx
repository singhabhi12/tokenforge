'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Palette, Type, Image as LucideImage, Sparkles } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PDFImage } from "@react-pdf/renderer";
import '@fontsource-variable/inter';
import '@fontsource-variable/montserrat';

/* ---------- types ---------- */
type TokenCategory = Record<string, string>

interface TokenData {
  color: TokenCategory
  font: TokenCategory
  spacing: TokenCategory
  radius: TokenCategory
  illustrations?: string[]
}

interface FigmaTokenFormat {
  [category: string]: {
    [tokenName: string]: {
      value: string
    }
  }
}

/* ---------- util: convert to Figma Tokens JSON ---------- */
function toFigmaFormat(tokens: TokenData): FigmaTokenFormat {
  const result: FigmaTokenFormat = {}

  for (const category of Object.keys(tokens) as (keyof TokenData)[]) {
    // Only process if the category is an object (not the 'illustrations' array)
    const categoryTokens = tokens[category]
    if (typeof categoryTokens === 'object' && !Array.isArray(categoryTokens) && categoryTokens !== null) {
      result[category] = {}
      for (const key of Object.keys(categoryTokens)) {
        result[category][key] = {
          value: (categoryTokens as TokenCategory)[key]
        }
      }
    }
  }

  return result
}

/* ---------- page ---------- */
const SIDEBAR_TABS = [
  { key: 'color', label: 'Color' },
  { key: 'typography', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'radius', label: 'Radius' },
  { key: 'shadows', label: 'Shadows' }
]

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  backgroundLight: 'Background Light',
  backgroundDark: 'Background Dark',
  textLight: 'Text Light',
  textDark: 'Text Dark',
  success: 'Success',
  warning: 'Warning',
  error: 'Error'
}

const COLOR_ORDER = [
  'primary', 'secondary', 'accent',
  'backgroundLight', 'backgroundDark',
  'textLight', 'textDark',
  'success', 'warning', 'error'
]

const getGoogleFont = (font: string) => {
  if (!font) return 'Inter, sans-serif';
  if (font.toLowerCase().includes('montserrat')) return 'Montserrat, sans-serif';
  if (font.toLowerCase().includes('dm sans')) return 'DM Sans, sans-serif';
  return 'Inter, sans-serif';
};

const BrandSheetPDF = ({ tokens, brandName, fontFamily }: any) => (
  <Document>
    <Page size="A4" style={{ padding: 32, fontFamily: 'Helvetica' }}>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: 700 }}>{brandName || 'Your Brand'} Brand Sheet</Text>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Color Palette</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {Object.entries(tokens.color).map(([k, v]: any) => (
            <View key={k} style={{ width: 48, height: 48, backgroundColor: v, marginRight: 8, borderRadius: 8, border: '1px solid #eee' }} />
          ))}
        </View>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Typography</Text>
        <Text style={{ fontSize: 16, fontFamily }}>{fontFamily}</Text>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Buttons</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <View style={{ backgroundColor: tokens.color.primary, color: '#fff', padding: 8, borderRadius: 8, marginRight: 8 }}>
            <Text>Primary Button</Text>
          </View>
          <View style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8 }}>
            <Text>Secondary Button</Text>
          </View>
        </View>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Icons</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Text>🎨</Text>
          <Text>🔤</Text>
          <Text>✨</Text>
        </View>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>3D Illustrations</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {tokens.illustrations && tokens.illustrations.map((src: string, i: number) => (
            src.startsWith('http') ? (
              <PDFImage key={i} src={src} style={{ width: 64, height: 64, marginRight: 8 }} />
            ) : (
              <Text key={i} style={{ width: 64, height: 64, marginRight: 8, fontSize: 10 }}>{src}</Text>
            )
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default function PreviewPage() {
  // All hooks at the top
  const router = useRouter()
  const [tokens, setTokens] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [tab, setTab] = useState('color')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const progressRef = useRef<number>(0)

  // Gather brand info for loading screen
  const brandName = typeof window !== 'undefined' ? (sessionStorage.getItem('brandName') || JSON.parse(sessionStorage.getItem('brandForm') || '{}').name || '') : ''
  const style = typeof window !== 'undefined' ? (sessionStorage.getItem('theme') || JSON.parse(sessionStorage.getItem('styleForm') || '{}').theme || '—') : '—'
  const typography = typeof window !== 'undefined' ? (sessionStorage.getItem('typography') || JSON.parse(sessionStorage.getItem('styleForm') || '{}').typography || '—') : '—'
  const industry = typeof window !== 'undefined' ? (sessionStorage.getItem('niche') || JSON.parse(sessionStorage.getItem('brandForm') || '{}').niche || 'General') : 'General'
  const moodboardCount = typeof window !== 'undefined' ? (sessionStorage.getItem('moodboardImageBase64') ? 1 : 0) : 0

  // Animate progress bar and icon
  useEffect(() => {
    if (!loading) return
    let frame: number
    const animate = () => {
      setProgress((prev) => {
        if (prev < 92) {
          progressRef.current = prev + Math.random() * 2 + 0.5
          return Math.min(progressRef.current, 92)
        }
        return prev
      })
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [loading])

  useEffect(() => {
    const run = async () => {
      try {
        const body = {
          brandName: sessionStorage.getItem('brandName'),
          purpose: sessionStorage.getItem('purpose'),
          values: sessionStorage.getItem('values'),
          niche: sessionStorage.getItem('niche'),
          theme: sessionStorage.getItem('theme'),
          warmth: sessionStorage.getItem('warmth'),
          brightness: sessionStorage.getItem('brightness'),
          typography: sessionStorage.getItem('typography'),
          moodboardImageBase64: sessionStorage.getItem('moodboardImageBase64')
        }
        const res = await fetch('/api/generate-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('Server response was not valid JSON')
        }
        if (!res.ok) throw new Error(json.error || 'Token generation failed')
        setTokens(json.tokens as TokenData)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setProgress(100)
        setTimeout(() => setLoading(false), 600)
      }
    }
    run()
  }, [])

  // Sidebar tokens (always call hooks at the top level)
  const sidebarTokens = useMemo(() => {
    if (!tokens) return []
    if (tab === 'color') {
      return COLOR_ORDER.filter(k => tokens.color[k]).map(k => ({
        label: COLOR_LABELS[k] || k,
        value: tokens.color[k],
        key: k
      }))
    }
    if (tab === 'typography') {
      return Object.entries(tokens.font).map(([k, v]) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: v,
        key: k
      }))
    }
    if (tab === 'spacing') {
      return Object.entries(tokens.spacing).map(([k, v]) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: v,
        key: k
      }))
    }
    if (tab === 'radius') {
      return Object.entries(tokens.radius).map(([k, v]) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: v,
        key: k
      }))
    }
    if (tab === 'shadows') {
      // Placeholder for shadow tokens
      return [
        { label: 'Card Shadow', value: '0 4px 24px 0 rgba(44,62,80,0.08)', key: 'card' }
      ]
    }
    return []
  }, [tokens, tab])

  // Now, after all hooks, do conditional returns
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-4 py-10">
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Rotating Icon */}
          <div
            className="mb-8"
            style={{
              transition: 'transform 0.2s',
              transform: `rotate(${progress * 3.6}deg)`
            }}
          >
            <div className="w-20 h-20 rounded-full bg-[#E0E4FC] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#C7CCF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#C7CCF8" strokeWidth="1.5" fill="#F8F9FB" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 14l3-4 3 4" />
                <circle cx="12" cy="10" r="1" fill="#C7CCF8" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#23272F] mb-2 text-center">Analyzing Your Visual Inspiration</h1>
          <div className="text-base text-[#23272F] mb-1 text-center">Creating tokens for <span className="font-semibold">{brandName || 'your brand'}</span></div>
          <div className="text-sm text-[#6B7280] mb-8 text-center">Processing {moodboardCount} moodboard image{moodboardCount === 1 ? '' : 's'}</div>

          {/* Progress Card */}
          <div className="w-full bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-[#23272F]">Progress</span>
              <span className="text-[#23272F] font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-[#F2F3F7] rounded-full overflow-hidden mb-2">
              <div
                className="h-3 bg-[#C7CCF8] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C7CCF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#C7CCF8" strokeWidth="1.5" fill="#F8F9FB" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 14l3-4 3 4" />
                <circle cx="12" cy="10" r="1" fill="#C7CCF8" />
              </svg>
              Processing moodboard images...
            </div>
          </div>

          {/* Brand Profile Card */}
          <div className="w-full bg-white rounded-2xl shadow p-6 mb-6">
            <div className="font-semibold text-[#23272F] mb-3">Your Brand Profile</div>
            <div className="flex flex-col gap-1 text-[#23272F] text-sm">
              <div><span className="font-medium">Style:</span> {style || '—'}</div>
              <div><span className="font-medium">Typography:</span> {typography || '—'}</div>
              <div><span className="font-medium">Industry:</span> {industry || 'General'}</div>
              <div><span className="font-medium">Moodboard:</span> {moodboardCount} image{moodboardCount === 1 ? '' : 's'}</div>
            </div>
          </div>

          <div className="text-xs text-[#6B7280] text-center max-w-xs mx-auto">
            This may take a bit longer as our AI analyzes your visual inspiration for more accurate results.
          </div>
        </div>
      </div>
    )
  }

  if (error)
    return (
      <p className="p-10 text-center text-red-600 font-semibold">
        ❌ {error}
      </p>
    )

  // Main preview layout
  return (
    <div className="min-h-screen flex bg-[#F8F9FB]">
      {/* Sidebar */}
      <aside className="w-72 min-h-screen bg-white border-r border-[#F2F3F7] px-6 py-8 flex flex-col">
        <div className="font-semibold text-lg mb-1">Design Tokens</div>
        <div className="text-xs text-[#6B7280] mb-6">Generated for {brandName || 'your brand'}</div>
        <div className="flex gap-2 mb-6">
          {SIDEBAR_TABS.map(t => (
            <button
              key={t.key}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${tab === t.key ? 'bg-[#F2F3F7] text-[#23272F]' : 'bg-[#F8F9FB] text-[#6B7280]'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {sidebarTokens.map(token => (
            <div key={token.key} className="flex items-center gap-3">
              {tab === 'color' ? (
                <span className="w-7 h-7 rounded-full border border-[#E9EAF3]" style={{ background: token.value }} />
              ) : null}
              <div className="flex-1">
                <div className="text-sm font-medium text-[#23272F]">{token.label}</div>
                <div className="text-xs text-[#6B7280]">{token.value}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-[#F2F3F7]">
          <div className="text-xl font-semibold">Token Preview</div>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${theme === 'light' ? 'bg-[#C7CCF8] text-white' : 'bg-[#F2F3F7] text-[#23272F]'}`}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${theme === 'dark' ? 'bg-[#23272F] text-white' : 'bg-[#F2F3F7] text-[#23272F]'}`}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
            <span className="ml-4 flex items-center gap-1 text-[#6B7280] text-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </span>
          </div>
        </div>

        {/* Preview Card */}
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-10 mb-8" style={{
            background: theme === 'dark' ? tokens?.color.backgroundDark : tokens?.color.backgroundLight,
            color: theme === 'dark' ? tokens?.color.textDark : tokens?.color.textLight,
            fontFamily: getGoogleFont(tokens?.font.family || '')
          }}>
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: getGoogleFont(tokens?.font.family || '') }}>{`Welcome to ${brandName || 'your brand'}`}</h1>
            <p className="mb-6 text-lg">This is how your design tokens look in action. Every element follows your brand guidelines.</p>
            <div className="flex gap-4 mb-8">
              <button className="px-6 py-2 rounded-full font-semibold text-white" style={{ background: tokens?.color.primary }}>Primary Button</button>
              <button className="px-6 py-2 rounded-full font-semibold border border-[#E9EAF3] text-[#23272F] bg-white">Secondary Button</button>
            </div>
            <div className="bg-white rounded-2xl shadow p-8" style={{ boxShadow: '0 4px 24px 0 rgba(44,62,80,0.08)' }}>
              <div className="text-2xl font-bold mb-2">Sample Card</div>
              <div className="mb-4">This card demonstrates your color and typography tokens working together.</div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full font-medium text-white" style={{ background: tokens?.color.primary }}>Design</button>
                <button className="px-4 py-1.5 rounded-full font-medium border border-[#E9EAF3] text-[#23272F] bg-white">System</button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Bar */}
        <div className="flex items-center justify-between px-10 py-6 border-t border-[#F2F3F7] bg-white">
          <button onClick={() => router.push('/brand')} className="px-4 py-2 rounded-full border border-[#E9EAF3] text-[#23272F] bg-white font-medium">Back to Form</button>
          <div className="flex gap-3">
            <button onClick={() => {
              if (tokens) {
                const figmaFormat = toFigmaFormat(tokens)
                const blob = new Blob([JSON.stringify(figmaFormat, null, 2)], {
                  type: 'application/json'
                })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'design-tokens.json'
                a.click()
              }
            }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EAF3] bg-white text-[#23272F] font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
              Export JSON
            </button>
            <button onClick={() => {
              if (tokens) {
                let css = ':root {\n'
                Object.entries(tokens.color).forEach(([k, v]) => {
                  css += `  --color-${k}: ${v};\n`
                })
                Object.entries(tokens.font).forEach(([k, v]) => {
                  css += `  --font-${k}: ${v};\n`
                })
                Object.entries(tokens.spacing).forEach(([k, v]) => {
                  css += `  --spacing-${k}: ${v};\n`
                })
                Object.entries(tokens.radius).forEach(([k, v]) => {
                  css += `  --radius-${k}: ${v};\n`
                })
                css += '}\n'
                const blob = new Blob([css], {
                  type: 'text/css'
                })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'design-tokens.css'
                a.click()
              }
            }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EAF3] bg-white text-[#23272F] font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 4h8v8H8V8z" /></svg>
              Download CSS
            </button>
            <button onClick={() => {
              if (tokens) {
                navigator.clipboard.writeText(JSON.stringify(tokens, null, 2))
                  .then(() => alert('Copied!'))
              }
            }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C7CCF8] text-white font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>
              Copy Tailwind
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}