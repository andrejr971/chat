import type { Middleware } from '@reduxjs/toolkit';

import { chatActions } from '../chat';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3333/ws';

let socket: WebSocket | null = null;
const pendingSeen = new Set<string>();
let visibilityListenerAttached = false;

export const websocketMiddleware: Middleware =
	(store) => (next) => (action) => {
		if (!visibilityListenerAttached && typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible' && pendingSeen.size > 0) {
					for (const id of Array.from(pendingSeen)) {
						store.dispatch(chatActions.markSeen({ id }));
						pendingSeen.delete(id);
					}
				}
			});
			visibilityListenerAttached = true;
		}

		if (chatActions.connect.match(action)) {
			const { username } = action.payload;

			if (socket) {
				socket.close();
			}

			const wsUrl = `${WS_URL}/${username}`;

			socket = new WebSocket(wsUrl);

			socket.onopen = () => {
				store.dispatch(chatActions.setConnected(true));
				store.dispatch(chatActions.setError(''));

				const canMarkSeen =
					typeof document !== 'undefined' &&
					document.visibilityState === 'visible';

				if (canMarkSeen && pendingSeen.size > 0) {
					for (const id of Array.from(pendingSeen)) {
						store.dispatch(chatActions.markSeen({ id }));
						pendingSeen.delete(id);
					}
				}
			};

			socket.onclose = () => {
				store.dispatch(chatActions.setConnected(false));
			};

			socket.onerror = () => {
				store.dispatch(
					chatActions.setError('Falha ao conectar. Tentando reconectar...'),
				);
			};

			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);

				if (data.type === 'ack') {
					store.dispatch(
						chatActions.setMessageStatus({
							id: data.messageId,
							status: data.status,
						}),
					);
					return;
				}

				if (data.type === 'message') {
					store.dispatch(
						chatActions.upsertMessage({
							id: data.message.id,
							content: data.message.content,
							from: data.message.from,
							timestamp: data.message.timestamp,
							kind: 'user',
						}),
					);

					const state = store.getState();
					if (data.message.from !== state.chat.username) {
						const canMarkSeen =
							typeof document !== 'undefined' &&
							document.visibilityState === 'visible';

						if (canMarkSeen) {
							socket?.send(
								JSON.stringify({ type: 'seen', messageId: data.message.id }),
							);
						} else {
							pendingSeen.add(data.message.id);
						}
					}
				}

				if (data.type === 'system') {
					store.dispatch(
						chatActions.upsertMessage({
							id: data.message.id,
							content: data.message.content,
							from: data.message.from,
							timestamp: data.message.timestamp,
							kind: 'system',
						}),
					);
				}
			};
		}

		if (chatActions.disconnect.match(action)) {
			socket?.close();
			socket = null;
			pendingSeen.clear();
		}

		if (chatActions.sendMessage.match(action)) {
			const { id, content } = action.payload;
			const state = store.getState();

			store.dispatch(
				chatActions.upsertMessage({
					id,
					content,
					from: state.chat.username,
					timestamp: new Date().toISOString(),
					status: 'sent',
				}),
			);

			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(
					JSON.stringify({
						type: 'message',
						id,
						user: state.chat.username,
						content,
					}),
				);
			} else {
				store.dispatch(chatActions.setError('Sem conexão com o servidor.'));
			}
		}

		if (chatActions.markSeen.match(action)) {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(
					JSON.stringify({ type: 'seen', messageId: action.payload.id }),
				);
			}
		}

		return next(action);
	};
