const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "MOCK_DATA.json");

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// 🔹 Helper Function: Read JSON File
const readProducts = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
};

// 🔹 Helper Function: Write JSON File
const writeProducts = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

// 🔹 1. Get All Products (Formatted Output)
app.get("/products", (req, res) => {
    const products = readProducts();

    // Group products by category
    const categories = {};
    products.forEach((product) => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product.name);
    });

    // Build structured response
    let output = `<h1>Products</h1>`; // Title
    for (const [category, items] of Object.entries(categories)) {
        output += `<h2>${category}</h2>`; // Subheading for category
        output += `<ul>`; // Start list
        items.forEach((item) => {
            output += `<li>${item}</li>`; // List products under category
        });
        output += `</ul>`; // End list
    }

    res.send(output);
});

// 🔹 2. Get Product by ID (Formatted Output)
app.get("/products/:id", (req, res) => {
    const products = readProducts();
    const product = products.find((p) => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).send("<h1>❌ Product Not Found</h1><p>The requested product does not exist.</p>");
    }

    // Format product details as HTML
    let output = `
      <h1>Product Details</h1>
      <h2>${product.name}</h2>
      <ul>
        <li><strong>Category:</strong> ${product.category}</li>
        <li><strong>Quantity:</strong> ${product.quantity}</li>
        <li><strong>Unit Price:</strong> ${product.unit_price}</li>
        <li><strong>Total Value:</strong> ${product.total_value}</li>
        <li><strong>Supplier ID:</strong> ${product.supplier_id}</li>
        <li><strong>Expiry Date:</strong> ${product.expiry_date}</li>
        <li><strong>Reorder Level:</strong> ${product.reorder_level}</li>
        <li><strong>Created At:</strong> ${product.created_at}</li>
        <li><strong>Updated At:</strong> ${product.updated_at}</li>
      </ul>
    `;

    res.send(output);
});

app.post("/products", (req, res) => {
    let products = readProducts();

    // Validate request body
    const { name, category, quantity, unit_price, supplier_id, expiry_date, reorder_level } = req.body;

    // Convert values to numbers where necessary
    const qty = Number(quantity) || 0;
    const price = Number(unit_price) || 0;

    // Get the last product ID, or start from 1 if empty
    const lastId = products.length > 0 ? products[products.length - 1].id : 0;
    const newId = lastId + 1;

    // Create new product object
    const newProduct = {
        id: newId,
        name: name || "Unnamed Product",
        category: category || "Other",
        quantity: qty,
        unit_price: price,
        total_value: isNaN(qty) || isNaN(price) ? "N/A" : (qty * price).toFixed(2),
        supplier_id: Number(supplier_id) || "N/A",
        expiry_date: expiry_date || "N/A",
        reorder_level: Number(reorder_level) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Push the new product to the array
    products.push(newProduct);

    // Save to JSON file
    writeProducts(products);

    // ✅ Log product details in the terminal
    console.log(`[${new Date().toISOString()}] ✅ New Product Added:`, JSON.stringify(newProduct, null, 2));

    // Respond with the newly created product
    res.status(201).json(newProduct);
});



// 🔹 4. Update Product
app.put("/products/:id", (req, res) => {
    let products = readProducts();
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));

    if (index === -1) return res.status(404).json({ message: "Product not found" });

    // Update only the fields that are provided in the request body
    products[index] = {
        ...products[index],
        ...req.body,
        updated_at: new Date().toISOString()
    };

    // Save the updated product list back to the file
    writeProducts(products);

    // ✅ Print the updated product in the terminal
    console.log(`[${new Date().toISOString()}] ✅ Product Updated:`, JSON.stringify(products[index], null, 2));

    // Send back the updated product
    res.json(products[index]);
});


app.delete("/api/products/:id", (req, res) => {
    let products = readProducts();
    const productId = parseInt(req.params.id);

    // Find the product to delete
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
        return res.status(404).json({ message: "❌ Product not found" });
    }

    // Store deleted product for logging
    const deletedProduct = products[index];

    // Remove product from the list
    products.splice(index, 1);
    writeProducts(products);

    // Log deleted product in the terminal
    console.log("🗑️ Product Deleted:", deletedProduct);

    res.status(200).json({
        message: "✅ Product deleted successfully",
        deletedProduct
    });
});

app.put("/products/:id/stock/:quantity", (req, res) => {
    let products = readProducts();
    const productId = parseInt(req.params.id);
    const addedStock = parseInt(req.params.quantity); // Stock quantity from URL

    const product = products.find((p) => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: "❌ Product not found" });
    }

    if (isNaN(addedStock) || addedStock <= 0) {
        return res.status(400).json({ message: "❌ Invalid stock quantity" });
    }

    // Add to existing stock
    product.quantity += addedStock;
    product.total_value = (product.quantity * product.unit_price).toFixed(2);
    product.updated_at = new Date().toISOString();

    writeProducts(products);

    res.status(200).json({
        message: `✅ Added ${addedStock} units. New stock: ${product.quantity}`,
        product,
    });
});


app.put("/products/:id/sell/:quantity", (req, res) => {
    let products = readProducts();
    const productId = parseInt(req.params.id);
    const quantitySold = parseInt(req.params.quantity); // Quantity to sell from URL

    const product = products.find((p) => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: "❌ Product not found" });
    }

    if (isNaN(quantitySold) || quantitySold <= 0) {
        return res.status(400).json({ message: "❌ Invalid sell quantity" });
    }

    if (product.quantity < quantitySold) {
        return res.status(400).json({ message: "❌ Not enough stock available" });
    }

    // Update product quantity and total value
    product.quantity -= quantitySold;
    product.total_value = (product.quantity * product.unit_price).toFixed(2);
    product.updated_at = new Date().toISOString();

    writeProducts(products);

    res.status(200).json({ message: `✅ Sold ${quantitySold} units successfully`, product });
});

// Get All Products
app.get("/api/products", (req, res) => {
    const products = readProducts();
    res.json(products);
});

// Get Product by ID
app.get("/api/products/:productId", (req, res) => {
    const products = readProducts(); // Function that reads all products
    const productId = parseInt(req.params.productId); // Convert ID to integer

    const product = products.find((p) => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
});

app.put("/api/products/:productId", (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.productId);
    const updatedProduct = req.body; // Get updated product from request body

    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    products[index] = { ...products[index], quantity: updatedProduct.quantity };

    writeProducts(products); // Save updated products to file/database

    res.json({ message: "Stock updated successfully", product: products[index] });
});



// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
