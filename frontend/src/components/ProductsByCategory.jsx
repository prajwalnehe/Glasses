import React, { useEffect, useState } from "react";

export default function ProductsByCategory() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // Group products by their category
  const grouped = products.reduce((acc, product) => {
    const cat = product.category || "Others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    <div className="space-y-10 p-6">
      {/* Render a section for each category */}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-indigo-800">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={product.images?.image1 || product.Images?.image1 || 'https://via.placeholder.com/150x80?text=No+Image'}
                  alt={product.title}
                  className="h-32 object-contain mb-2 rounded"
                />
                <div className="font-semibold text-center mb-1">{product.title}</div>
                <div className="text-xs text-gray-600 text-center mb-2">{product.description}</div>
                <div className="text-indigo-700 font-bold">₹{product.price}</div>
                <div className="text-[12px] text-gray-500 mt-1">{product.subCategory} {product.subSubCategory ? "/ " + product.subSubCategory : ''}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}



