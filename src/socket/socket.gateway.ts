import {
    ConnectedSocket,
    MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Live Stream Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Live Stream Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
handleJoinRoom(
  @MessageBody() roomName: string,
  @ConnectedSocket() client: Socket,
) {
  client.join(roomName);
  console.log(`Client ${client.id} joined channel room: ${roomName}`);
  return { status: 'success', joined: roomName };
}
}