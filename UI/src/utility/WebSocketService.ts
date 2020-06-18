
export interface SocketService {
  isConnected: () => boolean,
  connect: () => Promise<void>,
  onConnect: (handler?: ConnectHandler) => Promise<void>,
  subscribe: (event: string, handler: EventHandler) => Promise<void>,
  unsubscribe: (event: string, handler?: EventHandler) => Promise<void>,
  send: (input: MessageData) => Promise<void>
  disconnect: () => Promise<void>,
  onDisconnect: (handler?: DisconnectHandler) => Promise<void>
}
interface MessageData {
  action: string,
  [key: string]: any
}
type ConnectHandler = (event?: Event) => any;
export type EventHandler = (input: { [key: string]: any }) => any;
type DisconnectHandler = (event?: CloseEvent) => any;

export class WebSocketService implements SocketService {
  uri: string;
  listeners: Map<string, EventHandler[]>;
  connected: boolean = false;

  socket: WebSocket | undefined;
  connectHandler: ConnectHandler | undefined;
  disconnectHandler: DisconnectHandler | undefined;

  constructor(uri: string) {
    this.uri = uri;
    this.listeners = new Map<string, EventHandler[]>();
  }

  public isConnected = () => this.connected;

  public connect: SocketService["connect"] = async () => {
    this.socket = new WebSocket(this.uri);
    this.socket.onopen =event => {
      this.connected = true;
      if(!!this.connectHandler) {
        this.connectHandler(event);
      }
    };
    this.socket.onmessage = this.eventListener;

    await this.awaitCriteria(() => this.connected);
  }
  private eventListener: (event: MessageEvent) => void = event => {
    const request: MessageData = JSON.parse(event.data);
    const { action, ...data } = request;
    const eventListeners = this.listeners.get(action);
    console.log("event received...", {event, eventListeners});
    eventListeners?.map(el => el(data));
  }
  private awaitCriteria = async (predicate: () => boolean, delay: number = 500) => {
    const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    const awaiter = async () => {
      if(predicate()) return;        
      await sleep(delay);
        await awaiter();
    };

    await awaiter();
  }

  public onConnect: SocketService["onConnect"] = async handler => {
    this.connectHandler = handler;
  }

  public subscribe: SocketService["subscribe"] = async (event, handler) => {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [ ...existing, handler ]);
  }

  public unsubscribe: SocketService["unsubscribe"] = async (event: string, handler) => {
    const eventHandlers = this.listeners.get(event);
    if(!eventHandlers) return;

    if(!handler) {
      this.listeners.delete(event);
      return;
    }

    const filtered = eventHandlers.filter(eh => eh !== handler);
    this.listeners.set(event, filtered);
  }

  public send: SocketService["send"] = async input => {
    if(!this.connected) throw new Error("Socket not connected!");
    const body = JSON.stringify(input);
    this.socket!.send(body); 
  }

  public disconnect: SocketService["disconnect"] = async () => {
    if(!this.socket) return;

    this.socket.onclose =event => {
      this.connected = false;
      if(!!this.disconnectHandler) {
        this.disconnectHandler(event);
      }
    };
    this.socket.close();

    await this.awaitCriteria(() => !this.connected);
  }
  public onDisconnect: SocketService["onDisconnect"] = async handler => {
    this.disconnectHandler = handler;
  }
}
