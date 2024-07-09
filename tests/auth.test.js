const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const bcrypt = require('bcrypt');
const { tokenService } = require('../src/services');
const sequelize = require('../src/config/database');

const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: 'password123',
    password: '1234567890',
    image: 'test-image.jpg'
};

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await User.create({
        name: testUser.name,
        email: testUser.email,
        password: bcrypt.hashSync(testUser.password, 10),
        phone: testUser.phone,
        image: testUser.image
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Auth Routes', () => {
    let token;

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', testUser.email);

            token = res.body.token;
        });

        it('should fail if the email is already taken', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should log in an existing user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail if the email or password is incorrect', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'incorrectpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('GET /api/v1/auth/profile', () => {
        it('should return user profile data', async () => {
            const res = await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('email', testUser.email);
        });

        it('should fail if the token is invalid or expired', async () => {
            const res = await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', `Bearer invalid_token`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Expired or invalid token, please log in');
        });
    });

    describe('PUT /api/v1/auth/profile', () => {
        it('should update user profile data', async () => {
            const updatedName = 'Updated Test User';
            const res = await request(app)
                .put('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: updatedName,
                    email: testUser.email
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('name', updatedName);
        });

        it('should fail if the user is not found', async () => {
            const res = await request(app)
                .put('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New User',
                    email: 'nonexistent@example.com'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('User not found');
        });
    });

    describe('PUT /api/v1/auth/password', () => {
        it('should update user password', async () => {
            const newPassword = 'newpassword123';
            const res = await request(app)
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: newPassword
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Password updated successfully');
        });

        it('should fail if the current password is incorrect', async () => {
            const res = await request(app)
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Current password is incorrect');
        });

        it('should fail if the user is not found', async () => {
            const res = await request(app)
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'newpassword123'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('User not found');
        });
    });
});
