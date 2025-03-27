import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./components/productCard";

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    axios.get("http://localhost:5000/api/products")
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  // Handle search and category filter
  useEffect(() => {
    let results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategories.length > 0) {
      results = results.filter(product => selectedCategories.includes(product.category));
    }

    setFilteredProducts(results);
    setCurrentPage(1); // Reset page to 1 after filtering
  }, [searchTerm, selectedCategories, products]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(cat => cat !== category) : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
  };

  // Pagination Logic
  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  let currentProducts = filteredProducts.slice(firstIndex, lastIndex);

  const uniqueCategories = [...new Set(products.map(product => product.category))];

  return (
    <div>
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm flex justify-center p-4">
        <a className="text-xl font-bold">Bazaar Kiryana Store</a>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center p-4">
        <label className="input flex items-center gap-2 border rounded-lg p-2 shadow-md">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            placeholder="Search products..."
            className="outline-none w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center gap-2 p-4 flex-wrap">
        {uniqueCategories.map(category => (
          <button
            key={category}
            className={`btn ${selectedCategories.includes(category) ? "btn-primary" : "btn-outline"}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
        <button className="btn btn-error" onClick={resetFilters}>Reset</button>
      </div>

      {/* Products Display */}
      <div className="p-4">
        {currentProducts.length > 0 ? (
          <>
            <ProductCard initialProducts={currentProducts} setProducts={setProducts} />

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="px-4 py-2">Page {currentPage}</span>
              <button
                className="btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)))}
                disabled={lastIndex >= filteredProducts.length}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
