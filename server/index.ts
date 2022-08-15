import express from 'express';
import path from 'path';
import chalk from 'chalk';
import mongoose from 'mongoose';
import * as tRPC from '@trpc/server';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import EventEmitter from 'events';
import * as ws from 'ws';
import * as http from 'http';
import * as https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const retmodEnv = process.env.RETMOD_ENV || 'PROD';

// webserver stuff
const app = express(); // create express app
const server = http.createServer(app); // then, init a http server based on the express app
const wss = new ws.Server({ server }); // finally, create a websocket server associated with the http server

const port = 3000;

console.log(chalk.yellowBright(`[RETMOD]: Using environment: ${retmodEnv}`));

// commented out MongoDB stuff - You can do something with it, but this is a simple chat app.
/* const MongoDBConfig: {
	ip: string;
	port: string;
	db: string;
	username: string;
	password: string;
} = {
	db: 'main',
	ip: '0.0.0.0',
	port: '27017',
	password: 'passwd',
	username: 'user',
};

mongoose
	.connect(
		`mongodb://${MongoDBConfig.username}:${MongoDBConfig.password}@${MongoDBConfig.ip}:${MongoDBConfig.port}`,
		{
			dbName: MongoDBConfig.db,
		},
	)
	.then(() => {
		console.log(chalk.blue('[DATABASE]: Connected!'));
	}); */

export type Message = { user: string; message: string };
type Messages = Message[];

const messages: Messages = [
	// without database, as it was meant to be simple
	{ user: 'System', message: 'This is a Chatapp built with Retmod and tRPC!' }, // initial message
];

const ee = new EventEmitter(); // add an event emitter (used for emitting when adding a message)

const trpcRouter = tRPC
	.router()
	.query('messages', {
		// messages query -> fetching messages
		resolve() {
			return messages;
		},
	})
	.subscription('onAdd', {
		// create the onAdd subscription
		resolve() {
			return new tRPC.Subscription<Message>((emit) => {
				// return subscription, which always returns a message
				const onAdd = (data: Message) => {
					// create an on add function that emits the message to clients
					emit.data(data);
				};

				ee.on('add', onAdd); // make the event emitter listen to the "add" event
				return () => {
					ee.off('add', onAdd); // when disconnecting, remove the listener.
				};
			});
		},
	})
	.mutation('messages.add', {
		input: z.object({
			user: z.string(),
			message: z.string(),
		}), // input schema
		async resolve({ input }) {
			messages.push(input); // push message to the messages array
			ee.emit('add', input); // emit the add event so everyone can receive the message
			return input; // finally, return the message
		},
	});

export type TrpcRouter = typeof trpcRouter; // export type for the client

const handler = applyWSSHandler({
	wss,
	router: trpcRouter,
}); // apply the Websocket handler to the trpc router

// Websocket Logs
wss.on('connection', (ws) => {
	console.log('WS Connection established');
	ws.once('close', () => {
		console.log('WS Connection closed');
	});
});

// close everything on exit
process.on('SIGTERM', () => {
	handler.broadcastReconnectNotification();
	wss.close();
});

// add the tRPC API to the /trpc route.
app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: trpcRouter,
	}),
);

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.use(express.static('public'));

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(port, () => {
	console.log(chalk.green(`[SERVER]: Listening on port ${port}`));
});
