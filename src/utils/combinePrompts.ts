import { Message } from '../types';

export function combinePrompts(messages: Message[]): string {
  return messages.reduce((acc, message) => {
    return (acc += message.content);
  }, '');
}
