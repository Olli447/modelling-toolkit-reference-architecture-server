class Room {
    id;
    joinedClients;
    model;

    constructor(id, user, model) {
        this.id = id;
        this.joinedClients = [];
        this.addClient(user);
        this.model = model;
    }

    addClient(user) {
        this.joinedClients.push(user);
    }
    removeClient(user){
        for (let i = 0; i < this.joinedClients.length; i++) {
            if (this.joinedClients[i].uuid === user.uuid) {
                this.joinedClients.slice(i, 1);
                return;
            }
        }
    }
    hasClients() {
        return this.joinedClients > 0;
    }

}
module.exports = Room;
