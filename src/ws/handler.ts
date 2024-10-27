import { dataBase } from "src/model/database";
import { Room } from "src/model/room";
import { UserData, WsEvent } from "src/model/types";
import { User } from "src/model/user";
import WebSocket from 'ws';
import { Controller } from "./controller";

const clientController = new Controller();

export const eventHandler = (ws:WebSocket, event:WsEvent) => {
    switch (event.type) {
        case 'reg' : 

        let {name, password} = event.data as UserData;
        let currUser =dataBase.users.find(user => user.name === name);
    
        if (currUser) {
            if (currUser.password === password) {
                clientController.setClient(currUser.id, ws);
                
                clientController.sendToClient(ws, {
                    type: "reg",
                    data: {
                      name:name,
                      index: currUser.id,
                      error: false,
                      errorText: ''
                  },
                    id: 0,
                  })
                  const winners = dataBase.users.map(currUser => ({
                    name: currUser.name,
                    wins: currUser.wins,
                }))
                  clientController.sendToAll({
                    type: "update_winners",
                    data: winners
                })
            } else {
                ws.send(JSON.stringify({
                    type: "reg",
                    data: JSON.stringify({
                      name:name,
                      index: currUser.id,
                      error: true,
                      errorText: 'Wrong password'
                  }),
                    id: 0,
                  })
                )
            }
        } else {
            let newUser = new User({name:name, password:password});
            dataBase.users.push(newUser);
            clientController.setClient(newUser.id, ws);
            clientController.sendToClient(ws, {
                type: "reg",
                data: {
                  name:name,
                  index: newUser.id,
                  error: false,
                  errorText: ''
              },
                id: 0,
              })
              const winners = dataBase.users.map(currUser => ({
                name: currUser.name,
                wins: currUser.wins,
            }))
              clientController.sendToAll({
                type: "update_winners",
                data: winners
            })
        }
        break

        case 'create_room':
            let userByClient = clientController.getClient(ws);
            if (userByClient) {     
            let newRoom = new Room(userByClient);
            dataBase.rooms.push(newRoom)
            let currRooms = dataBase.rooms.map(room => ({
                roomId:room.id,
                roomUsers:room.players.filter(Boolean).map(user => {
                    return {
                    name: user.name,
                    index: user.id
                }})
            }))
            clientController.sendToAll( {
                type: "update_room",
                data: currRooms,
                id: 0,
            })
        }

        break
            
    }
}