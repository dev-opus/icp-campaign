import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { campaignFactory } from "../../utils/icpCampaign";

const AddCampaign = ({ save }) => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [minDonation, setMinDonation] = useState(0);
  const isFormFilled = () => title && imageUrl && desc && minDonation;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Product</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Campaign Title"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter title of Campaign"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Image URL"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Image URL"
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel controlId="inputdesc" label="desc" className="mb-3">
              <Form.Control
                as="textarea"
                placeholder="Description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputminDonation"
              label="minDonation"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Minimum Donation"
                onChange={(e) => {
                  setMinDonation(
                    e.target.value
                  );
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                title,
                imageUrl,
                desc,
                minDonation,
              });
              handleClose();
            }}
          >
            Add Campaign
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddCampaign.propTypes = {
  save: PropTypes.func.isRequired,
};

export default AddCampaign;
