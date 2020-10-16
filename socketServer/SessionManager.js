const Room = require("./room");
const User = require("./user");

class SessionManager {
    users;
    rooms;

    constructor() {
        this.users = [];
        this.rooms = [];
    }

    registerClient(websocket) {
        const uuid = this.uuidv4();
        const user = new User(uuid,websocket)
        this.users.push(user);
        console.log("Client connected: " + uuid);
        return uuid;
    }
    deleteClient(uuid) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].uuid === uuid) {
                this.removeClientFromAllRooms(uuid);
                this.users.slice(i, 1);
                return;
            }
        }
        throw "No such user";
    }

    createModellingSession(clientID, modelID, model) {
        const user = this.findClient(clientID);
        const room = new Room(modelID, user, model);
        this.rooms.push(room);
        console.log("Room " + modelID + " was created by " + clientID);
    }
    joinModellingSession(clientID, modelID, languageID) {
        const user = this.findClient(clientID);
        let room = this.findRoom(modelID);

        if (!room) {
            throw "No such room";
        }
        if (room.model.languageID !== languageID) {
            throw "languageID mismatch"
        }

        room.addClient(user);
        console.log("Client " + clientID + " joined room " + modelID);
    }
    leaveModellingSession(clientID, modelID) {
        const user = this.findClient(clientID);
        let room = this.findRoom(modelID);

        if (!room) {
            throw "No such room";
        }

        room.removeClient(user)
        console.log("Client " + clientID + " was removed from room " + modelID);
        if (!room.hasClients()) {
            this.removeRoom(modelID);
            console.log("Room " + modelID + " has been removed (No users)");
        }

    }

    removeClientFromAllRooms(clientID) {
        const user = this.findClient(clientID);
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            room.removeClient(user)
            console.log("Client " + clientID + " was removed from room " + room.id);
            if (!room.hasClients()) {
                this.removeRoom(room.id);
                console.log("Room " + room.id + " has been removed (No users)");
            }
        }
        console.log("Client " + clientID + " was removed from all rooms");
    }

    findRoomIDForUser(clientID) {
        const user = this.findClient(clientID);
        for (const room of this.rooms) {
            for (const user of room.joinedClients) {
                if (user.uuid === clientID) {
                    return room.id;
                }
            }
        }
        return null;
    }    
    findClient(uuid) {
        for (const user of this.users) {
            if (user.uuid === uuid) {
                return user;
            }
        }
        throw "No such user";
    }
    findClientByWebsocket(websocket) {
        for (const user of this.users) {
            if (user.webSocket === websocket) {
                return user;
            }
        }
        throw "No such user";
    }
    findAllClientsOfRoom(clientID, roomID) {
        const clients = this.findRoom(roomID).joinedClients;
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].uuid === clientID) {
                clients.splice(i, 1);
                return clients;
            }
        }
        return clients;
    }

    findRoom(id) {
        for (const room of this.rooms) {
            if (room.id === id) {
                return room;
            }
        }
        throw "No such room";
    }
    removeRoom(id) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === id) {
                this.rooms.slice(i, 1);
                return;
            }
        }
        throw "No such room";
    }

    getModelMetaInformation() {
        const modelInformation = [];
        for (const room of this.rooms) {
            modelInformation.push({
                modelID: room.model.modelID,
                languageID: room.model.languageID
            });
        }
        return modelInformation;
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
module.exports = SessionManager;
