import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack } from "react-bootstrap";
import { campaignFactory } from "../../utils/icpCampaign";

function Donation({ donation }) {
  const { campaign, donor, amount, createdAt } = donation;
  return (
    <>
      <Col key={id}>
        <Card className=" h-100">
          <Card.Header>
            <Stack direction="horizontal" gap={2}>
              <Badge bg="secondary" className="ms-auto">
                Donation for {campaign}
              </Badge>
            </Stack>
          </Card.Header>

          <Card.Body className="d-flex  flex-column text-center">
            <Card.Text className="flex-grow-1 ">
              Donor:{" "}
              {campaignFactory.formatAddress(Principal.from(donor).toText())}
            </Card.Text>

            <Card.Text>
              Amount donated: {campaignFactory.formatDonationE8s(amount)} ICP
            </Card.Text>

            <Card.Text>
              Donated on {"{"}
              {campaignFactory.formatDate(createdAt)}
              {"}"} ICP
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}

Donation.propTypes = {
  donation: PropTypes.instanceOf(Object).isRequired,
};

export default Donation;
