import { DurableObject } from "cloudflare:workers";

// One Room per mission code. Mission control ("control") sends flight state;
// every cockpit window ("window") in the same room receives it.

const ALLOWED_ORIGINS = [
	/^https:\/\/junkerfamily\.github\.io$/,
	/^http:\/\/localhost(:\d+)?$/,
	/^http:\/\/127\.0\.0\.1(:\d+)?$/,
];
const MAX_MESSAGE = 8192;

export class Room extends DurableObject {
	// Latest flight state, so a window that joins mid-flight catches up at once.
	// Kept in memory only: control resends it ten times a second.
	private last: string | null = null;

	constructor(ctx: DurableObjectState, env: unknown) {
		super(ctx, env as never);
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
	}

	async fetch(request: Request): Promise<Response> {
		const role = new URL(request.url).searchParams.get("role") === "control" ? "control" : "window";
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);
		this.ctx.acceptWebSocket(server, [role]);
		if (role === "window" && this.last) server.send(this.last);
		this.announcePeers();
		return new Response(null, { status: 101, webSocket: client });
	}

	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
		if (typeof message !== "string" || message.length > MAX_MESSAGE) return;
		// Only mission control drives the flight; windows just watch.
		if (!this.ctx.getTags(ws).includes("control")) return;
		if (message.startsWith('{"t":"s"')) this.last = message;
		for (const peer of this.ctx.getWebSockets("window")) {
			try { peer.send(message); } catch { /* peer already gone */ }
		}
	}

	webSocketClose(ws: WebSocket, code: number, reason: string): void {
		try { ws.close(code, reason); } catch { /* already closed */ }
		this.announcePeers(ws);
	}

	webSocketError(ws: WebSocket): void {
		this.announcePeers(ws);
	}

	private announcePeers(gone?: WebSocket): void {
		const count = (tag: string) => this.ctx.getWebSockets(tag).filter((s) => s !== gone).length;
		const msg = JSON.stringify({ t: "peers", control: count("control"), window: count("window") });
		for (const peer of this.ctx.getWebSockets()) {
			if (peer === gone) continue;
			try { peer.send(msg); } catch { /* peer already gone */ }
		}
	}
}

interface Env {
	ROOM: DurableObjectNamespace<Room>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const match = url.pathname.match(/^\/room\/([A-Z0-9]{3,8})$/);
		if (!match) {
			return new Response(url.pathname === "/" ? "Explorer 1 relay is running." : "Not found", {
				status: url.pathname === "/" ? 200 : 404,
			});
		}
		if (request.headers.get("Upgrade") !== "websocket") {
			return new Response("Expected a WebSocket connection", { status: 426 });
		}
		const origin = request.headers.get("Origin") ?? "";
		if (!ALLOWED_ORIGINS.some((re) => re.test(origin))) {
			return new Response("Forbidden", { status: 403 });
		}
		return env.ROOM.getByName(match[1]).fetch(request);
	},
} satisfies ExportedHandler<Env>;
