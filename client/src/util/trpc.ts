import { createReactQueryHooks } from '@trpc/react';
import { TrpcRouter, Message } from '../../../server/index';

const trpc = createReactQueryHooks<TrpcRouter>();

export type Msg = Message;
export default trpc;
