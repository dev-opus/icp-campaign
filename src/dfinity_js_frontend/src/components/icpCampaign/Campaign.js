import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Principal } from "@dfinity/principal";
import { campaignFactory } from "../../utils/icpCampaign";

const Campaign = ({ campaign, donate, deleteCampaign, toggleCampaign }) => {
  const {
    id,
    minDonation,
    title,
    desc,
    imageUrl,
    creator,
    numOfDonations,
    isActive,
  } = campaign;



  const [donation, setDonation] = useState(
    campaignFactory.formatDonationE8s(minDonation)
  );

  const isOwner =
    Principal.from(creator).toString() === window.auth.principalText;

  const disableButton = isOwner || !isActive;

  const triggerDonate = () => {
    const min = campaignFactory.formatDonationE8s(minDonation)

    if (donation < min) {
      alert('cannot donate an amount lesser than the minimu donation allowed!')
      return
    }
    donate(id, donation);
  };

  function handleDonation(e) {
    setDonation(e.target.value);
  }

  return (
    <>
      <Col key={id}>
        <Card className=" h-100">
          <Card.Header>
            <Stack direction="horizontal" gap={2}>
              <Badge bg="secondary" className="ms-auto">
                {numOfDonations.toString()} donation(s) have been made to this Campaign
              </Badge>
            </Stack>
          </Card.Header>

          <div className=" ratio ratio-4x3">
            <img src={imageUrl} alt={title} style={{ objectFit: "cover" }} />
          </div>

          <Card.Body className="d-flex  flex-column text-center">
            <Card.Title>{title}</Card.Title>

            <Card.Text className="flex-grow-1 ">{desc}</Card.Text>

            <Card.Text className="text-secondary">
              {campaignFactory.formatAddress(Principal.from(creator).toText())}
            </Card.Text>

            <Form.Group className="mb-3">
              <Form.Label>Increase donation amount (Optional)</Form.Label>
              <Form.Control
                type="number"
                value={Number(donation)}
                onChange={handleDonation}
              />
            </Form.Group>

            <Button
              variant="outline-dark"
              onClick={triggerDonate}
              disabled={disableButton}
              className="w-100 py-3"
            >
              Make a donation of {donation} ICP
            </Button>

            {isOwner &&

              <Stack direction="horizontal">

                <Button
                  variant="outline-dark"
                  onClick={() => deleteCampaign(id)}
                  disabled={!isOwner}
                  className="w-100 py-3 mr-3"
                >
                  Delete Campaign
                </Button>

                <Button
                  variant="outline-dark"
                  onClick={() => toggleCampaign(id)}
                  disabled={!isOwner}
                  className="w-100 py-3"
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </Button>

              </Stack>
            }
          </Card.Body>
        </Card>
      </Col>
    </>
  );
};

Campaign.propTypes = {
  campaign: PropTypes.instanceOf(Object).isRequired,
  donate: PropTypes.func.isRequired,
  deleteCampaign: PropTypes.func.isRequired,
  updateCampaign: PropTypes.func.isRequired,
};

export default Campaign;
