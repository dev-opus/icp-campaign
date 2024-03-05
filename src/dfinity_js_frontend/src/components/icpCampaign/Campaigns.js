import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddCampaign from "./AddCampaign";
import Campaign from "./Campaign";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import { campaignFactory } from "../../utils/icpCampaign";

const Campaigns = () => {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const getCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setCampaigns(await campaignFactory.getCampaigns());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  });

  const addCampaign = async (data) => {
    try {
      setLoading(true);
      const donation = campaignFactory.formatDonation(data.minDonation);

      data.minDonation = donation;
      campaignFactory.createCampaign(data).then((res) => {
        getCampaigns();
      });
      toast(<NotificationSuccess text="Campaign added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a campaign." />);
    } finally {
      setLoading(false);
    }
  };

  const donate = async (id, amount) => {
    try {
      setLoading(true);
      campaignFactory.donateToCampaign(id, amount).then(() => {
        getCampaigns();
        toast(<NotificationSuccess text="Donation successfully made" />);
      });
    } catch (error) {
      console.error({ error });
      toast(<NotificationError text="Failed to donate to this campaign." />);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id) => {
    try {
      setLoading(true);
      campaignFactory.deleteCampaign(id).then((res) => {
        toast(<NotificationSuccess text={res} />);
        getCampaigns();
      });
    } catch (error) {
      console.error({ error });
      console.log(error);
      toast(<NotificationError text="Failed to delete camapaign." />);
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (id, data) => {
    try {
      setLoading(true);
      campaignFactory.updateCampaign(id, data).then((res) => {
        toast(<NotificationSuccess text={res} />);
        getCampaigns();
      });
    } catch (error) {
      console.error({ error });
      toast(<NotificationError text={error.message} />);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (id) => {
    try {
      setLoading(true);
      campaignFactory.toggleCampaignActiveStatus(id).then((res) => {
        toast(<NotificationSuccess text={res} />);
        getCampaigns();
      });
    } catch (error) {
      console.error({ error });
      toast(<NotificationError text={error.message} />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  console.log(campaigns);

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">ICP Campaign Platform</h1>
            <AddCampaign save={addCampaign} />
          </div>

          <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
            {campaigns.map((_campaign) => (
              <Campaign
                campaign={{ ..._campaign }}
                donate={donate}
                updateCampaign={updateCampaign}
                deleteCampaign={deleteCampaign}
                toggleCampaign={toggleCampaign}
                key={_campaign.id}
              />
            ))}
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Campaigns;
