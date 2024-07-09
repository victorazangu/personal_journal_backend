const request = require('supertest');
const app = require('../src/app'); 
const { User, Journal, Category } = require('../src/models'); 
const { tokenService } = require('../src/services');
const sequelize = require('../src/config/database');


const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    phone: '1234567890',
    image: 'test-image.jpg'
};

const testCategory = {
    name: 'Personal' 
};

const testJournalEntry = {
    title: 'My First Journal Entry',
    content: 'This is the content of my first journal entry.',
    category_id: 1 
};


beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Category Routes', () => {
    let token;
    let userId; 

    beforeAll(async () => {
        const user = await User.create(testUser);
        token = tokenService.generateToken(user);
        userId = user.id;
    });

    describe('POST /api/v1/categories', () => {
        it('should create a new category', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Work' });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('name', 'Work');
        });

        it('should fail if the category already exists', async () => {
            await Category.create({ name: 'Personal' }); 

            const res = await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Personal' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Category with this name already exists');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({ name: 'Travel' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('GET /api/v1/categories', () => {
        it('should return a list of categories', async () => {
            await Category.create({ name: 'Work' }); 
            await Category.create({ name: 'Travel' }); 

            const res = await request(app)
                .get('/api/v1/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3); 
        });

        it('should handle pagination', async () => {
            await Category.create({ name: 'Work' }); 
            await Category.create({ name: 'Travel' }); 

            const res = await request(app)
                .get('/api/v1/categories?page=2&pageSize=1') 
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBe(1); 
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get('/api/v1/categories');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('GET /api/v1/categories/:id', () => {
        let categoryId;

        beforeEach(async () => {
            const category = await Category.create({ name: 'Work' }); 
            categoryId = category.id; 
        });

        it('should return a specific category', async () => {
            const res = await request(app)
                .get(`/api/v1/categories/${categoryId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('name', 'Work'); 
        });

        it('should fail if the category does not exist', async () => {
            const res = await request(app)
                .get('/api/v1/categories/999') 
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Category not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get(`/api/v1/categories/${categoryId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('PUT /api/v1/categories/:id', () => {
        let categoryId;

        beforeEach(async () => {
            const category = await Category.create({ name: 'Work' }); 
            categoryId = category.id; 
        });

        it('should update a category', async () => {
            const res = await request(app)
                .put(`/api/v1/categories/${categoryId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Work' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('name', 'Updated Work'); 
        });

        it('should fail if the category does not exist', async () => {
            const res = await request(app)
                .put('/api/v1/categories/999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Work' });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Category not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .put(`/api/v1/categories/${categoryId}`)
                .send({ name: 'Updated Work' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('DELETE /api/v1/categories/:id', () => {
        let categoryId;

        beforeEach(async () => {
            const category = await Category.create({ name: 'Work' }); 
            categoryId = category.id; 
        });

        it('should delete a category', async () => {
            const res = await request(app)
                .delete(`/api/v1/categories/${categoryId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toBe('Category deleted successfully');
        });

        it('should fail if the category does not exist', async () => {
            const res = await request(app)
                .delete('/api/v1/categories/999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Category not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .delete(`/api/v1/categories/${categoryId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });
});