
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
  [key: string]: unknown
}
type ConnectHandler = (event?: Event) => unknown;
export type EventHandler = (input: { [key: string]: unknown }) => unknown;
type DisconnectHandler = (event?: CloseEvent) => unknown;

enum SocketState {
  CONNECTING = 0, // Socket has been created. The connection is not yet open.
  OPEN =       1, // The connection is open and ready to communicate.
  CLOSING =    2, // The connection is in the process of closing.
  CLOSED =     3  // The connection is closed or couldn't be opened.
}

interface Options {
  maxRetries: number
}

const defaultOptions: Options = {
  maxRetries: 5
};

export class WebSocketService implements SocketService {
  uri: string;
  options: Options;
  listeners: Map<string, EventHandler[]>;

  socket: WebSocket | undefined;
  connectHandler: ConnectHandler | undefined;
  disconnectHandler: DisconnectHandler | undefined;

  constructor(uri: string, options: Options = defaultOptions) {
    this.uri = uri;
    this.options = options;
    this.listeners = new Map<string, EventHandler[]>();
  }

  public isConnected = () : boolean => {
    return !!this.socket && this.socket.readyState === SocketState.OPEN;
  }

  public connect: SocketService["connect"] = async () => {
    this.socket = new WebSocket(this.uri);
    this.socket.onopen = event => {
      if(this.connectHandler) {
        this.connectHandler(event);
      }
    };
    this.socket.onmessage = this.eventListener;

    await this.awaitCriteria(() => this.isConnected());
  }
  private eventListener: (event: MessageEvent) => void = event => {
    const request: MessageData = JSON.parse(event.data);
    const { action, ...data } = request;
    const eventListeners = this.listeners.get(action);
    console.log("event received...", {event, eventListeners});
    eventListeners?.map(el => el(data));
  }
  private awaitCriteria = async (predicate: () => boolean, delay = 500) => {
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
    if(!this.isConnected()) {
      await this.reconnect();
    }

    if(!this.socket) throw new Error("socket unavailable.");
    
    const body = JSON.stringify(input);
    this.socket.send(body);
  }
  private reconnect = async () => {
    const maxTries = this.options.maxRetries;
    for (let i = 0; i < maxTries; i++) {
      try {
        if(this.isConnected()) return;

        console.log("reconnecting...");
        await this.connect();
      } catch(error) {
        console.log("unable to reconnect...", { error });
      }  
    }

    throw new Error("max retries reached.  Unable to reconnect.");
  }

  public disconnect: SocketService["disconnect"] = async () => {
    if(!this.socket) return;

    this.socket.onclose =event => {
      if(this.disconnectHandler) {
        this.disconnectHandler(event);
      }
    };
    this.socket.close();

    await this.awaitCriteria(() => !this.isConnected());
  }
  public onDisconnect: SocketService["onDisconnect"] = async handler => {
    this.disconnectHandler = handler;
  }
}
