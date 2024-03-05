import React, { useEffect, useState, useCallback } from "react";
import { campaignFactory } from "../../utils/icpCampaign";
import { Principal } from "@dfinity/principal";
import Form from "react-bootstrap/Form";
import Donation from "./Donation";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";

function Donations() {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [donations, setDonations] = useState([]);
  const [userDonations, setUserDonations] = useState([]);

  const getDonations = useCallback(async () => {
    try {
      setLoading(true);
      setDonations(await campaignFactory.getDonations());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  });

  const getUserDonations = useCallback(() => {
    let userDonations = [];

    for (let i = 0; i < donations.length; i++) {
      const donation = donations[i];
      const principal = window.auth.principalText;

      if (principal === Principal.fromText(donation.donor)) {
        userDonations.push(donation);
      } else {
        continue;
      }
    }

    setUserDonations(userDonations);
  });

  useEffect(() => {
    getDonations();
  }, []);

  useEffect(() => {
    getUserDonations();
  }, []);

  const donationsToUse = isChecked ? userDonations : donations;

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">
              Donations on the ICP Campaign Platform
            </h1>

            <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              label="Show my donations"
              checked={isChecked}
              onChange={() => {
                setIsChecked(!isChecked);
              }}
            />
          </div>

          <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
            <h2>
              {isChecked ? "Showing your donations" : "Showing all donations"}
            </h2>
            {donationsToUse.map((_donation) => (
              <Donation donation={{ ..._donation }} key={_campaign.id} />
            ))}
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Donations;
