import { adapt } from '@/state-adapt';

export const count = adapt(0, {
  increment: (state) => state + 1,
  decrement: (state) => state - 1,
});
