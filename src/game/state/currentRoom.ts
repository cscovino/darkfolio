import type { RoomId } from '../systems/currentRoom';

let currentRoom: RoomId = 'living';

export function getCurrentRoom(): RoomId {
  return currentRoom;
}

export function setCurrentRoom(room: RoomId): void {
  currentRoom = room;
}

export function setCurrentRoomFrom(room: RoomId | null): void {
  if (room !== null) setCurrentRoom(room);
}
