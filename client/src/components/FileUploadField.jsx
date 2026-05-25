import React, { useId } from 'react'

const themes = {
  orange: 'from-[#F6AB41] to-[#FF4938]',
  blue: 'from-[#417DF6] to-[#8E37EB]',
  teal: 'from-[#00DA83] to-[#009BB3]',
}

const FileUploadField = ({ file, onChange, accept, theme = 'orange', required }) => {
  const id = useId()

  return (
    <div className='mt-2 flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50/50 px-1.5 py-1'>
      <label
        htmlFor={id}
        className={`shrink-0 cursor-pointer rounded-md bg-gradient-to-r ${themes[theme]} px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90 active:scale-[0.98]`}
      >
        Choose File
      </label>
      <input
        id={id}
        type='file'
        accept={accept}
        required={required}
        className='sr-only'
        onChange={(e) => onChange(e.target.files[0] ?? null)}
      />
      <span className={`min-w-0 flex-1 truncate text-xs ${file ? 'text-slate-600' : 'text-gray-400'}`}>
        {file ? file.name : 'No file chosen'}
      </span>
    </div>
  )
}

export default FileUploadField
