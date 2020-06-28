import React, { useState, useEffect } from "react";
import {Col, Form, Button} from "react-bootstrap";
import shortid from "shortid";

import { SocketService, WebSocketService } from "../../utility/WebSocketService";
import { TransactionStatus, TransactionState, buildStatus } from "../../shared/TransactionStatus";
import { LoadingByState } from "../../components/Loading";
import { Notification, ToastContainer } from "../../components/Toast";

export const ChatPage: React.FC = () => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [socket, setSocket] = useState<SocketService>();
  const [message, setMessage] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
        setLoading(buildStatus(TransactionState.SUCCESS));
        
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
        setNotifications(ns => {
          const notification: Notification = {
            key: shortid.generate(),
            title: "Message Received",
            imageUrl: "/assets/default-avatar.png",
            message: event.message
          };
          return [...ns, notification];
        });
      });
      await webSocket.connect();
  
      console.log("...set socket on component");
      setSocket(webSocket);  
    };

    setLoading(buildStatus(TransactionState.PENDING));

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
  const onToastClose = (notification: Notification) => {
    setNotifications(ns => {
      const index = ns.findIndex(n => n.key === notification.key);
      if(index === -1) return ns;

      ns.splice(index, 1);
      return [...ns];
    });
  };

  return (
    <ToastContainer notifications={notifications} onClose={onToastClose}>
      <div className="container">
        <h2>Chat Page</h2>
        
        <LoadingByState status={loading}>
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
        </LoadingByState>
      </div>
    </ToastContainer>
  );
};
