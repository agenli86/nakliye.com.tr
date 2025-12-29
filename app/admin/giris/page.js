'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminGiris() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      toast.success('Giriş başarılı!')
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Image
            src="/resimler/adananakliye.png"
            alt="Adana Nakliye"
            width={180}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-secondary-800">Admin Paneli</h1>
          <p className="text-gray-500 mt-2">Yönetim paneline giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="admin-label">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="admin-input"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="admin-label">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="admin-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary-500 hover:text-primary-600 text-sm">
            ← Siteye Dön
          </a>
        </div>
      </div>
    </div>
  )
}
