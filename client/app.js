// E-commerce Demo App - Vanilla JavaScript
class EcommerceApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.favorites = [];
        this.currentSection = 'products';
        this.searchTerm = '';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.render();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderProducts();
        });

        // Global event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart')) {
                this.addToCart(e.target.dataset.productId);
            } else if (e.target.matches('.favorite-btn')) {
                this.toggleFavorite(e.target.dataset.productId);
            } else if (e.target.matches('.remove-from-cart')) {
                this.removeFromCart(e.target.dataset.productId);
            } else if (e.target.matches('.quantity-btn')) {
                this.updateQuantity(e.target.dataset.productId, e.target.dataset.action);
            } else if (e.target.matches('.quantity-input')) {
                this.setQuantity(e.target.dataset.productId, parseInt(e.target.value));
            } else if (e.target.matches('.clear-cart')) {
                this.clearCart();
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Load products, cart, and favorites in parallel
            const [productsRes, cartRes, favoritesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/cart'),
                fetch('/api/favorites')
            ]);

            this.products = await productsRes.json();
            this.cart = await cartRes.json();
            this.favorites = await favoritesRes.json();

        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;

        // Render section-specific content
        if (section === 'cart') {
            this.renderCart();
        } else if (section === 'favorites') {
            this.renderFavorites();
        }
    }

    render() {
        this.updateCounters();
        this.renderProducts();
    }

    updateCounters() {
        const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const favoritesCount = this.favorites.length;

        document.getElementById('cartCount').textContent = cartCount;
        document.getElementById('favoritesCount').textContent = favoritesCount;
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(this.searchTerm) ||
            product.description.toLowerCase().includes(this.searchTerm) ||
            product.category.toLowerCase().includes(this.searchTerm)
        );

        if (filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <button class="favorite-btn ${this.favorites.includes(product.id) ? 'favorited' : ''}" 
                        data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="app.showProductDetails(${product.id})">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCart() {
        const cartContent = document.getElementById('cartContent');
        
        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <button class="btn btn-primary" onclick="app.showSection('products')">
                        <i class="fas fa-shopping-bag"></i> Continue Shopping
                    </button>
                </div>
            `;
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        cartContent.innerHTML = `
            <div class="cart-items">
                ${this.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4 class="cart-item-name">${item.product.name}</h4>
                            <div class="cart-item-price">$${item.product.price.toFixed(2)} each</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-control">
                                <button class="quantity-btn" data-product-id="${item.productId}" data-action="decrease">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       min="1" data-product-id="${item.productId}">
                                <button class="quantity-btn" data-product-id="${item.productId}" data-action="increase">+</button>
                            </div>
                            <button class="btn btn-danger remove-from-cart" data-product-id="${item.productId}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-total">Total: $${total.toFixed(2)}</div>
                <button class="btn btn-success">
                    <i class="fas fa-credit-card"></i> Checkout (Demo)
                </button>
                <button class="btn btn-secondary clear-cart">
                    <i class="fas fa-trash"></i> Clear Cart
                </button>
            </div>
        `;
    }

    renderFavorites() {
        const favoritesContent = document.getElementById('favoritesContent');
        
        if (this.favorites.length === 0) {
            favoritesContent.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>Add products to your favorites to see them here!</p>
                    <button class="btn btn-primary" onclick="app.showSection('products')">
                        <i class="fas fa-shopping-bag"></i> Browse Products
                    </button>
                </div>
            `;
            return;
        }

        const favoriteProducts = this.products.filter(product => 
            this.favorites.includes(product.id)
        );

        favoritesContent.innerHTML = `
            <div class="favorites-grid">
                ${favoriteProducts.map(product => `
                    <div class="product-card">
                        <button class="favorite-btn favorited" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-price">$${product.price.toFixed(2)}</div>
                            <div class="product-actions">
                                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async addToCart(productId) {
        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId: parseInt(productId) })
            });

            if (response.ok) {
                this.cart = await response.json();
                this.updateCounters();
                this.showToast('Product added to cart!', 'success');
                
                if (this.currentSection === 'cart') {
                    this.renderCart();
                }
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showToast('Error adding product to cart', 'error');
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await fetch(`/api/cart/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.cart = await response.json();
                this.updateCounters();
                this.renderCart();
                this.showToast('Product removed from cart', 'success');
            } else {
                throw new Error('Failed to remove from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showToast('Error removing product from cart', 'error');
        }
    }

    async updateQuantity(productId, action) {
        const item = this.cart.find(item => item.productId === parseInt(productId));
        if (!item) return;

        let newQuantity = item.quantity;
        if (action === 'increase') {
            newQuantity += 1;
        } else if (action === 'decrease') {
            newQuantity = Math.max(1, newQuantity - 1);
        }

        await this.setQuantity(productId, newQuantity);
    }

    async setQuantity(productId, quantity) {
        if (quantity < 1) {
            await this.removeFromCart(productId);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (response.ok) {
                this.cart = await response.json();
                this.updateCounters();
                this.renderCart();
            } else {
                throw new Error('Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showToast('Error updating quantity', 'error');
        }
    }

    async clearCart() {
        if (!confirm('Are you sure you want to clear your cart?')) return;

        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE'
            });

            if (response.ok) {
                this.cart = await response.json();
                this.updateCounters();
                this.renderCart();
                this.showToast('Cart cleared', 'success');
            } else {
                throw new Error('Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showToast('Error clearing cart', 'error');
        }
    }

    async toggleFavorite(productId) {
        const isFavorited = this.favorites.includes(parseInt(productId));
        
        try {
            const response = await fetch(
                isFavorited ? `/api/favorites/${productId}` : '/api/favorites',
                {
                    method: isFavorited ? 'DELETE' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: isFavorited ? undefined : JSON.stringify({ productId: parseInt(productId) })
                }
            );

            if (response.ok) {
                this.favorites = await response.json();
                this.updateCounters();
                
                if (this.currentSection === 'favorites') {
                    this.renderFavorites();
                } else {
                    this.renderProducts();
                }
                
                const message = isFavorited ? 'Removed from favorites' : 'Added to favorites';
                this.showToast(message, 'success');
            } else {
                throw new Error('Failed to update favorites');
            }
        } catch (error) {
            console.error('Error updating favorites:', error);
            this.showToast('Error updating favorites', 'error');
        }
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            alert(`Product Details:\n\nName: ${product.name}\nPrice: $${product.price}\nCategory: ${product.category}\n\nDescription: ${product.description}`);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon} toast-icon"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EcommerceApp();
});
