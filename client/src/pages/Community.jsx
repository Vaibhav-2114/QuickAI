import React, { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const { getToken } = useAuth()

  const fetchCreations = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to load community creations')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  const toggleLike = async (creationId) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creation', { id: creationId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setCreations((prev) =>
          prev.map((c) =>
            c.id === creationId ? { ...c, likes: data.likes } : c
          )
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update like')
    }
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <h1 className='text-xl font-semibold'>Community Creations</h1>
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {loading ? (
          <p className='p-6 text-sm text-gray-500'>Loading public creations...</p>
        ) : creations.length === 0 ? (
          <p className='p-6 text-sm text-gray-500'>No public images yet. Generate an image and mark it as public.</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3'>
            {creations.map((creation) => (
              <div key={creation.id} className='relative group'>
                <img
                  src={creation.content}
                  alt={creation.prompt || 'User creation'}
                  className='w-full aspect-square object-cover rounded-lg'
                />

                <div className='absolute inset-0 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                  <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                  <div className='flex gap-1 items-center'>
                    <p>{(creation.likes ?? []).length}</p>
                    <Heart
                      onClick={() => toggleLike(creation.id)}
                      className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                        (creation.likes ?? []).includes(user?.id)
                          ? 'fill-red-500 text-red-600'
                          : 'text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
