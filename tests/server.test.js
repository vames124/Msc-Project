const request = require('supertest');
const app = require('../server/index');

describe('E-commerce API Tests', () => {
    let server;
    
    beforeAll(() => {
        // Start the server for testing
        server = app.listen(0); // Use port 0 to get a random available port
    });
    
    afterAll((done) => {
        // Close the server after all tests
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });
    
    beforeEach(() => {
        // Reset cart and favorites for each test
        // Access the app's internal state and reset it
        const appState = app.locals || {};
        if (appState.cart) appState.cart.length = 0;
        if (appState.favorites) appState.favorites.length = 0;
    });

    describe('GET /api/products', () => {
        test('should return all products', async () => {
            const response = await request(app)
                .get('/api/products')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('price');
            expect(response.body[0]).toHaveProperty('image');
        });
    });

    describe('GET /api/products/:id', () => {
        test('should return a specific product', async () => {
            const response = await request(app)
                .get('/api/products/1')
                .expect(200);

            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('price');
        });

        test('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .get('/api/products/999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });
    });

    describe('Cart API', () => {
        test('should return empty cart initially', async () => {
            const response = await request(app)
                .get('/api/cart')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        test('should add item to cart', async () => {
            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 2 })
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('productId', 1);
            expect(response.body[0]).toHaveProperty('quantity', 2);
            expect(response.body[0]).toHaveProperty('product');
        });

        test('should update existing item quantity', async () => {
            // First add an item
            await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 1 });

            // Then add more of the same item
            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 2 })
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].quantity).toBe(3);
        });

        test('should return 404 when adding non-existent product to cart', async () => {
            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 999 })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        test('should update cart item quantity', async () => {
            // First add an item
            await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 1 });

            // Then update quantity
            const response = await request(app)
                .put('/api/cart/1')
                .send({ quantity: 5 })
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].quantity).toBe(5);
        });

        test('should remove item when quantity is set to 0', async () => {
            // First add an item
            await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 1 });

            // Then set quantity to 0
            const response = await request(app)
                .put('/api/cart/1')
                .send({ quantity: 0 })
                .expect(200);

            expect(response.body.length).toBe(0);
        });

        test('should remove item from cart', async () => {
            // First add an item
            await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 1 });

            // Then remove it
            const response = await request(app)
                .delete('/api/cart/1')
                .expect(200);

            expect(response.body.length).toBe(0);
        });

        test('should clear entire cart', async () => {
            // First add some items
            await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 1 });
            await request(app)
                .post('/api/cart')
                .send({ productId: 2, quantity: 2 });

            // Then clear cart
            const response = await request(app)
                .delete('/api/cart')
                .expect(200);

            expect(response.body.length).toBe(0);
        });
    });

    describe('Favorites API', () => {
        test('should return empty favorites initially', async () => {
            const response = await request(app)
                .get('/api/favorites')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        test('should add product to favorites', async () => {
            const response = await request(app)
                .post('/api/favorites')
                .send({ productId: 1 })
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toContain(1);
        });

        test('should not add duplicate to favorites', async () => {
            // Add product twice
            await request(app)
                .post('/api/favorites')
                .send({ productId: 1 });

            const response = await request(app)
                .post('/api/favorites')
                .send({ productId: 1 })
                .expect(200);

            expect(response.body).toEqual([1]);
        });

        test('should return 404 when adding non-existent product to favorites', async () => {
            const response = await request(app)
                .post('/api/favorites')
                .send({ productId: 999 })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        test('should remove product from favorites', async () => {
            // First add a product
            await request(app)
                .post('/api/favorites')
                .send({ productId: 1 });

            // Then remove it
            const response = await request(app)
                .delete('/api/favorites/1')
                .expect(200);

            expect(response.body.length).toBe(0);
        });
    });

    describe('Health Check', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('cartItems');
            expect(response.body).toHaveProperty('favoritesCount');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid JSON in request body', async () => {
            const response = await request(app)
                .post('/api/cart')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);
        });

        test('should handle missing productId in cart request', async () => {
            const response = await request(app)
                .post('/api/cart')
                .send({ quantity: 1 })
                .expect(404); // Product not found since productId is undefined
        });
    });
});
