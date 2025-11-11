import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { Eye, Sun, Monitor, Phone } from 'lucide-react';

const Shop = ({ addToCart, addToWishlist }) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalProducts: 0, productsPerPage: 18 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(18);
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    qs.set("page", String(page));
    qs.set("limit", String(limit));
    const url = `http://localhost:4000/api/products?${qs.toString()}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
        setPagination(data.pagination || { currentPage: page, totalPages: 0, totalProducts: 0, productsPerPage: limit });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, limit, search, category]);

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const total = pagination.totalPages || 0;
    const current = pagination.currentPage || 1;
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-10 mb-6">
        <button
          onClick={() => goToPage(current - 1)}
          disabled={current <= 1}
          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
            current <= 1 
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50" 
              : "text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-md"
          }`}
        >
          ← Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all duration-200 ${
              p === current 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg transform scale-110" 
                : "text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-md"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => goToPage(current + 1)}
          disabled={current >= total}
          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
            current >= total 
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50" 
              : "text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-md"
          }`}
        >
          Next →
        </button>
      </div>
    );
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const getCategoryIcon = (category) => {
    const iconClass = "w-6 h-6";
    switch(category?.toLowerCase()) {
      case 'eyeglasses': return <Eye className={iconClass} />;
      case 'sunglasses': return <Sun className={iconClass} />;
      case 'computer glasses': return <Monitor className={iconClass} />;
      case 'contact lenses': return <Phone className={iconClass} />;
      default: return <Eye className={iconClass} />;
    }
  };

  const getCategoryGradient = (category) => {
    switch(category?.toLowerCase()) {
      case 'eyeglasses': return 'from-blue-500 to-cyan-500';
      case 'sunglasses': return 'from-orange-500 to-yellow-500';
      case 'computer glasses': return 'from-purple-500 to-pink-500';
      case 'contact lenses': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const ProductSkeleton = () => (
    <div className="animate-pulse bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4"></div>
      <div className="h-5 bg-gray-200 rounded-lg mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-lg mb-2 w-1/2"></div>
      <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Shop All Products
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our complete collection of eyewear and contact lenses. Find the perfect style for every occasion.
          </p>
           
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="text-red-600 font-semibold text-lg mb-2">⚠️ Error loading products</div>
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 bg-gradient-to-r ${getCategoryGradient(category)} rounded-xl shadow-lg text-white`}>
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {category}
                    </h2>
                    <p className="text-gray-600 font-medium">
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} in this category
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <div 
                      key={product._id}
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <ProductCard
                        product={product}
                        addToCart={() => addToCart(product)}
                        addToWishlist={() => addToWishlist(product)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {pagination.totalPages > 1 && renderPageNumbers()}
            {products.length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {search ? `No products match "${search}"` : "We couldn't find any products at the moment."}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Shop;
