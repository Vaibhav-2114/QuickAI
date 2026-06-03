import React, { useState } from 'react'
import { Eraser, Sparkles } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import FileUploadField from '../components/FileUploadField'
import OutputActions from '../components/OutputActions'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to remove background')
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Background Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Image</p>

        <FileUploadField file={input} onChange={setInput} accept='image/*' theme='orange' required />

        <p className='text-xs text-gray-500 font-light mt-1'>Supports JPG, PNG, and other image formats</p>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Eraser className='w-5' />}
          Remove Background
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Eraser className='w-5 h-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {loading ? (
          <div className='flex-1 flex flex-col justify-center items-center gap-5 text-orange-500'>
            <span className='w-8 h-8 rounded-full border-4 border-t-transparent animate-spin'></span>
            <p>Removing background...</p>
          </div>
        ) : !content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Eraser className='w-9 h-9' />
              <p>Upload an image and click &quot;Remove Background&quot; to get started</p>
            </div>
          </div>
        ) : (
          <>
            <OutputActions content={content} type='image' theme='orange' filename='background-removed' />
            <img src={content} alt="Processed" className='mt-3 w-full rounded-lg' />
          </>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground
