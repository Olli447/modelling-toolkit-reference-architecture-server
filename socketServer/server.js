const SessionManager = require("./SessionManager");
const Message = require("./message");
const WebSocket = require('ws');
const Model = require('./model');

class SocketServer{
    models;
    wss;
    sessionManager;

    constructor() {
        this.sessionManager = new SessionManager(this);
        this.start();
    }

    start(){
        this.wss = new WebSocket.Server({
            port: 8081,
            clientTracking: true
        });
        this.wss.on('connection', this.onConnection.bind(this));

        /*const that = this;
        const interval = setInterval(function ping() {
            that.wss.clients.forEach(function each(ws) {
                if (that.sessionManager.findClientByWebsocket(ws).isAlive === false) return ws.terminate();

                that.sessionManager.findClientByWebsocket(ws).isAlive = false;
                ws.send(JSON.stringify(new Message(
                    'heartbeat'
                )));
            });
        }, 30000);

        this.wss.on('close', function close() {
            clearInterval(interval);
        });*/
    };

    heartbeat(user) {
        user.isAlive = true;
    }

    onConnection(websocket, request) {
        this.startConnection(websocket);
        websocket.on('message', (data) => {
            this.onMessage(websocket, data);
        });

        websocket.on('close', (code, reason) => {
            this.onClose(websocket, code, reason);
        });

        websocket.on('error', err => console.log(err));
        this.sayHello(websocket);
    }

    startConnection(websocket) {
        try {
            const uuid = this.sessionManager.registerClient(websocket);
            websocket.send(JSON.stringify(new Message(
                'onConnect',
                'Response',
                uuid,
                true,
                undefined
            )));
            websocket.send(JSON.stringify(new Message(
                'models',
                'Notification',
                this.sessionManager.getModelMetaInformation(),
                undefined,
                undefined
            )));
        } catch (e) {
            console.log(e)
            websocket.send(JSON.stringify(new Message(
                'onConnect',
                'Response',
                undefined,
                false,
                e
            )));
        }
    }



    onMessage(websocket, data) {
        const message = JSON.parse(data);
        switch (message.channel) {
            case "heartbeat":
                this.heartbeat(websocket);
                break;
            case "addModel":
                this.addModel(websocket,message.uuid, message.modelID, message.languageID, message.data);
                break;
            case "joinModel":
                this.joinModellingSession(websocket, message.uuid, message.modelID, message.languageID);
                break;
            case "sendModelChange":
                this.sendModellingAction(websocket, message.uuid, message.modelID, message.data);
                break;
            case "sendChatMessage":
                this.sendChatMessage(websocket, message.uuid, message.modelID, message.data)
                break;
        }

    }

    onClose(websocket, code, reason) {
        try {
            const user = this.sessionManager.findClientByWebsocket(websocket);
            this.sessionManager.deleteClient(user.uuid);
            console.log("Client disconnected: " + user.uuid + " ("+ code + " - " + reason + ")");
        } catch (e) {
            console.log(e);
        }
    }

    addModel(websocket, clientID, modelID, languageID, content){
        try {
            const model = new Model(modelID, languageID, content);
            this.sessionManager.createModellingSession(clientID, modelID, model);
            websocket.send(JSON.stringify(new Message(
                'addModel',
                'Response',
                undefined,
                true,
                undefined
            )));
            const models = this.sessionManager.getModelMetaInformation()
            for (const user of this.sessionManager.users) {
                user.webSocket.send(JSON.stringify(new Message(
                    'models',
                    'Notification',
                    models,
                    undefined,
                    undefined
                )));
            }
        } catch (e) {
            console.log(e)
            const data = {
                modelID: modelID,
                languageID: languageID
            };
            websocket.send(JSON.stringify(new Message(
                'addModel',
                'Response',
                data,
                false,
                e
            )));
        }
    }
    joinModellingSession(websocket, clientID, modelID, languageID) {
        try {
            this.sessionManager.removeClientFromAllRooms(clientID);
            const data = this.sessionManager.joinModellingSession(clientID, modelID, languageID);
            websocket.send(JSON.stringify(new Message(
                'joinModel',
                'Response',
                data,
                true,
                undefined
            )));
        } catch (e) {
            console.log(e)
            const data = {
                modelID: modelID,
                languageID: languageID
            };
            websocket.send(JSON.stringify(new Message(
                'joinModel',
                'Response',
                data,
                false,
                e
            )));
        }
    }

    sendModellingAction(websocket, clientID, modelID, data) {
        try {
            this.sessionManager.updateModelContent(modelID, data);
            const joinedClients = this.sessionManager.findAllClientsOfRoom(clientID, modelID);
            for (const user of joinedClients) {
                user.webSocket.send(JSON.stringify(new Message(
                    'modelling',
                    'Action',
                    data,
                    undefined,
                    undefined
                )));
            }
            websocket.send(JSON.stringify(new Message(
                'sendModelChange',
                'Response',
                undefined,
                true,
                undefined
            )));
        } catch (e) {
            console.log(e)
            websocket.send(JSON.stringify(new Message(
                'sendModelChange',
                'Response',
                undefined,
                false,
                e
            )));
        }
    }

    sendChatMessage(websocket, clientID, modelID, data) {
        try {
            const message = {
                uuid: clientID,
                message: data
            }
            for (const user of this.sessionManager.findAllClientsOfRoom(clientID, modelID)) {
                user.webSocket.send(JSON.stringify(new Message(
                    'messages',
                    'Message',
                    message,
                    undefined,
                    undefined
                )));
            }
            websocket.send(JSON.stringify(new Message(
                'sendChatMessage',
                'Response',
                undefined,
                true,
                undefined
            )));
        } catch (e) {
            console.log(e)
            websocket.send(JSON.stringify(new Message(
                'sendChatMessage',
                'Response',
                undefined,
                false,
                e
            )));
        }
    }
    onRoomRemoved() {
        const models = this.sessionManager.getModelMetaInformation()
        for (const user of this.sessionManager.users) {
            user.webSocket.send(JSON.stringify(new Message(
                'models',
                'Notification',
                models,
                undefined,
                undefined
            )));
        }
    }

    sayHello(websocket) {
        const data = {
            uuid: 'System',
            message: 'Let`s start modelling'
        }
        websocket.send(JSON.stringify(new Message(
            'messages',
            'Message',
            data,
            undefined,
            undefined
        )));
    }
}
module.exports = SocketServer;
