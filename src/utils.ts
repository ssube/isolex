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

export function leftPad(val: string, min: number = 8, fill: string = '0'): string {
  if (val.length < min) {
    const pre = Array(min - val.length).fill(fill).join('');
    return `${pre}${val}`;
  } else {
    return val;
  }
}