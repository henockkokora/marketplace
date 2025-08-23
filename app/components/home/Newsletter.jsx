'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simuler l'abonnement
    setIsSubscribed(true)
    setTimeout(() => {
      setIsSubscribed(false)
      setEmail('')
    }, 3000)
  }

  return (
    <section className="py-12 bg-[#f0ede2]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg bg-white h-[230px] md:h-[240px]">
          {/* Image à gauche */}
          <div className="w-full md:w-1/2 h-full bg-[#f7f5ec] flex items-center justify-center p-0 m-0">
            <img 
              src="/image_newsletter.png" 
              alt="Abonnez-vous à notre newsletter" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Formulaire à droite */}
          <div className="w-full md:w-1/2 h-full flex items-center justify-center p-0 m-0 bg-white">
            <div className="w-full max-w-md text-center px-8">
              <Mail size={28} className="mx-auto mb-2 text-[#333]" />
              <h2 className="text-xl font-bold mb-1.5 text-[#333]">Restez informé(e)</h2>
              <p className="text-xs mb-4 text-gray-600">
                Recevez nos dernières offres, nouveautés et conseils directement dans votre boîte mail
              </p>
              
              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    className="px-3 py-2 text-xs rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F2994A] flex-grow text-gray-800"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#F2994A] hover:bg-[#e68a3a] text-white px-4 py-2 rounded transition-colors whitespace-nowrap text-xs font-medium"
                  >
                    S'inscrire
                  </button>
                </form>
              ) : (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs">
                  Merci pour votre inscription !
                </div>
              )}
              
              <p className="text-[10px] text-gray-500 mt-3">
                * En vous abonnant, vous acceptez de recevoir nos communications marketing.
                Vous pouvez vous désabonner à tout moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
