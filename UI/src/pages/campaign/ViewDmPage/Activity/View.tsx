import React from "react";
import { Alert, Row, Col, ListGroup } from "react-bootstrap";

import { TransactionStatus } from "../../../../shared/TransactionStatus";
import { ButtonByState } from "../../../../components/Button";
import { CampaignStorageService } from "../../CampaignStorageService";
import { PurchaseAlert } from "../../_types";

import { Container } from "./_Container";

interface Props {
  service: CampaignStorageService
}

export const View: React.FC<Props> = ({ service }) => (
  <Container service={service}>
    {(notifications, refreshing, fetching, lastPageSize, onRefresh, onFetch) => (
      <ViewActivity notifications={notifications} refreshing={refreshing} fetching={fetching} lastPageSize={lastPageSize} onRefresh={onRefresh} onFetch={onFetch} />
    )}
  </Container>
);

interface ActivityProps {
  notifications: PurchaseAlert[],
  refreshing: TransactionStatus, 
  fetching: TransactionStatus,
  lastPageSize: number,
  onRefresh?: (pageSize: number) => void,
  onFetch?: (pageSize: number) => void 
}
const ViewActivity: React.FC<ActivityProps> = ({ notifications, refreshing, fetching, lastPageSize, onRefresh, onFetch }) => {

  const triggerRefresh = () => { 
    if(!onRefresh) return;
    onRefresh(notifications.length); 
  };
  const triggerFetch = () => { 
    if(!onFetch) return;
    onFetch(25); 
  };
  const canFetchMore = lastPageSize > 0;

  if(!notifications.length) {
    return (
      <Alert variant="warning">No notifications found...</Alert>
    );
  }

  return (
    <>
      <ActivityControls fetching={refreshing} triggerRefresh={triggerRefresh} />
      <ListGroup id="campaign-activity" variant="flush">
        <ActivityHeader />
        {notifications.map(n => {
          return (
            <PurchaseAlertItem key={`${n.action}-${n.alertDate}-${n.item.id}`} item={n} />
          );
        })}
      </ListGroup>        
      <ButtonByState variant="dark" block disabled={!canFetchMore} status={fetching} onClick={triggerFetch}>Fetch More</ButtonByState>
    </>
  );
};

interface ActivityControlsProps {
  fetching: TransactionStatus,
  triggerRefresh: () => void
}

const ActivityControls: React.FC<ActivityControlsProps> = ({ fetching, triggerRefresh }) => (
  <Row>
    <Col className="text-right mb-2">
    <ButtonByState variant="info" className="text-left" status={fetching} icon="refresh" onClick={triggerRefresh}>Refresh</ButtonByState>
    </Col>
  </Row>
);

const ActivityHeader: React.FC = () => (
  <ListGroup.Item>
    <Row>
      <Col>
        <strong>Character</strong>
      </Col>
      <Col>
        <strong>Action</strong>
      </Col>
      <Col className="text-right">
        <strong>Points</strong>
      </Col>
    </Row>
  </ListGroup.Item>
);

interface PurchaseAlertItemProps {
  item: PurchaseAlert
}

const PurchaseAlertItem: React.FC<PurchaseAlertItemProps> = ({ item }) => {
  const alertDate = new Date(item.alertDate);
  const actionDate = `${alertDate.toLocaleDateString()} ${alertDate.toLocaleTimeString()}`;

  const defaultAvatarUrl = "/assets/default-avatar.png";
  const imageUrl = item.character.avatarUrl || defaultAvatarUrl;

  const characterName = item.character.name;

  const action = item.action === "additemalert" ? "added" : "removed";
  const itemDescription = item.item.description;
  const description = `${action} ${itemDescription}`
  const symbol = item.action === "additemalert" ? "+" : "-";
  const amount = item.item.points * (item.item.points < 0 ? -1 : 1);

  return (
    <ListGroup.Item>
      <Row>
        <Col>
          {!!imageUrl && (
            <img src={imageUrl} className="rounded mr-2 character-image" alt="" />
          )}
          <strong className="mr-auto">{characterName}</strong>
        </Col>
        <Col>
          {description}<br/>
          {actionDate}
        </Col>
        <Col className="text-right">
          {symbol} {amount}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
