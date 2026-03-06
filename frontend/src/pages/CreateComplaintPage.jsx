import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, MapPin, Loader } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { complaintAPI, categoryAPI } from '@/api'

export default function CreateComplaintPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'Medium',
    address: '',
    latitude: '',
    longitude: '',
  })

  const priorities = ['Low', 'Medium', 'High', 'Critical']

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await categoryAPI.getCategories()
        setCategories(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Auto-detect location on component mount using IP geolocation
  useEffect(() => {
    const getIPLocation = async () => {
      try {
        setGeoLoading(true)
        // Using ip-api.com free tier (accurate to city level)
        const response = await fetch('https://ip-api.com/json/?fields=lat,lon,city,status')
        const data = await response.json()
        
        if (data.status === 'success') {
          setFormData((prev) => ({
            ...prev,
            latitude: data.lat.toFixed(6),
            longitude: data.lon.toFixed(6),
            address: data.city || prev.address,
          }))
          setGeoError('')
        } else {
          console.log('IP geolocation not available, user can manually enter or use GPS')
        }
      } catch (error) {
        console.log('IP geolocation fetch failed:', error)
        // Fail silently - user can still manually enter location or use GPS button
      } finally {
        setGeoLoading(false)
      }
    }

    getIPLocation()
  }, [])

  // Get precise location using Geolocation API (GPS)
  const getCurrentLocation = () => {
    setGeoLoading(true)
    setGeoError('')

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      setGeoLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }))
        setGeoError('')
        setGeoLoading(false)
      },
      (error) => {
        const errorMessages = {
          PERMISSION_DENIED: 'Location permission denied. Please enable location access in browser settings.',
          POSITION_UNAVAILABLE: 'GPS location information is unavailable.',
          TIMEOUT: 'Location request timeout. Please try again.',
        }
        setGeoError(errorMessages[error.code] || 'Failed to get precise location. You can use approximate IP-based location or enter manually.')
        setGeoLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (name === 'latitude' || name === 'longitude') {
      setGeoError('')
    }
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await complaintAPI.createComplaint(formData, files)
      navigate('/complaints')
    } catch (error) {
      console.error('Failed to create complaint:', error)
      alert('Failed to create complaint: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">File a Complaint</h1>
        <p className="text-muted-foreground mt-1">Describe your issue in detail</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>Please provide all relevant information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                name="title"
                placeholder="Brief description of your complaint"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                name="description"
                placeholder="Provide detailed description of the issue"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.department?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location Address</label>
              <Input
                name="address"
                placeholder="Street address or location description"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">GPS Coordinates</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={geoLoading}
                  className="gap-2"
                >
                  {geoLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Get Precise GPS Location
                    </>
                  )}
                </Button>
              </div>

              {geoError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{geoError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Latitude
                    {formData.latitude && <Badge variant="secondary" className="ml-2 text-xs">✓ Detected</Badge>}
                  </label>
                  <Input
                    name="latitude"
                    placeholder="e.g., 40.7128"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Longitude
                    {formData.longitude && <Badge variant="secondary" className="ml-2 text-xs">✓ Detected</Badge>}
                  </label>
                  <Input
                    name="longitude"
                    placeholder="e.g., -74.0060"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Location auto-detected using your IP address. Click "Get Precise GPS Location" to get accurate GPS coordinates (requires location permission).
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Attachments (Optional)</label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const droppedFiles = Array.from(e.dataTransfer.files || [])
                  setFiles((prev) => [...prev, ...droppedFiles])
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Click or drag files here</p>
                <p className="text-xs text-muted-foreground">Supported: Images (JPG, PNG), PDF</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/complaints')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
