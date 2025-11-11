import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  DollarSign,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    contactLenses: 0,
    orders: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    completed: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch ALL products from admin endpoint (no pagination)
      const productsRes = await fetch("http://localhost:4000/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const productData = await productsRes.json();

      const productsArray = Array.isArray(productData)
        ? productData
        : Array.isArray(productData.products)
        ? productData.products
        : [];

      // ✅ Sort products by MongoDB ObjectId (descending → newest first)
      const sortedProducts = [...productsArray].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // ✅ Fetch all orders
      const ordersRes = await fetch("http://localhost:4000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const orderData = await ordersRes.json();

      const ordersArray = Array.isArray(orderData)
        ? orderData
        : Array.isArray(orderData.orders)
        ? orderData.orders
        : [];

      // ✅ Calculate product stats
      const totalProducts = productsArray.length;
      const contactLenses = sortedProducts.filter(
        (p) => p.category === "Contact Lenses"
      ).length;

      // ✅ Calculate order stats
      const pending = ordersArray.filter((o) => o.status === "pending").length;
      const processing = ordersArray.filter((o) => o.status === "processing").length;
      const delivered = ordersArray.filter((o) => o.status === "delivered").length;
      const completed = delivered;

      const revenue = ordersArray
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // ✅ Update dashboard stats
      setStats({
        products: totalProducts,
        contactLenses,
        orders: ordersArray.length,
        pending,
        processing,
        delivered,
        completed,
        revenue,
      });

      // ✅ Show 10 most recent orders
      const recent = ordersArray
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setRecentOrders(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancel":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Products" value={stats.products} icon={Package} color="blue" />
          <StatCard title="Contact Lenses" value={stats.contactLenses} icon={Eye} color="purple" />
          <StatCard title="Orders" value={stats.orders} icon={ShoppingCart} color="indigo" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard title="Processing" value={stats.processing} icon={TrendingUp} color="blue" />
          <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle} color="green" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="emerald" />
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Revenue</p>
                <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <DollarSign className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        ,{" "}
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ₹{order.totalAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500 hover:shadow-xl transition-shadow`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        <Icon className={`text-${color}-600`} size={28} />
      </div>
    </div>
  </div>
);

export default AdminDashboard;
