const io = require('socket.io-client');
const server = require('./server.js'); // Adjust the path to your server file

describe('createAccount event', () => {
    let clientSocket;

    beforeAll((done) => {
        // Start the server
        server.listen(443, () => {
            console.log(`Test server running on port 443`);
            clientSocket = io(`http://localhost:443`);
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        // Close the client socket and server after tests
        clientSocket.close();
        server.close();
    });

    test('should create an account successfully', (done) => {
        // Arrange
        const userInfo = {
            username: 'testUser',
            email: 'test@example.com',
            password: 'password123'
        };

        // Act
        clientSocket.emit('createAccount', userInfo);

        // Assert
        clientSocket.on('accountCreated', (response) => {
            // Here, you would check the actual response structure
            // For example, if the response should be the user object with an id, username, and email
            expect(response).toEqual(expect.objectContaining({
                id: expect.any(String),
                username: 'testUser',
                email: 'test@example.com'
            }));
            done();
        });
    });

    // Add more tests as needed
});
