import WebSocket from 'ws';
import { stringifyMessage } from 'src/utils/stringifyMessage';
import { dataBase } from 'src/model/database';

export class Controller {
  clientsMap: Map<string, WebSocket>;
  constructor() {
    this.clientsMap = new Map<string, WebSocket>();
  }

  sendToClient = (client: WebSocket, payload: Record<string, unknown>) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stringifyMessage(payload));
      console.info('-->', 'Sent to client:', payload);
    }
  };

  sendToAll = (payload: Record<string, unknown>) => {
    Array.from(this.clientsMap.values()).forEach((client) => {
      this.sendToClient(client, payload);
    });
  };

  sendToRoom = (userIds: [string, string], payload: [Record<string, unknown>, Record<string, unknown>]) => {
    userIds.forEach((id, ind) => {
      let currClient = this.clientsMap.get(id);
      if (currClient) this.sendToClient(currClient, payload[ind]);
    });
  };

  setClient = (userId: string, client: WebSocket) => {
    this.clientsMap.set(userId, client);
  };

  getClient = (client: WebSocket) => {
    let clientId = Array.from(this.clientsMap.entries()).find(([_, item]) => item === client);
    let user = clientId && dataBase.users.find((user) => user.id === clientId[0]);
    return user;
  };

  getClientById = (userId: string) => this.clientsMap.get(userId);
}
