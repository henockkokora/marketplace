const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAnalytics = async (req, res) => {
  try {
    const range = req.query.range || 'month';
    const now = new Date();
    let startDate;
    if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    // Filtrer les commandes selon la période et le statut (uniquement les commandes confirmées)
    const orderFilter = { 
      createdAt: { $gte: startDate },
      status: { $in: ['confirmed', 'livré', 'delivered', 'completed', 'payé', 'paye'] } // Ajoutez d'autres statuts de confirmation si nécessaire
    };
    const orders = await Order.find(orderFilter);
    // Agrégations classiques
    const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const ordersCount = orders.length;
    const customers = new Set(orders.map(o => (o.user?.email || o.user?.name))).size;
    // Nombre de livraisons effectuées (statuts livrés)
    const deliveredOrders = orders.filter(o => {
      const status = (o.status || '').toLowerCase();
      return status === 'livré' || status === 'delivered';
    }).length;
    const conversionRate = customers > 0 ? (ordersCount / customers) * 100 : 0;
    const productsCount = await Product.countDocuments();

    // Récupérer les produits les plus cliqués
    const mostClickedProducts = await Product.find({ clicks: { $gt: 0 } })
      .sort({ clicks: -1 })
      .limit(5)
      .select('name category clicks')
      .populate('category', 'name');

    // Top produits par catégorie (ventes)
    const allOrders = await Order.find();
    const productSales = {};
    allOrders.forEach(order => {
      order.products.forEach(p => {
        if (!productSales[p.product]) productSales[p.product] = { name: p.name, category: null, sales: 0, revenue: 0 };
        productSales[p.product].sales += p.quantity;
        productSales[p.product].revenue += (p.price || 0) * p.quantity;
      });
    });
    // Récupérer les catégories des produits
    const productIds = Object.keys(productSales);
    const products = await Product.find({ _id: { $in: productIds } }).populate('category');
    products.forEach(prod => {
      if (productSales[prod._id]) {
        productSales[prod._id].category = prod.category?.name || 'Autre';
      }
    });
    // Grouper par catégorie
    const topProductsByCategory = {};
    Object.values(productSales).forEach(p => {
      if (!topProductsByCategory[p.category]) topProductsByCategory[p.category] = [];
      topProductsByCategory[p.category].push(p);
    });
    Object.keys(topProductsByCategory).forEach(cat => {
      topProductsByCategory[cat].sort((a, b) => b.sales - a.sales);
      topProductsByCategory[cat] = topProductsByCategory[cat].slice(0, 3);
    });

    // Évolution des ventes mensuelles (12 derniers mois)
    const monthlyStats = [];
    for (let m = 0; m < 12; m++) {
      const start = new Date(now.getFullYear(), m, 1);
      const end = new Date(now.getFullYear(), m + 1, 1);
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) < end);
      const sales = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      monthlyStats.push({
        month: start.toLocaleString('fr-FR', { month: 'short' }),
        sales,
        orders: monthOrders.length
      });
    }

    // Recyclage de contacts (clients inscrits, visiteurs uniques, total contacts)
    const allCustomers = new Set(allOrders.map(o => o.user?.email || o.user?.name));
    const contacts = {
      registered: allCustomers.size,
      uniqueVisitors: Math.floor(allCustomers.size * 0.6), // Simulé
      total: allCustomers.size + Math.floor(allCustomers.size * 0.6)
    };

    res.json({
      revenue,
      orders: await Order.countDocuments(), // total de toutes les commandes
      products: productsCount,
      customers,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      deliveredOrders, // nombre de livraisons effectuées
      topProductsByCategory,
      mostClickedProducts: mostClickedProducts.map(p => ({
        name: p.name,
        category: p.category?.name || 'Non catégorisé',
        clicks: p.clicks || 0
      })),
      monthlyStats,
      contacts
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques', details: err.message });
  }
};
