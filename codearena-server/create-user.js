const { User } = require('./models');

async function createTestUser() {
    try {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email: 'test@example.com' } });

        if (existingUser) {
            console.log('User already exists!');
            console.log('Email: test@example.com');
            console.log('Password: password123');
            return;
        }

        // Create new user
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123' // Will be hashed by the model
        });

        console.log('✅ Test user created successfully!');
        console.log('Email: test@example.com');
        console.log('Password: password123');
        console.log('Username:', user.username);
    } catch (error) {
        console.error('Error creating user:', error.message);
    } finally {
        process.exit();
    }
}

createTestUser();
