import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filterStatus === "all"
        ? "http://localhost:4000/api/admin/orders"
        : `http://localhost:4000/api/admin/orders?status=${filterStatus}`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert("Order status updated!");
        fetchOrders();
      } else {
        alert("Error updating order status");
      }
    } catch (error) {
      alert("Error updating order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancel":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Order Management</h1>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 bg-white p-2 rounded-xl shadow-md">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              filterStatus === "all"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              filterStatus === "pending"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus("processing")}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              filterStatus === "processing"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilterStatus("delivered")}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              filterStatus === "delivered"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus("cancel")}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              filterStatus === "cancel"
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl text-gray-600">Loading orders...</div>
          </div>
        )}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-500">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.userId?.name || order.userId?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancel">Cancel</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Order Items:</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-3 pb-3 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        {item.productId?.images && (
                          <img
                            src={Array.isArray(item.productId.images) ? item.productId.images[0] : item.productId.images?.image1 || "/placeholder.jpg"}
                            alt={item.productId?.title}
                            className="w-16 h-16 object-contain rounded border"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.productId?.title || "Product"}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                        </div>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-200">
                    <span className="text-lg font-bold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">₹{order.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Shipping Address:</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

