import Link from 'next/link'

export default function SpecialOffers() {
  const offers = [
    {
      id: 1,
      title: 'Flash Sale',
      description: 'Jusqu\'à -50% sur l\'électronique',
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=500',
      bgColor: 'bg-red-500',
      timeLeft: '23:45:12'
    },
    {
      id: 2,
      title: 'Mode Femme',
      description: 'Nouvelle collection automne',
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500',
      bgColor: 'bg-pink-500',
      discount: '-30%'
    }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 bg-red-600 text-white py-2 rounded-lg shadow">Offres Spéciales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/offers/${offer.id}`} className="group">
              <div className={`${offer.bgColor} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
                <div className="flex">
                  <div className="flex-1 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-lg mb-4">{offer.description}</p>
                    
                    {offer.timeLeft && (
                      <div className="mb-4">
                        <p className="text-sm mb-1">Temps restant:</p>
                        <div className="font-mono text-xl font-bold">
                          {offer.timeLeft}
                        </div>
                      </div>
                    )}
                    
                    {offer.discount && (
                      <div className="text-3xl font-bold mb-4">
                        {offer.discount}
                      </div>
                    )}
                    
                    <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Voir l'offre
                    </button>
                  </div>
                  
                  <div className="w-1/3 relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}