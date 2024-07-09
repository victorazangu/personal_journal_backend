const request = require('supertest');
const app = require('../src/app');
const { User, Journal, Category } = require('../src/models'); 
const bcrypt = require('bcrypt');
const { tokenService } = require('../src/services');
const sequelize = require('../src/config/database');
const jwt = require('jsonwebtoken');

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


describe('Journal Entry Routes', () => {
    let token;
    let userId;
    let categoryId; 

    beforeAll(async () => {
        const user = await User.create(testUser);
        token = tokenService.generateToken(user);
        userId = user.id;
        const category = await Category.create(testCategory); 
        categoryId = category.id; 
    });

    describe('POST /api/v1/journals', () => {
        it('should create a new journal entry', async () => {
            const res = await request(app)
                .post('/api/v1/journals')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...testJournalEntry });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('title', testJournalEntry.title);
            expect(res.body.data).toHaveProperty('content', testJournalEntry.content);
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .post('/api/v1/journals')
                .send({ ...testJournalEntry });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });

        it('should create a new category if category name is provided', async () => {
            const newCategory = 'Work';
            const res = await request(app)
                .post('/api/v1/journals')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...testJournalEntry, category_id: newCategory });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('title', testJournalEntry.title);
            expect(res.body.data).toHaveProperty('content', testJournalEntry.content);
        });
    });

    describe('GET /api/v1/journals/categories', () => {
        it('should return a list of categories', async () => {
            const res = await request(app)
                .get('/api/v1/journals/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get('/api/v1/journals/categories');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('GET /api/v1/journals/categories/:id', () => {
        it('should return a list of journal entries by category', async () => {
            const journalEntry = await Journal.create({ ...testJournalEntry, userId, category_id: categoryId });

            const res = await request(app)
                .get(`/api/v1/journals/categories/${categoryId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1); 
        });

        it('should return an empty array if no entries for the category', async () => {
            const res = await request(app)
                .get('/api/v1/journals/categories/999') 
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBe(0); 
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get(`/api/v1/journals/categories/${categoryId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('GET /api/v1/journals', () => {
        it('should return a list of journal entries for the user', async () => {
            const journalEntry = await Journal.create({ ...testJournalEntry, userId, category_id: categoryId });

            const res = await request(app)
                .get('/api/v1/journals')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1); 
        });

        it('should return entries for a specific period', async () => {
            const res = await request(app)
                .get('/api/v1/journals?period=weekly')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array); 
        });

        it('should return entries for a specific date range', async () => {
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 1); 
            const toDate = new Date();

            const res = await request(app)
                .get(`/api/v1/journals?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toBeInstanceOf(Array); 
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get('/api/v1/journals');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('GET /api/v1/journals/:id', () => {
        let entryId;

        beforeEach(async () => {
            const newEntry = await Journal.create({ ...testJournalEntry, userId, category_id: categoryId });
            entryId = newEntry.id;
        });

        it('should return a specific journal entry', async () => {
            const res = await request(app)
                .get(`/api/v1/journals/${entryId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('title', testJournalEntry.title); 
        });

        it('should fail if the entry does not exist', async () => {
            const res = await request(app)
                .get('/api/v1/journals/999') 
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Journal entry not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .get(`/api/v1/journals/${entryId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('PATCH /api/v1/journals/:id', () => {
        let entryId;

        beforeEach(async () => {
            const newEntry = await Journal.create({ ...testJournalEntry, userId, category_id: categoryId });
            entryId = newEntry.id;
        });

        it('should update a specific journal entry', async () => {
            const updatedTitle = 'Updated Entry Title';
            const res = await request(app)
                .patch(`/api/v1/journals/${entryId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: updatedTitle });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('title', updatedTitle); 
        });

        it('should fail if the entry does not exist', async () => {
            const res = await request(app)
                .patch('/api/v1/journals/999') 
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Entry Title' });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Journal entry not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/v1/journals/${entryId}`)
                .send({ title: 'Updated Entry Title' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });

    describe('DELETE /api/v1/journals/:id', () => {
        let entryId;

        beforeEach(async () => {
            const newEntry = await Journal.create({ ...testJournalEntry, userId, category_id: categoryId });
            entryId = newEntry.id;
        });

        it('should delete a specific journal entry', async () => {
            const res = await request(app)
                .delete(`/api/v1/journals/${entryId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toBe('Journal entry deleted successfully');
        });

        it('should fail if the entry does not exist', async () => {
            const res = await request(app)
                .delete('/api/v1/journals/999') 
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Journal entry not found');
        });

        it('should fail if not authenticated', async () => {
            const res = await request(app)
                .delete(`/api/v1/journals/${entryId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Authorization token required');
        });
    });
});