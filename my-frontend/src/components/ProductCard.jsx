import React, { useState } from "react";

function ProductCard({ initialProducts, setProducts }) {
  console.log("from productCard", initialProducts);
  const [products, setLocalProducts] = useState(initialProducts);

  const removeProduct = (id) => {
    // Update the products state by filtering out the removed product
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    setLocalProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  };

  return (
    <ul className="list bg-base-100 rounded-box shadow-md max-w-4xl mx-auto p-4">
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Product List</li>
      {initialProducts.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          removeProduct={removeProduct} // Pass removeProduct function to the child
        />
      ))}
    </ul>
  );
}

function ProductRow({ product, removeProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(product.quantity);
  const [reorderFlag, setReorderFlag] = useState(product.quantity < product.reorder_level);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(""); // "success", "info", "error"

  const API_URL = `http://localhost:5000/api/products/${product.id}`;

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => setAlertMessage(null), 3000); // Hide alert after 3 seconds
  };

  const updateStock = async (newStock, actionType) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, quantity: newStock }),
      });

      if (!response.ok) throw new Error("Failed to update stock");

      setCurrentStock(newStock);
      setReorderFlag(newStock < product.reorder_level);

      if (actionType === "sell") {
        showAlert("Stock successfully updated after selling!", "info");
      } else if (actionType === "add") {
        showAlert("Stock successfully increased!", "success");
      }
    } catch (error) {
      setErrorMessage("Error updating stock. Please try again.");
      showAlert("Failed to update stock!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSell = () => {
    const sellQty = parseInt(quantity);
    if (isNaN(sellQty) || sellQty <= 0) return;

    const newStock = Math.max(0, currentStock - sellQty);
    updateStock(newStock, "sell");
  };

  const handleStock = () => {
    const stockQty = parseInt(quantity);
    if (isNaN(stockQty) || stockQty <= 0) return;

    const newStock = currentStock + stockQty;
    updateStock(newStock, "add");
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      // Delay the removal of the product until the alert disappears
      setTimeout(() => {
        // Call removeProduct to update the parent state after the alert is shown
        removeProduct(productId);
      }, 3000); // Delay for 3 seconds (the duration of the alert)


      showAlert("Product successfully deleted!", "warning");
    } catch (error) {
      setErrorMessage("Error deleting product. Please try again.");
      showAlert("Failed to delete product!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <li className="grid grid-cols-3 items-center p-4 border gap-4">
        {/* Product Name & Category */}
        <div>
          <div className="font-semibold">{product.name}</div>
          <div className="text-xs uppercase font-semibold opacity-60">{product.category}</div>
        </div>

        {/* Stock Info */}
        <div className="text-center">
          <div className="text-md font-bold">QTY: {currentStock}</div>
          <div className="text-sm font-semibold">PKR {product.unit_price}</div>
          {errorMessage && <div className="text-red-500 text-xs">{errorMessage}</div>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16 px-2 py-1 border rounded text-center text-sm"
            disabled={loading}
          />
          <button onClick={handleSell} className="btn btn-info" disabled={currentStock === 0 || loading}>
            Sell
          </button>
          <button onClick={handleStock} className="btn btn-success" disabled={loading}>
            Stock
          </button>

          {/* Reorder Button & Remove Icon */}
          <div className="flex items-center gap-2">
            <button className={`btn ${reorderFlag ? "btn-warning" : "btn-gray-400"}`} disabled={!reorderFlag}>
              {reorderFlag ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-flag-fill" viewBox="0 0 16 16">
                  <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-flag" viewBox="0 0 16 16">
                  <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001" />
                </svg>
              )}
            </button>

            <button
              className="btn btn-error"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this product?")) {
                  deleteProduct(product.id); // Call the delete function from ProductRow
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.864 1.636a1 1 0 0 1 1.414 0L8 5.586l3.723-3.95a1 1 0 1 1 1.415 1.413L9.414 7l3.95 3.724a1 1 0 1 1-1.414 1.413L8 8.414l-3.723 3.95a1 1 0 0 1-1.415-1.413L6.586 7 2.864 3.276a1 1 0 0 1 0-1.413z" />
              </svg>
            </button>
          </div>
        </div>
      </li>
      {/* Alert Message */}
      {alertMessage && (
        <div role="alert" className={`alert ${alertType === "success" ? "alert-success" : alertType === "info" ? "alert-info" : "alert-error"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{alertMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
