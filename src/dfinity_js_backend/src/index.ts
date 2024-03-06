import {
  query,
  update,
  text,
  Record,
  StableBTreeMap,
  Variant,
  Vec,
  Ok,
  Err,
  ic,
  Principal,
  nat64,
  Duration,
  Result,
  bool,
  Canister,
} from "azle";
import {
  Ledger,
  binaryAddressFromPrincipal,
  hexAddressFromPrincipal,
} from "azle/canisters/ledger";

/* @ts-ignore */
import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";

/**
 *
 * Records and Variants
 *
 */

const Campaign = Record({
  id: text,
  title: text,
  desc: text,
  imageUrl: text,
  isActive: bool,
  creator: Principal,
  createdAt: nat64,
  minDonation: nat64,
  numOfDonations: nat64,
});

const CampaignPayload = Record({
  title: text,
  desc: text,
  imageUrl: text,
  minDonation: nat64,
});

const Donation = Record({
  id: text,
  campaign: text,
  campaignId: text,
  donor: Principal,
  amount: nat64,
  createdAt: nat64,
});

const DonationPayload = Record({
  campaignId: text,
  amount: nat64,
  block: nat64,
});

const Message = Variant({
  NotFound: text,
  InvalidPayload: text,
  DonationFailed: text,
  DonationCompleted: text,
});

/**
 *
 * Storage and Constants
 *
 */

const campaignStorage = StableBTreeMap(0, text, Campaign);
const donationStorage = StableBTreeMap(0, text, Donation);

const CAMPAIGN_TTL = 604800n;

/**
 *
 * ICP Canister Initialization
 *
 */

const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

/**
 *
 * Canister Functions
 *
 */

export default Canister({
  /**
   *
   * Get all Campaigns
   *
   */

  getCampaigns: query([], Vec(Campaign), () => campaignStorage.values()),

  /**
   *
   * Get a single Campaign
   *
   */

  getCampaign: query([text], Result(Campaign, Message), (id) => {
    const campaignOpt = campaignStorage.get(id);

    if ("None" in campaignOpt) {
      return Err({ NotFound: `Campaign with id=${id} not found` });
    }
    return Ok(campaignOpt.Some);
  }),

  /**
   *
   * Create a Campaign
   *
   */

  createCampaign: update(
    [CampaignPayload],
    Result(Campaign, Message),
    (payload) => {
      if (!(typeof payload === "object" || Object.keys(payload).length === 4)) {
        return Err({ InvalidPayload: "Invalid Payload Object" });
      }

      const campaign = {
        ...payload,
        id: uuidv4(),
        isActive: true,
        creator: ic.caller(),
        createdAt: ic.time(),
        numOfDonations: 0n,
      };

      campaignStorage.insert(campaign.id, campaign);
      // mark campaign as inactive as the TTL elaspses
      deactivateByTimeout(campaign.id, CAMPAIGN_TTL);
      return Ok(campaign);
    }
  ),

  /**
   *
   * Update Campaign
   *
   */

  updateCampaign: update(
    [text, CampaignPayload],
    Result(Campaign, Message),
    (id, payload) => {
      if (!(typeof payload === "object" || Object.keys(payload).length === 0)) {
        return Err({ InvalidPayload: "Invalid Payload Object" });
      }

      const campaignOpt = campaignStorage.get(id);

      if ("None" in campaignOpt) {
        return Err({ NotFound: `Campaign with id=${id} not found` });
      }

      const updatedCampaign = { ...campaignOpt.Some, ...payload };
      campaignStorage.insert(id, updatedCampaign);
      return Ok(updatedCampaign);
    }
  ),

  /**
   *
   * Delete Campaign
   *
   */

  deleteCampaign: update([text], Result(text, Message), (id) => {
    const campaignOpt = campaignStorage.get(id);

    if ("None" in campaignOpt) {
      return Err({ NotFound: `Campaign with id=${id} not found` });
    }

    campaignStorage.remove(id);
    return Ok("Deleted campaign with id=" + campaignOpt.Some.id);
  }),

  /**
   *
   * Toggle campaign active status
   *
   */

  toggleCampaignActiveStatus: update([text], Result(text, Message), (id) => {
    const campaignOpt = campaignStorage.get(id);

    if ("None" in campaignOpt) {
      return Err({ NotFound: `Campaign with id=${id} not found` });
    }

    const updatedCampaign = {
      ...campaignOpt.Some,
      isActive: !campaignOpt.Some.isActive,
    };
    campaignStorage.insert(id, updatedCampaign);

    const word = updatedCampaign.isActive ? "activated" : "deactivated";

    return Ok(
      `Campaign with title "${campaignOpt.Some.title}" is now ${word}`
    );
  }),

  /**
   *
   * Get Donations
   *
   */

  getDonations: query([], Vec(Donation), () => donationStorage.values()),

  /**
   *
   * Get a Donation
   *
   */

  getDonation: query([text], Result(Donation, Message), (id) => {
    const donationOpt = campaignStorage.get(id);

    if ("None" in donationOpt) {
      return Err({ NotFound: `Donation with id=${id} not found` });
    }

    return Ok(donationOpt.Some);
  }),

  /**
   *
   * Create a memo for Donation
   *
   */

  createDonationMemo: update([text], Result(nat64, Message), (campaignId) => {
    if (typeof campaignId !== "string") {
      return Err({ InvalidPayload: "Invalid payload" });
    }
    const memo = hash(campaignId);
    return Ok(memo);
  }),

  /**
   *
   * Make a Donation
   *
   */

  donateToCampaign: update(
    [DonationPayload],
    Result(Donation, Message),
    async (payload) => {
      const campaignOpt = campaignStorage.get(payload.campaignId);

      if ("None" in campaignOpt) {
        return Err({
          NotFound: `Campaign with id=${payload.campaignId} not found`,
        });
      }

      if (campaignOpt.Some.minDonation > payload.amount) {
        return Err({
          DonationFailed:
            "Amount is less than the minimum amount accepted for this campaign",
        });
      }

      const paymentVerified = await verifyPaymentInternal(
        ic.caller(),
        payload.amount,
        payload.block,
        payload.campaignId
      );

      if (!paymentVerified) {
        return Err({
          DonationFailed: "Payment was not verified",
        });
      }

      const donation = {
        ...payload,
        id: uuidv4(),
        donor: ic.caller(),
        createdAt: ic.time(),
        campaign: campaignOpt.Some.title,
      };
      return Ok(donation);
    }
  ),

  getAddressFromPrincipal: query([Principal], text, (principal) => {
    return hexAddressFromPrincipal(principal, 0);
  }),
});

/**
 *
 * Helper Functions
 *
 */

// used to change a campaign by timeout
function deactivateByTimeout(id: text, delay: Duration) {
  ic.setTimer(delay, () => {
    const campaign = campaignStorage.get(id);
    const updatedCampaign = { ...campaign, isActive: false };

    campaignStorage.insert(id, updatedCampaign);
    console.log(`Campaign with id=${id} is no longer active!`);
  });
}

/* used to verify icp transfers */
async function verifyPaymentInternal(
  sender: Principal,
  amount: nat64,
  block: nat64,
  campaignId: text
): Promise<bool> {
  const blockData = await ic.call(icpCanister.query_blocks, {
    args: [{ start: block, length: 1n }],
  });

  const memo = hash(campaignId);

  const tx = blockData.blocks.find((block) => {
    if ("None" in block.transaction.operation) {
      return false;
    }
    const operation = block.transaction.operation.Some;

    const senderAddress = binaryAddressFromPrincipal(sender, 0);
    const receiverAddress = binaryAddressFromPrincipal(ic.id(), 0);

    return (
      block.transaction.memo === memo &&
      hash(senderAddress) === hash(operation.Transfer?.from) &&
      hash(receiverAddress) === hash(operation.Transfer?.to) &&
      amount === operation.Transfer?.amount.e8s
    );
  });
  return tx ? true : false;
}

/*
    a hash function that is used to generate correlation ids for orders.
*/
function hash(input: any): nat64 {
  return BigInt(Math.abs(hashCode().value(input)));
}
