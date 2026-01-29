import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import CampaignForm from '../components/campaigns/CampaignForm'

export default function EditCampaign() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCampaign()
  }, [id])

  const fetchCampaign = async () => {
    try {
      const data = await api.get(`/campaigns/${id}`)
      if (!data.isOwner) {
        navigate('/campaigns')
        return
      }
      setCampaign(data)
    } catch (err) {
      setError('Campaign not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      await api.put(`/campaigns/${id}`, data)
      navigate(`/campaigns/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Campaign</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <CampaignForm initialData={campaign} onSubmit={handleSubmit} loading={saving} />
        </div>
      </div>
    </div>
  )
}
