// UserStore.test.js
const { MongoClient } = require('mongodb');
const UserStore = require('../UserStore'); // Update with the correct path

// ChatGPT usage: Partial
jest.mock('mongodb', () => {
    const collectionMock = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn()
    };
  
    const dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock)
    };
  
    const mClient = {
      connect: jest.fn().mockResolvedValue(),
      db: jest.fn().mockReturnValue(dbMock),
      close: jest.fn()
    };
  
    return { MongoClient: jest.fn(() => mClient) };
  });

// ChatGPT usage: No
describe('UserStore', () => {
  let userStore;
  const connectionString = 'mongodb://127.0.0.1:27017';
  const dbName = 'users';

  beforeEach(() => {
    userStore = new UserStore(connectionString, dbName);
  });

  describe('connect', () => {
       

    it('should throw an error if database connection fails', async () => {
        // Mock console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const errorMessage = 'Connection failed';
        const error = new Error(errorMessage);
        userStore.client.connect.mockImplementationOnce(() => {
            throw error;
        });
        await expect(userStore.connect()).rejects.toThrow(errorMessage);
        consoleSpy.mockRestore();
      });
      

        it('should connect to the database', async () => {
            await userStore.connect();
            expect(MongoClient).toHaveBeenCalledWith(connectionString);
            expect(userStore.client.db).toHaveBeenCalledWith(dbName);
            expect(userStore.client.connect).toHaveBeenCalled();
        });

    });
});



// ChatGPT usage: No
describe('getUser', () => {
    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    
  it('should retrieve a user by userId', async () => {
    await userStore.connect();
    const userId = 'user123';
    const mockUser = { userId, name: 'Test User' };
    userStore.client.db().collection().findOne.mockResolvedValue(mockUser);

    const result = await userStore.getUser(userId);

    expect(userStore.client.db().collection().findOne).toHaveBeenCalledWith({ userId });
    expect(result).toEqual(mockUser);
  });
});

// ChatGPT usage: No
describe('getUserbyname', () => {

    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    it('should retrieve a user by username', async () => {
      await userStore.connect();
      const username = 'testUser';
      const mockUser = { userId: 'user123', username };
      userStore.client.db().collection().findOne.mockResolvedValue(mockUser);

      const result = await userStore.getUserbyname(username);

      expect(userStore.client.db().collection().findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });
});


// ChatGPT usage: No
describe('addUser', () => {

    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });

    it('should add a new user', async () => {
      await userStore.connect();
      const newUser = { username: 'newUser', email: 'new@example.com' };
      userStore.client.db().collection().findOne.mockResolvedValueOnce(null);
      userStore.client.db().collection().insertOne.mockResolvedValueOnce({ insertedId: 'newId' });
      userStore.client.db().collection().findOne.mockResolvedValueOnce({ ...newUser, userId: 'newId' });

      const result = await userStore.addUser(newUser);

      expect(userStore.client.db().collection().findOne).toHaveBeenCalledWith({ username: newUser.username });
      expect(userStore.client.db().collection().insertOne).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ...newUser, userId: 'newId' });
    });

    it('should not overwirte an existing user', async () =>{
        await userStore.connect();
        const newUser = { username: 'newUser', email: 'new@example.com' };
        userStore.client.db().collection().findOne.mockResolvedValueOnce(newUser);
      
    
        const result = await userStore.addUser(newUser);
      
        expect(userStore.client.db().collection().findOne).toHaveBeenCalledWith({ username: newUser.username });
        expect(result).toBeNull();
    })
});


// ChatGPT usage: No
describe('updateUser', () => {
    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    it('should update a user', async () => {
      await userStore.connect();
      const userId = 'user123';
      const update = { name: 'Updated Name' };
      userStore.client.db().collection().updateOne.mockResolvedValueOnce({ modifiedCount: 1 });
      userStore.client.db().collection().findOne.mockResolvedValueOnce({ userId, ...update });

      const result = await userStore.updateUser(userId, update);

      expect(userStore.client.db().collection().updateOne).toHaveBeenCalledWith({ userId }, { $set: update });
      expect(result).toEqual({ userId, ...update });
    });
  });

  describe('deleteUser', () => {
    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    it('should delete a user', async () => {
      await userStore.connect();
      const userId = 'user123';
      userStore.client.db().collection().deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const result = await userStore.deleteUser(userId);

      expect(userStore.client.db().collection().deleteOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });


  // ChatGPT usage: No
  describe('deleteAllUsers', () => {
    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    it('should delete all users', async () => {
      await userStore.connect();
      userStore.client.db().collection().deleteMany.mockResolvedValueOnce({ deletedCount: 5 });

      const result = await userStore.deleteAllUsers();

      expect(userStore.client.db().collection().deleteMany).toHaveBeenCalledWith({});
      expect(result).toEqual({ deletedCount: 5 });
    });
  });


  // ChatGPT usage: No
  describe('close', () => {
    let userStore;
    const connectionString = 'mongodb://127.0.0.1:27017';
    const dbName = 'users';
  
    beforeEach(() => {
      userStore = new UserStore(connectionString, dbName);
    });
    it('should close the database connection', async () => {
      await userStore.connect();
      await userStore.close();
      expect(userStore.client.close).toHaveBeenCalled();
    });
  });
