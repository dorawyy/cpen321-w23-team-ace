const UserAccount = require('../UserAccount'); // Adjust the path as necessary
const ioMock = {
  emit: jest.fn()
};
const userStoreMock = {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    addUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserbyname: jest.fn(),
    deleteAllUsers: jest.fn(),
};
// Interface  socket event 'retrieveAccount'
describe('retrieveAccount', () => {
    let userAccount;
  
    beforeEach(() => {
      jest.clearAllMocks();
      userAccount = new UserAccount(ioMock, userStoreMock);
    });
    
    // Input : userID
    // expected behavior : get the user account from the DB
    // expected output: userinfo
    it('should emit user details when retrieving an account', async () => {
        const mockUser = { userId: '123', name: 'Test User' };
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
      
        await userAccount.retrieveAccount(ioMock, '123');
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith('123');
        expect(ioMock.emit).toHaveBeenCalledWith('userAccountDetails', mockUser);
      });
      // Input : userID not in DB
      // expected behavior : database unchanged
      // expected output : null
      it('should handle the case when the user is not found in retrieveAccount', async () => {
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.retrieveAccount(ioMock, 'nonexistentUser');
      
        expect(ioMock.emit).toHaveBeenCalledWith('userAccountDetails', null);
      });
});
// Interface  socket event 'createAccount'
describe('createAccount', () => {
      let userAccount;
  
      beforeEach(() => {
        jest.clearAllMocks();
        userAccount = new UserAccount(ioMock, userStoreMock);
      });
      // Input : userInfo
      // expected behavior : create a new User in the DB
      // expected output : new added userInfo
      it('should create a new account', async () => {
        const userInfo = { username: 'newUser' };
        userStoreMock.addUser.mockResolvedValueOnce(userInfo);
      
        await userAccount.createAccount(ioMock, userInfo);
      
        expect(userStoreMock.addUser).toHaveBeenCalledWith(userInfo);
        expect(ioMock.emit).toHaveBeenCalledWith('accountCreated', userInfo);
      });

      // Input : userInfo that already exists in DB
      // expected behavior : database unchanged
      // expected output : null
      it('should handle failure in account creation', async () => {
        const userInfo = { username: 'newUser' };
        userStoreMock.addUser.mockResolvedValueOnce(null);
      
        await userAccount.createAccount(ioMock, userInfo);
      
        expect(ioMock.emit).toHaveBeenCalledWith('accountCreated', null);
      });

});


// Interface  socket event 'updateAccount'
describe('updateAccount', () => {
      let userAccount;

    beforeEach(() => {
        jest.clearAllMocks();
        userAccount = new UserAccount(ioMock, userStoreMock);
    });
      
      // Input : updated userInfo for a existing account stored in DB 
      // expected behavior : update the userInfo in DB
      // expected output : updated userInfo
      it('should update an account', async () => {
        const userInfo = { userId: '123', balance: 100 };
        userStoreMock.updateUser.mockResolvedValueOnce(userInfo);
      
        await userAccount.updateAccount(ioMock, userInfo);
      
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(userInfo.userId, userInfo);
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', userInfo);
      });
      
      // Input : null
      // expected behavior : database unchanged
      // expected output : error message saying that it failed to update the account

      it('should handle failure in account update', async () => {
        const userInfo = { userId: '123', balance: 100 };
        userStoreMock.updateUser.mockResolvedValueOnce(null);
      
        await userAccount.updateAccount(ioMock, userInfo);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "Update failed or user not found.");
      });
});

//Interface  socket event 'updateName'
describe('updateName', () => {
      let userAccount;

      beforeEach(() => {
        jest.clearAllMocks();
        userAccount = new UserAccount(ioMock, userStoreMock);
      });
      // Input : userid and a new name for a existing account stored in DB 
      // expected behavior : update the userInfo in DB
      // expected output : updated userInfo
      it('should update username', async () => {
        const userId = '123';
        const newName = 'NewName';
        const mockUser = { userId: '123', username: 'OldName' };
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, username: newName });
      
        await userAccount.updateName(ioMock, userId, newName);
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith(userId);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(userId, { ...mockUser, username: newName });
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', { ...mockUser, username: newName });
      });
      
      // Input : userid and a new name for a non-existing account stored in DB 
      // expected behavior : database unchanged
      // expected output : error message saying that user not found in database
      it('should handle user not found in updateName', async () => {
        const userId = '123';
        const newName = 'NewName';
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.updateName(ioMock, userId, newName);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "User not found.");
      });
});

// Interface  socket event 'updateAdminStatus'
describe('updateAdminStatus', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });
      
      // Input : username and new admin status for an existing account stored in DB 
      // expected behavior : update the admin status of the user
      // expected output : updated userinfo with new admin status
      it('should update admin status', async () => {
        const username = 'user1';
        const isAdmin = true;
        const mockUser = { userId: '123', username, isAdmin: false };
        userStoreMock.getUserbyname.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, isAdmin });
      
        await userAccount.updateAdminStatus(ioMock, username, isAdmin);
      
        expect(userStoreMock.getUserbyname).toHaveBeenCalledWith(username);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(mockUser.userId, { ...mockUser, isAdmin });
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', { ...mockUser, isAdmin });
      });
      
      // Input : username and new admin status for a non-existing account stored in DB 
      // expected behavior : database unchanged
      // expected output : error message saying that user not found in database
      it('should handle user not found in updateAdminStatus', async () => {
        const username = 'user1';
        const isAdmin = true;
        userStoreMock.getUserbyname.mockResolvedValueOnce(null);
      
        await userAccount.updateAdminStatus(ioMock, username, isAdmin);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "User not found.");
      });

});



// Interface  socket event 'updateLastRedemptionDate'
describe('updateLastRedemptionDate', () => {
      let userAccount;
    
      beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
      });

      // Input : userid and an updated redemption date for an existing account stored in DB 
      // expected behavior : redemption date is updated for the user
      // expected output : new updated userinfo
    
      it('should update last redemption date', async () => {
        const userId = '123';
        const date = new Date().toISOString();
        const mockUser = { userId, lastRedemptionDate: null };
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, lastRedemptionDate: date });
      
        await userAccount.updateLastRedemptionDate(ioMock, userId, date);
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith(userId);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(userId, { ...mockUser, lastRedemptionDate: date });
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', { ...mockUser, lastRedemptionDate: date });
      });
      
      // Input : userid and an updated redemption date for a non-existing account stored in DB 
      // expected behavior : database unchanged
      // expected output : error message saying that it failed to update the redemption date for user
      it('should handle user not found in updateLastRedemptionDate', async () => {
        const userId = '123';
        const date = new Date().toISOString();
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.updateLastRedemptionDate(ioMock, userId, date);
      
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', "Failed to update the RedemptionDate for User");
      });

});


// Interface  socket event 'deleteUser'
describe('deleteUser', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });

      // Input : userid for an existing account stored in DB 
      // expected behavior : account is deleted in DB
      // expected output : message saying delete successfully
      it('should handle successful user deletion', async () => {
        const userId = '123';
        userStoreMock.deleteUser.mockResolvedValueOnce({ deletedCount: 1 });
      
        await userAccount.deleteUser(ioMock, userId);
      
        expect(userStoreMock.deleteUser).toHaveBeenCalledWith(userId);
        expect(ioMock.emit).toHaveBeenCalledWith('userDeleted', `User with ID ${userId} deleted successfully.`);
      });
      
      // Input : userid for a non-existing account stored in DB 
      // expected behavior : database unchanged
      // expected output : error message saying that it failed to delete user
      it('should handle user not found in deleteUser', async () => {
        const userId = '123';
        userStoreMock.deleteUser.mockResolvedValueOnce(null);
      
        await userAccount.deleteUser(ioMock, userId);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', `Failed to delete user with ID ${userId}.`);
      });

});


// Interface  socket event 'deleteAllUsers'
describe('deleteAllUsers', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });
      // Input : none 
      // expected behavior : delete successfully
      // expected output : none
      it('should delete all users successfully', async () => {
        userStoreMock.deleteAllUsers.mockResolvedValueOnce({});
      
        await userAccount.deleteAllUsers(ioMock);
      
        expect(userStoreMock.deleteAllUsers).toHaveBeenCalled();
        expect(ioMock.emit).toHaveBeenCalledWith('allUsersDeleted');
      });
      
      // Input : none
      // expected behavior : database unchanged, delete failed
      // expected output : error message saying that it failed to delete all users
      it('should handle failure in deleteAllUsers', async () => {
        userStoreMock.deleteAllUsers.mockResolvedValueOnce(null);
      
        await userAccount.deleteAllUsers(ioMock);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "Failed to delete users.");
      });
});


// Interface  socket event 'checkuserinDB'
describe('checkuserinDB', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });
      
      // Input : userid that relates to a user in DB
      // expected behavior : database unchanged
      // expected output : return userinfo
      it('should find user in database', async () => {
        const userId = '123';
        const mockUser = { userId, username: 'testUser' };
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
      
        await userAccount.checkUserisInDB(ioMock, userId);
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith(userId);
        expect(ioMock.emit).toHaveBeenCalledWith('UserFound', mockUser);
      });
      
      // Input : userid not in DB
      // expected behavior : database unchanged
      // expected output : return null when no such user in DB

      it('should handle user not found in checkUserisInDB', async () => {
        const userId = '123';
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.checkUserisInDB(ioMock, userId);
      
        expect(ioMock.emit).toHaveBeenCalledWith('UserFound', null);
      });
});


// Interface  socket event 'deposit'
describe('deposit', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });

      // Input : userid and the amount to add
      // expected behavior : user balance will be updated
      // expected output : return updated balance
      it('should handle successful deposit', async () => {
        const userId = '123';
        const amount = 100;
        const mockUser = { userId, balance: 50 };
        const updatedBalance = mockUser.balance + amount;
      
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, balance: updatedBalance });
      
        await userAccount.deposit(ioMock, userId, amount);
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith(userId);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(userId, { ...mockUser, balance: updatedBalance });
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', updatedBalance);
      });
      
      // Input : userid not in DB and the amount to add
      // expected behavior : database unchanged
      // expected output : return null
      it('should handle deposit with user not found', async () => {
        const userId = '123';
        const amount = 100;
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.deposit(ioMock, userId, amount);
      
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', null);
      });

});

// Interface  socket event 'depositbyname'
describe('depositbyname', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });

      // Input : username and the amount to add
      // expected behavior : user balance will be updated
      // expected output : return updated balance

      it('should handle successful deposit by name', async () => {
        const username = 'user1';
        const amount = 100;
        const mockUser = { userId: '123', username, balance: 50 };
        const updatedBalance = mockUser.balance + amount;
        userStoreMock.getUserbyname.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, balance: updatedBalance });
      
        await userAccount.depositbyname(ioMock, username, amount);
      
        expect(userStoreMock.getUserbyname).toHaveBeenCalledWith(username);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(mockUser.userId, { ...mockUser, balance: updatedBalance });
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', updatedBalance);
      });

      // Input : username not in DB and the amount to add
      // expected behavior : database unchanged
      // expected output : return null
      
      it('should handle deposit by name with user not found', async () => {
        const username = 'user1';
        const amount = 100;
        userStoreMock.getUserbyname.mockResolvedValueOnce(null);
      
        await userAccount.depositbyname(ioMock, username, amount);
      
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', null);
      });

      // Input : username in DB and the amount to withdraw
      // expected behavior : user balance updated
      // expected output : return the updated balance
      
      it('should not withdraw more than the current balance', async () => {
        const username = '123';
        const amount = -150; // Attempting to withdraw more than the balance
        const mockUser = { username, balance: 100 };
        userStoreMock.getUserbyname.mockResolvedValueOnce(mockUser);
      
        await userAccount.depositbyname(ioMock, username, amount);
        
        expect(userStoreMock.updateUser).not.toHaveBeenCalled();

        // Check if an error message is emitted indicating withdrawal failure
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', "Amount withdrawed is more than the current balance, cannot process this withdrawal");
      });


});


// Interface  socket event 'withdraw'
describe('withdraw', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });


      // Input : userid and the amount to withdraw
      // expected behavior : user balance will be updated
      // expected output : return updated balance
      it('should handle successful withdrawal', async () => {
        const userId = '123';
        const amount = 50;
        const mockUser = { userId, balance: 100 };
        const updatedBalance = mockUser.balance - amount;
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, balance: updatedBalance });
      
        await userAccount.withdraw(ioMock, userId, amount);
      
        expect(userStoreMock.getUser).toHaveBeenCalledWith(userId);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(userId, { ...mockUser, balance: updatedBalance});
        expect(ioMock.emit).toHaveBeenCalledWith('balanceUpdate', updatedBalance);
      });
      
      // Input : userid not in DB and the amount to withdraw
      // expected behavior : database unchanged
      // expected output : error message saying user not found
      it('should handle withdrawal with user not found', async () => {
        const userId = '123';
        const amount = 50;
        userStoreMock.getUser.mockResolvedValueOnce(null);
      
        await userAccount.withdraw(ioMock, userId, amount);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "User not found.");
      });
      
      // Input : userid in DB and the amount that is larger than what the user has in account
      // expected behavior : database unchanged
      // expected output : error message saying withdraw failed
      it('should handle insufficient funds in withdrawal', async () => {
        const userId = '123';
        const amount = 150; // Attempting to withdraw more than the balance
        const mockUser = { userId, balance: 100 };
        userStoreMock.getUser.mockResolvedValueOnce(mockUser);
      
        await userAccount.withdraw(ioMock, userId, amount);
        
        // Check if the user's balance in the database was not changed
        expect(userStoreMock.updateUser).not.toHaveBeenCalledWith(userId, expect.objectContaining({ balance: expect.any(Number) }));
      
        // Check if an error message is emitted indicating withdrawal failure
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "Insufficient funds");
      });

});

// Interface  socket event 'chatBanned'
describe('chatBanned', () => {
          let userAccount;
    
          beforeEach(() => {
            jest.clearAllMocks();
            userAccount = new UserAccount(ioMock, userStoreMock);
          });
      
      
      // Input : userid in DB and the chatban status
      // expected behavior : userinfo will be updated with new chatban status
      // expected output : updated userinfo

      it('should update chat banned status', async () => {
        const username = 'user1';
        const isChatBanned = true;
        const mockUser = { userId: '123', username, isChatBanned: false };
        userStoreMock.getUserbyname.mockResolvedValueOnce(mockUser);
        userStoreMock.updateUser.mockResolvedValueOnce({ ...mockUser, isChatBanned });
      
        await userAccount.updateChatBanned(ioMock, username, isChatBanned);
      
        expect(userStoreMock.getUserbyname).toHaveBeenCalledWith(username);
        expect(userStoreMock.updateUser).toHaveBeenCalledWith(mockUser.userId, { ...mockUser, isChatBanned });
        expect(ioMock.emit).toHaveBeenCalledWith('accountUpdated', { ...mockUser, isChatBanned });
      });
      
      // Input : userid not in DB and the chatban status
      // expected behavior : DB unchanged
      // expected output : User not found error message

      it('should handle user not found in updateChatBanned', async () => {
        const username = 'user1';
        const isChatBanned = true;
        userStoreMock.getUserbyname.mockResolvedValueOnce(null);
      
        await userAccount.updateChatBanned(ioMock, username, isChatBanned);
      
        expect(ioMock.emit).toHaveBeenCalledWith('userError', "User not found.");
      });
      
      
      
      
  });