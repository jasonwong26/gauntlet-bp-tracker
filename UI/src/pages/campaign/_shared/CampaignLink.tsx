import React, { useState } from "react";
import { Alert, Button, Row, Col } from "react-bootstrap";
import CopyToClipboard from "react-copy-to-clipboard";

import { Campaign } from "../../../types";

interface CampaignLinkProps {
  campaign: Campaign
}

export const CampaignLink: React.FC<CampaignLinkProps> = ({ campaign }) => {
  const [isCopied, setIsCopied] = useState(false);

  const campaignId = campaign.id;
  const displayLink = !!campaignId;

  if(!displayLink) return null;

  const origin = window.location.origin;
  const link = `${origin}/campaign/${campaignId}/join`;
  const buttonText = !isCopied ? "Copy" : "Copied";

  const onCopy = () => {
    setIsCopied(true);
  };
  const onBlur = () => {
    setIsCopied(false);
  };

  return (
    <Alert variant="primary" className="mb-0">
      <h4>Join Campaign Link</h4>
      <Row>
        <Col>
          <a href={link}>{link}</a>
          <CopyToClipboard text={link} onCopy={onCopy} >
            <Button size="sm" className="ml-3" onBlur={onBlur}>{buttonText}</Button>
          </CopyToClipboard> 
        </Col>
      </Row>
    </Alert>
  );
};