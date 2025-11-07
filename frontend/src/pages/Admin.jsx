import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus, Package, ShoppingCart } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
    subSubCategory: "",
    brand: "",
    gender: "",
    size: "",
    frameShape: "",
    frameMaterial: "",
    frameColor: "",
    rimDetails: "",
    warranty: "",
    images: ["", ""],
    ratings: 0,
    discount: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      if (!token) {
        navigate("/signin");
        return;
      }
      try {
        const res = await fetch("http://localhost:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          if (userData.isAdmin) {
            setIsAdmin(true);
          } else {
            alert("Admin access required");
            navigate("/home");
          }
        } else {
          navigate("/signin");
        }
      } catch (error) {
        navigate("/signin");
      }
    };
    checkAdmin();
  }, [token, navigate]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "products") {
        fetchProducts();
      } else {
        fetchOrders();
      }
    }
  }, [activeTab, isAdmin]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      subSubCategory: formData.subSubCategory || undefined,
      product_info: {
        brand: formData.brand || undefined,
        gender: formData.gender || undefined,
        size: formData.size || undefined,
        frameShape: formData.frameShape || undefined,
        frameMaterial: formData.frameMaterial || undefined,
        frameColor: formData.frameColor || undefined,
        rimDetails: formData.rimDetails || undefined,
        warranty: formData.warranty || undefined,
      },
      images: formData.images.filter((img) => img.trim()),
      ratings: parseFloat(formData.ratings) || 0,
      discount: parseFloat(formData.discount) || 0,
    };

    try {
      const url = editingProduct
        ? `http://localhost:4000/api/admin/products/${editingProduct._id}`
        : "http://localhost:4000/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingProduct ? "Product updated!" : "Product added!");
        setShowProductForm(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        const error = await res.json();
        alert(error.message || "Error saving product");
      }
    } catch (error) {
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Product deleted!");
        fetchProducts();
      } else {
        alert("Error deleting product");
      }
    } catch (error) {
      alert("Error deleting product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      price: product.price || "",
      description: product.description || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      subSubCategory: product.subSubCategory || "",
      brand: product.product_info?.brand || "",
      gender: product.product_info?.gender || "",
      size: product.product_info?.size || "",
      frameShape: product.product_info?.frameShape || "",
      frameMaterial: product.product_info?.frameMaterial || "",
      frameColor: product.product_info?.frameColor || "",
      rimDetails: product.product_info?.rimDetails || "",
      warranty: product.product_info?.warranty || "",
      images: Array.isArray(product.images) ? product.images : [product.images?.image1 || "", product.images?.image2 || ""],
      ratings: product.ratings || 0,
      discount: product.discount || 0,
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "",
      subCategory: "",
      subSubCategory: "",
      brand: "",
      gender: "",
      size: "",
      frameShape: "",
      frameMaterial: "",
      frameColor: "",
      rimDetails: "",
      warranty: "",
      images: ["", ""],
      ratings: 0,
      discount: 0,
    });
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

  if (!isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "products"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            <Package className="inline mr-2" size={20} />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "orders"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            <ShoppingCart className="inline mr-2" size={20} />
            Orders
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setShowProductForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price *</label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Category *</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="">Select</option>
                          <option value="Eyeglasses">Eyeglasses</option>
                          <option value="Sunglasses">Sunglasses</option>
                          <option value="Computer Glasses">Computer Glasses</option>
                          <option value="Contact Lenses">Contact Lenses</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sub Category</label>
                        <input
                          type="text"
                          value={formData.subCategory}
                          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sub Sub Category</label>
                        <input
                          type="text"
                          value={formData.subSubCategory}
                          onChange={(e) => setFormData({ ...formData, subSubCategory: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Brand</label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="">Select</option>
                          <option value="Unisex">Unisex</option>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Kids">Kids</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Frame Shape</label>
                        <input
                          type="text"
                          value={formData.frameShape}
                          onChange={(e) => setFormData({ ...formData, frameShape: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Frame Material</label>
                        <input
                          type="text"
                          value={formData.frameMaterial}
                          onChange={(e) => setFormData({ ...formData, frameMaterial: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Frame Color</label>
                        <input
                          type="text"
                          value={formData.frameColor}
                          onChange={(e) => setFormData({ ...formData, frameColor: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Rim Details</label>
                        <input
                          type="text"
                          value={formData.rimDetails}
                          onChange={(e) => setFormData({ ...formData, rimDetails: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Size</label>
                        <input
                          type="text"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Image URLs *</label>
                      <input
                        type="text"
                        required
                        placeholder="Image 1 URL"
                        value={formData.images[0]}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[0] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Image 2 URL (optional)"
                        value={formData.images[1]}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[1] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        {loading ? "Saving..." : editingProduct ? "Update" : "Add"} Product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          resetForm();
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products List */}
            {loading && <p>Loading...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white p-4 rounded-lg shadow border">
                  <img
                    src={Array.isArray(product.images) ? product.images[0] : product.images?.image1 || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-32 object-contain mb-2"
                  />
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-gray-600">₹{product.price}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            {loading && <p>Loading...</p>}
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {order.userId?.name || order.userId?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-2">
                        <span>
                          {item.productId?.title || "Product"} x {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

