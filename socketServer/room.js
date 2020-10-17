class Room {
    id;
    joinedClients;
    model;
    isNew;

    constructor(id, user, model) {
        this.id = id;
        this.joinedClients = [];
        this.addClient(user);
        this.model = model;
        this.isNew = true;
    }

    addClient(user) {
        this.joinedClients.push(user);
        const users = [];
        for (let i = 0; i < this.joinedClients.length; i++) {
            users.push(this.joinedClients[i].uuid);
        }
        console.log('Room ' + this.id + ' now has these users: ' + JSON.stringify(users));
    }
    removeClient(user){
        for (let i = 0; i < this.joinedClients.length; i++) {
            if (this.joinedClients[i].uuid === user.uuid) {
                this.joinedClients.splice(i, 1);

                const users = [];
                for (let i = 0; i < this.joinedClients.length; i++) {
                    users.push(this.joinedClients[i].uuid);
                }
                console.log('Room ' + this.id + ' now has these users: ' + JSON.stringify(users));
                return;
            }
        }

    }
    hasClients() {
        return this.joinedClients.length > 0;
    }

}
module.exports = Room;
