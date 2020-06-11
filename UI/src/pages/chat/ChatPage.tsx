import React, { useState, useEffect } from "react";
import {Col, Form, Button} from "react-bootstrap";

import { SocketService, WebSocketService } from "../../utility/WebSocketService";

export const ChatPage: React.FC = () => {
  const [socket, setSocket] = useState<SocketService>();
  const [message, setMessage] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);

  // Run onMount
  useEffect(() => {
    console.log("onMount...");

    const setup = async () => {
      console.log("starting setup...");
      const endpoint = "wss://ajvhew3zqf.execute-api.us-west-2.amazonaws.com/Prod/?channel=test_channel";
      const webSocket = new WebSocketService(endpoint);
  
      await webSocket.onConnect(async () => {
        console.log("onConnect...");
        setLogs(l => [...l, "connected!"]);
        
        const input = {
          action: "sendmessage",
          channel: "test_channel",
          data: "Here's some text that the server is urgently awaiting!"
        };
        webSocket.send(input); 
      });
      await webSocket.subscribe("sendmessage", event => {
        console.log("on sendmessage...");
        setLogs(l => [...l, event.message]);
      });
      await webSocket.connect();
  
      console.log("...set socket on component");
      setSocket(webSocket);  
    };

    console.log("trigger setup");
    setup();
  }, []);

  // Run onUnmount
  useEffect( () => () => {
    console.log("unmount");

    setSocket(s => {
      s?.disconnect();
      return undefined;
    });
  }, [] );

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!socket) throw new Error("not connected!");

    const input = {
      action: "sendmessage",
      channel: "test_channel",
      data: message
    };
    socket.send(input);
  };
  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value;
    setMessage(value);
  };

  return (
    <div className="container">
      <h2>Chat Page</h2>
      
      <Form onSubmit={onFormSubmit}>
        <Form.Row className="align-items-center">
          <Col>
            <Form.Label htmlFor="inlineFormInput" srOnly>
              Name
            </Form.Label>
            <Form.Control
              className="mb-2"
              id="inlineFormInput"
              placeholder="Message"
              value={message}
              onChange={onMessageChange}
            />
          </Col>
          <Col xs="auto">
            <Button type="submit" className="mb-2">
              Submit
            </Button>
          </Col>
        </Form.Row>
      </Form>
      <textarea className="form-control" rows={20} disabled value={logs.join(String.fromCharCode(13, 10))} />
    </div>
  );
};
