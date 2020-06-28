import React from "react";
import {Toast} from "react-bootstrap";

export interface Notification {
  key: string,
  title: string,
  message: string, 
  imageUrl?: string
}

interface ToastContainerProps {
  notifications: Notification[],
  onClose: (notification: Notification) => void,
  autoHide?: boolean,
  delay?: number

}

const ToastContainer: React.FC<ToastContainerProps> = ({children, ...rest}) => {
  return (
    <div className="toast-outer-container">
      {children}
      <ToastInnerContainer {...rest} />
    </div>
  );
};

const ToastInnerContainer: React.FC<ToastContainerProps> = ({notifications, onClose, autoHide=true, delay=8000}) => {
  return (
    <div className="toast-container">
        {notifications.map(n => (
          <ToastDisplay key={n.key} notification={n} onClose={onClose} autoHide={autoHide} delay={delay} />
        ))}
    </div>
  );
};

interface ToastProps {
  notification: Notification,
  onClose: (notification: Notification) => void,
  autoHide?: boolean,
  delay?: number
}

const ToastDisplay: React.FC<ToastProps> = ({ notification, onClose, autoHide, delay }) => {
  const handleClose = () => {
    onClose(notification);
  };

  const { title, message, imageUrl} = notification;
  return (
    <Toast autohide={autoHide} delay={delay} onClose={handleClose}>
      <Toast.Header>
        {!!imageUrl && (
          <img src={imageUrl} className="rounded mr-2 toast-image" alt="" />
        )}
        <strong className="mr-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

export {
  ToastContainer
};
