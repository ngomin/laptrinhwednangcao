
// Xử lý logic trang tổng quan (Dashboard)

const OrderModel = require('../models/orderModel');
const CustomerModel = require('../models/customerModel');
const ProductModel = require('../models/productModel');
const WarehouseModel = require('../models/warehouseModel');

const DashboardController = {
  // GET /dashboard
  index(req, res) {
    const orderStats = OrderModel.getRevenueStats();
    const customerStats = CustomerModel.getStats();
    const productStats = ProductModel.getStats();

    const recentOrders = OrderModel.getAll()
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
      .map(o => {
        const customer = CustomerModel.findById(o.customerId);
        return { ...o, customerName: customer?.name || 'N/A' };
      });

    const lowStockProducts = ProductModel.getLowStock();
    const recentTransactions = WarehouseModel.getRecent(5);

    // Doanh thu 6 tháng gần nhất (mock chart data)
    const revenueChart = generateMonthlyRevenue();

    res.render('dashboard/index', {
      title: 'Tổng quan',
      orderStats,
      customerStats,
      productStats,
      recentOrders,
      lowStockProducts,
      recentTransactions,
      revenueChart,
      error: req.flash('error'),
      success: req.flash('success')
    });
  }
};

// Tính doanh thu theo từng tháng (6 tháng gần nhất)
function generateMonthlyRevenue() {
  const orders = OrderModel.getAll().filter(o => o.status === 'completed');
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const label = `Th.${d.getMonth() + 1}`;
    const revenue = orders
      .filter(o => o.orderDate.startsWith(key))
      .reduce((s, o) => s + (o.total || 0), 0);
    result.push({ label, revenue });
  }
  return result;
}

module.exports = DashboardController;