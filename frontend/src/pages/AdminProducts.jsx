import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus } from "lucide-react";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch ALL products from admin endpoint (no pagination, returns all products)
      const res = await fetch("http://localhost:4000/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert("Admin access required. Please log in as admin.");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const productsArray = await res.json();
      console.log("Fetched products:", productsArray);
      
      // Ensure we always set an array
      const products = Array.isArray(productsArray) ? productsArray : [];
      setProducts(products);
      console.log(`Total products loaded: ${products.length}`);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowProductForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sub Sub Category</label>
                    <input
                      type="text"
                      value={formData.subSubCategory}
                      onChange={(e) => setFormData({ ...formData, subSubCategory: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frame Material</label>
                    <input
                      type="text"
                      value={formData.frameMaterial}
                      onChange={(e) => setFormData({ ...formData, frameMaterial: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frame Color</label>
                    <input
                      type="text"
                      value={formData.frameColor}
                      onChange={(e) => setFormData({ ...formData, frameColor: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl text-gray-600">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-500 mb-4">No products found</p>
            <p className="text-sm text-gray-400">Click "Add Product" to create your first product</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
            <div key={product._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <img
                src={Array.isArray(product.images) ? product.images[0] : product.images?.image1 || "/placeholder.jpg"}
                alt={product.title}
                className="w-full h-40 object-contain mb-4 rounded-lg bg-gray-50"
              />
              <h3 className="font-bold text-lg mb-2 text-gray-900">{product.title}</h3>
              <p className="text-xl font-bold text-blue-600 mb-1">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-4">{product.category}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

