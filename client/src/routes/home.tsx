import { Button, Dialog, Divider, Group, Text, TextInput } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import Base from '../components/Base';
import Link from '../components/Link';
import trpc, { Msg } from '../util/trpc';
import { useLocalStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';

export default function Home() {
	// fetch current messages
	const messages = trpc.useQuery(['messages']);
	// set messages state for rendering & further manipulation
	const [msgs, setMsgs] = useState<typeof messages['data']>();
	const [name, setName] = useLocalStorage({
		key: 'name',
	});
	const [canChat, setCanChat] = useState(false);

	useEffect(() => {
		console.log(name);
		setMsgs(messages.data || []);
	}, [messages.data]);

	useEffect(() => {
		if (name && name.trim().length > 0) {
			setCanChat(true);
		}
	}, [name]);

	// subscribe to message changes
	trpc.useSubscription(['onAdd'], {
		onNext(msg) {
			//merge current messages with new message
			setMsgs((msgs) => [...(msgs || []), msg]);
		},
	});

	const loadedMsgs = msgs?.slice(-7) || [];

	// add a mutation to add a message
	const addMsg = trpc.useMutation(['messages.add']);

	return (
		<Base>
			<div className='overflow-hidden'>
				<div className='flex flex-col max-h-screen'>
					<Dialog opened={!canChat} size='lg' radius='md'>
						<Text size='sm' style={{ marginBottom: 10 }} weight={500}>
							Enter your username
						</Text>

						<Group align='flex-end'>
							<TextInput
								placeholder='RedCrafter07'
								style={{ flex: 1 }}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										if (e.currentTarget.value.trim().length > 0) {
											setName(e.currentTarget.value);
											setCanChat(true);
										}
									}
								}}
							/>
						</Group>
					</Dialog>
					<div className='h-[90vh] overflow-y-auto flex flex-col justify-end'>
						{loadedMsgs?.map((m, i) => (
							<div className='bg-base-300 my-2 p-4 rounded-md' key={i}>
								<h5>{m.user}</h5>
								<h3>{m.message}</h3>
							</div>
						))}
					</div>
					<div className='w-full py-4 grid place-items-center'>
						{canChat ? (
							<input
								type='text'
								placeholder='Message'
								className='p-2 bg-base-300 w-full outline-none rounded-md'
								onKeyDown={async (e) => {
									if (!(e.currentTarget.value.trim().length > 0)) return;
									if (e.code === 'Enter') {
										addMsg.mutate({
											message: e.currentTarget.value,
											user: name as string,
										});
										e.currentTarget.value = '';
									}
								}}
							/>
						) : (
							<Button fullWidth variant='outline' disabled>
								Enter name!
							</Button>
						)}
					</div>
				</div>
			</div>
		</Base>
	);
}
