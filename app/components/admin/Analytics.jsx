'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Eye, Download } from 'lucide-react'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('month')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE = 'http://localhost:4000/api'

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/analytics?range=${timeRange}`)
      if (!res.ok) throw new Error('Erreur lors du chargement des analytics')
      const data = await res.json()
      setAnalyticsData(data)
    } catch (err) {
      setError(err.message)
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }

  // Données dynamiques depuis backend
  const topProductsByCategory = analyticsData?.topProductsByCategory || {}
  const mostClickedProducts = analyticsData?.mostClickedProducts || []
  const monthlyStats = analyticsData?.monthlyStats || []
  const contacts = analyticsData?.contacts || { registered: 0, uniqueVisitors: 0, total: 0 }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Rapports</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-[#404E7C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#404E7C]"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={() => {}}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.revenue?.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.orders?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm font-medium text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons effectuées</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.deliveredOrders?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm font-medium text-green-600">+5.0%</span>
                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Produits les plus vendus par catégorie</h3>
            <button onClick={() => {}} className="text-[#404E7C] hover:text-orange-700 text-sm">Exporter</button>
          </div>
          <div className="space-y-6">
            {Object.keys(topProductsByCategory).length === 0 && <div className="text-gray-400">Aucune donnée</div>}
            {Object.entries(topProductsByCategory).map(([category, products]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                <div className="space-y-2">
                  {products.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-[#404E7C]1A text-[#404E7C] rounded-full flex items-center justify-center text-sm font-medium mr-3">{index + 1}</span>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} ventes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{product.revenue?.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Clicked Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Articles les plus cliqués</h3>
            <button onClick={() => {}} className="text-[#404E7C] hover:text-orange-700 text-sm">Exporter</button>
          </div>
          <div className="space-y-3">
            {mostClickedProducts.length === 0 && <div className="text-gray-400">Aucune donnée</div>}
            {mostClickedProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">{index + 1}</span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center text-right">
                  <Eye className="text-gray-400 mr-1" size={16} />
                  <span className="font-medium">{product.clicks?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Évolution des ventes mensuelles</h3>
          <button onClick={() => {}} className="text-[#404E7C] hover:text-orange-700 text-sm">Exporter</button>
        </div>
        <div className="space-y-4">
          {monthlyStats.length === 0 && <div className="text-gray-400">Aucune donnée</div>}
          {monthlyStats.map((stat) => (
            <div key={stat.month} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{stat.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div className="bg-[#404E7C] h-6 rounded-full flex items-center justify-end pr-2" style={{ width: `${monthlyStats.reduce((max, s) => Math.max(max, s.sales), 1) ? (stat.sales / monthlyStats.reduce((max, s) => Math.max(max, s.sales), 1)) * 100 : 0}%` }}>
                  <span className="text-white text-xs font-medium">{stat.sales?.toLocaleString()} FCFA</span>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-600 text-right">{stat.orders} cmd</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Recycling Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recyclage de contacts</h3>
          <button onClick={() => {}} className="flex items-center space-x-2 bg-[#404E7C] text-white px-4 py-2 rounded-lg hover:bg-[#6A7BA2] transition-colors"><Download size={16} /><span>Exporter contacts</span></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{contacts.registered}</div>
            <div className="text-sm text-gray-600">Clients inscrits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{contacts.uniqueVisitors}</div>
            <div className="text-sm text-gray-600">Visiteurs uniques</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{contacts.total}</div>
            <div className="text-sm text-gray-600">Total contacts</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Les données incluent les noms, téléphones et emails des clients et visiteurs.</p>
          <p>Export disponible en format CSV et Excel.</p>
        </div>
      </div>
    </div>
  )
}