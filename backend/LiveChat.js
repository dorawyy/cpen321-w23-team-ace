class LiveChat {
    // ChatGPT usage: Yes
    constructor(io) {
        this.io = io;
    }

    // ChatGPT usage: partial
    registerSocketEvents(socket, roomName, userName) {
        socket.on('sendChatMessage', (message) => {
            console.log("Send chat Live");
            const chatMessage = {
                user: userName,
                text: message,
            };

            this.io.to(roomName).emit('receiveChatMessage', chatMessage);

        });
    }
}

module.exports = LiveChat;
