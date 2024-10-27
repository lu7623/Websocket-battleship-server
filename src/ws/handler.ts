import { dataBase } from "src/model/database";
import { Room } from "src/model/room";
import { UserData, WsEvent } from "src/model/types";
import { User } from "src/model/user";
import WebSocket from 'ws';

export const eventHandler = (ws:WebSocket, event:WsEvent) => {
    switch (event.type) {
        case 'reg' : 
        console.log(event.data)
        let {name, password} = JSON.parse(event.data as string) as UserData;
        let currUser =dataBase.users.find(user => user.name === name);
       
        if (currUser) {
            if (currUser.password === password) {
                ws.send(JSON.stringify({
                    type: "reg",
                    data: JSON.stringify({
                      name:name,
                      index: currUser.id,
                      error: false,
                      errorText: ''
                  }),
                    id: 0,
                  })
                )
                ws.send(JSON.stringify({
                    type: "update_winners",
                    data: JSON.stringify( [
                        {
                            name: currUser.name,
                            wins: currUser.wins,
                        }
                    ])
                       ,
                    id: 0,
                }));
                let newRoom = new Room(currUser);
                dataBase.rooms.push(newRoom)
                let currRooms = dataBase.rooms.filter(Boolean).map(room => ({
                    roomId:room.id,
                    roomUsers:room.players.map(user => {
                        if (user) return {
                        name: user.name,
                        index: user.id
                    }})
                }))
                console.log(currRooms)
                ws.send(JSON.stringify({
                    type: "update_room",
                    data: JSON.stringify(currRooms),
                    id: 0,
                }))
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
            console.log(newUser)
            ws.send(JSON.stringify({
                type: "reg",
                data: JSON.stringify({
                  name:name,
                  index: newUser.id,
                  error: false,
                  errorText: ''
              }),
                id: 0,
              })
            )
            console.log(JSON.stringify({
                type: "update_winners",
                data: JSON.stringify( [
                    {
                        name: newUser.name,
                        wins: 0,
                    }
                ])
                   ,
                id: 0,
            }))
            ws.send(JSON.stringify({
                type: "update_winners",
                data: JSON.stringify( [
                    {
                        name: newUser.name,
                        wins: 0,
                    }
                ])
                   ,
                id: 0,
            }))
            let newRoom = new Room(newUser);
            dataBase.rooms.push(newRoom)
            let currRooms = dataBase.rooms.filter(Boolean).map(room => ({
                roomId:room.id,
                roomUsers:room.players.map(user => {
                    if (user) return {
                    name: user.name,
                    index: user.id
                }})
            }))
            console.log(currRooms)
            ws.send(JSON.stringify({
                type: "update_room",
                data: JSON.stringify(currRooms),
                id: 0,
            }))
        }        
        break
    }
}