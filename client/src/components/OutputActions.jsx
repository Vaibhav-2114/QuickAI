import React from 'react'
import { Copy, Download, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const themes = {
  blue: {
    gradient: 'from-[#226BFF] to-[#65ADFF]',
    accent: 'text-[#4A7AFF]',
    chip: 'bg-blue-50 text-[#1E40AF] border-blue-200',
    toggle: 'peer-checked:bg-[#4A7AFF]',
  },
  purple: {
    gradient: 'from-[#C341F6] to-[#8E37EB]',
    accent: 'text-[#8E37EB]',
    chip: 'bg-purple-50 text-purple-800 border-purple-200',
    toggle: 'peer-checked:bg-[#8E37EB]',
  },
  green: {
    gradient: 'from-[#00AD25] to-[#04FF50]',
    accent: 'text-[#00AD25]',
    chip: 'bg-green-50 text-green-800 border-green-200',
    toggle: 'peer-checked:bg-green-500',
  },
  orange: {
    gradient: 'from-[#F6AB41] to-[#FF4938]',
    accent: 'text-[#FF4938]',
    chip: 'bg-orange-50 text-orange-800 border-orange-200',
    toggle: 'peer-checked:bg-[#FF4938]',
  },
  indigo: {
    gradient: 'from-[#417DF6] to-[#8E37EB]',
    accent: 'text-[#4A7AFF]',
    chip: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    toggle: 'peer-checked:bg-[#4A7AFF]',
  },
  teal: {
    gradient: 'from-[#00DA83] to-[#009BB3]',
    accent: 'text-[#00DA83]',
    chip: 'bg-teal-50 text-teal-800 border-teal-200',
    toggle: 'peer-checked:bg-[#00DA83]',
  },
}

const OutputActions = ({
  content,
  type = 'text',
  theme = 'blue',
  filename = 'quickai-output',
  creationId,
  isPublished,
  onPublishChange,
  publishLoading,
}) => {
  const t = themes[theme] ?? themes.blue

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success(type === 'image' ? 'Image link copied' : 'Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDownload = async () => {
    try {
      if (type === 'image') {
        const res = await fetch(content)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } else {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.txt`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
      toast.success('Download started')
    } catch {
      toast.error('Failed to download')
    }
  }

  return (
    <div className='mt-4 flex flex-wrap items-center gap-2'>
      <button
        type='button'
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-90 active:scale-[0.98] ${t.chip}`}
      >
        <Copy className='w-3.5 h-3.5' />
        {type === 'image' ? 'Copy link' : 'Copy'}
      </button>
      <button
        type='button'
        onClick={handleDownload}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${t.gradient} px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 active:scale-[0.98]`}
      >
        <Download className='w-3.5 h-3.5' />
        Download
      </button>

      {creationId != null && onPublishChange && (
        <label
          className={`ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${t.chip} ${publishLoading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Globe className={`w-3.5 h-3.5 shrink-0 ${isPublished ? t.accent : 'text-gray-400'}`} />
          <span>Public on Community</span>
          <span className='relative shrink-0'>
            <input
              type='checkbox'
              checked={!!isPublished}
              onChange={(e) => onPublishChange(e.target.checked)}
              className='sr-only peer'
              disabled={publishLoading}
            />
            <div className={`h-5 w-9 rounded-full bg-slate-300 transition ${t.toggle}`} />
            <span className='absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-4' />
          </span>
        </label>
      )}
    </div>
  )
}

export default OutputActions
