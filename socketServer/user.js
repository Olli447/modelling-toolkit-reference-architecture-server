class User {
    uuid;
    webSocket;
    isAlive;

    constructor(uuid, webSocket) {
        this.uuid = uuid;
        this.webSocket = webSocket;
        this.isAlive = true;
    }
}
module.exports = User;
