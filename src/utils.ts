import { Destination } from 'src/Destination';
import { Event, MessageEdited, MessagePosted } from 'vendor/so-client/src/events';

export function isEventMessage(event: Event): event is MessagePosted | MessageEdited {
  return (event.event_type === 1 || event.event_type === 2);
}

export function getEventDest(event: Event): Destination {
  if (!isEventMessage(event)) {
    throw new Error('invalid event type');
  }

  return {
    roomId: event.room_id.toString(),
    userId: event.user_id.toString(),
    userName: event.user_name
  };
}