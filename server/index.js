const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory storage (resets on server restart)
// Store in app.locals so it can be accessed during testing
app.locals.cart = [];
app.locals.favorites = [];

// Mock product data
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    description: "Advanced smartwatch with health monitoring features",
    category: "Electronics"
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
    description: "Programmable coffee maker for the perfect morning brew",
    category: "Home"
  },
  {
    id: 4,
    name: "Running Shoes",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
    description: "Comfortable running shoes with advanced cushioning",
    category: "Sports"
  },
  {
    id: 5,
    name: "Laptop Stand",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
    description: "Adjustable laptop stand for better ergonomics",
    category: "Office"
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    description: "Portable Bluetooth speaker with excellent sound quality",
    category: "Electronics"
  }
];

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Get cart
app.get('/api/cart', (req, res) => {
  res.json(app.locals.cart);
});

// Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingItem = app.locals.cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    app.locals.cart.push({
      productId,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
  }

  res.json(app.locals.cart);
});

// Update cart item quantity
app.put('/api/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  
  const item = app.locals.cart.find(item => item.productId === parseInt(productId));
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
  
  if (quantity <= 0) {
    app.locals.cart = app.locals.cart.filter(item => item.productId !== parseInt(productId));
  } else {
    item.quantity = quantity;
  }
  
  res.json(app.locals.cart);
});

// Remove item from cart
app.delete('/api/cart/:productId', (req, res) => {
  const { productId } = req.params;
  app.locals.cart = app.locals.cart.filter(item => item.productId !== parseInt(productId));
  res.json(app.locals.cart);
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  app.locals.cart = [];
  res.json(app.locals.cart);
});

// Get favorites
app.get('/api/favorites', (req, res) => {
  res.json(app.locals.favorites);
});

// Add to favorites
app.post('/api/favorites', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (!app.locals.favorites.includes(productId)) {
    app.locals.favorites.push(productId);
  }
  
  res.json(app.locals.favorites);
});

// Remove from favorites
app.delete('/api/favorites/:productId', (req, res) => {
  const { productId } = req.params;
  app.locals.favorites = app.locals.favorites.filter(id => id !== parseInt(productId));
  res.json(app.locals.favorites);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cartItems: app.locals.cart.length,
    favoritesCount: app.locals.favorites.length
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
