import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // change this for more/less per page

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

  // ✅ Fetch products with sorting and error handling
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized access. Please log in as admin.");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Handle both possible API response shapes
      const productsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      // ✅ Sort products by _id (descending → newest first)
      const sortedProducts = [...productsArray].sort((a, b) =>
        b._id.localeCompare(a._id)
      );

      setProducts(sortedProducts);
      console.log(`✅ Loaded ${sortedProducts.length} products`);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // ✅ Handle delete
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

  // ✅ Handle edit
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
      images: Array.isArray(product.images)
        ? product.images
        : [product.images?.image1 || "", product.images?.image2 || ""],
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

  // ✅ Handle form submit (Add / Update)
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
        alert(editingProduct ? "Product updated successfully!" : "Product added!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {/* Product list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-xl text-gray-600">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-500 mb-4">No products found</p>
            <p className="text-sm text-gray-400">
              Click “Add Product” to create your first product.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <img
                    src={
                      Array.isArray(product.images)
                        ? product.images[0]
                        : product.images?.image1 || "/placeholder.jpg"
                    }
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft />
                </button>
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
