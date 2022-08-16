import Router from './router';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import trpc from './util/trpc';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'; // use wss for https and ws for http. Useful for local testing.

const wsClient = createWSClient({
	url: `${wsProtocol}://${window.location.host}`,
});

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
	url: `${window.location.origin}/trpc`,
	links: [
		wsLink({
			client: wsClient,
		}),
	],
});

export default function Wrappers() {
	return (
		<div className='text-base-content bg-base-300'>
			<MantineProvider theme={{ primaryColor: 'cyan', colorScheme: 'dark' }}>
				<NotificationsProvider>
					<trpc.Provider queryClient={queryClient} client={trpcClient}>
						<QueryClientProvider client={queryClient}>
							<Router />
						</QueryClientProvider>
					</trpc.Provider>
				</NotificationsProvider>
			</MantineProvider>
		</div>
	);
}
