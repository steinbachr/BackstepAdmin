/*
This file is a VERY thin wrapper around socket.io functions
 */

var mySocket = {
    socketHandle: null,

    init: function(serverUrl) {
        this.socketHandle = io.connect(serverUrl);
        return this;
    },

    /*
    send a message to the server using socket.io
     @param message - the name of the message to send
     @param data - the JSON object to send
    */
    sendMessage: function(message, data) {
        this.socketHandle.emit(message, data);
    },

    /*
    receive a message from socket io and perform the specified action
    @param message - the message to listen for
    @param action - the action to perform on receipt (should be a cb that accepts 1 parameter, data)
     */
    bindMessage: function(message, action) {
        this.socketHandle.on(message, action);
    }
}