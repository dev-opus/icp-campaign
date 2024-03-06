import { transferICP } from "./ledger";

export const campaignFactory = {
  /**
   *
   * Get Campaigns
   *
   */

  async getCampaigns() {
    try {
      const result = await window.canister.icpCampaign.getCampaigns();
      return result;
    } catch (error) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  },

  /**
   *
   * Create a Campaign
   *
   */

  async createCampaign(campaignPayload) {
    const canister = window.canister.icpCampaign;
    const result = await canister.createCampaign(campaignPayload);

    if (result.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    return result.Ok;
  },

  /***
   *
   * Update a Campaign
   *
   */

  async updateCampaign(id, campaignPayload) {
    const canister = window.canister.icpCampaign;
    const result = await canister.updateCampaign(id, campaignPayload);

    if (result.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    return result.Ok;
  },

  /**
   *
   * Delete a Campaign
   *
   */

  async deleteCampaign(id) {
    const canister = window.canister.icpCampaign;
    const result = await canister.deleteCampaign(id);

    if (result.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    return result.Ok;
  },

  /**
   *
   * Get Donations
   *
   */

  async getDonations() {
    try {
      const result = await window.canister.icpCampaign.getDonations();
      return result;
    } catch (error) {
      console.log({error})
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  },

  /**
   *
   * Donate to a Campaign
   *
   */

  async donateToCampaign(campaignId, amount) {
    const canister = window.canister.icpCampaign;

    const canisterAddress = await canister.getCanisterAddress();
    const memoResult = await canister.createDonationMemo(campaignId);

    if (memoResult.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    const memo = memoResult.Ok;

    const block = await transferICP(canisterAddress, amount, memo);
    const result = await canister.donateToCampaign(campaignId, amount, block);

    if (result.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    return result.Ok;
  },

  /**
   *
   * Toggle Campaign Active Status
   *
   */

  async toggleCampaignActiveStatus(id) {
    const canister = window.canister.icpCampaign;
    const result = await canister.toggleCampaignActiveStatus(id);

    if (result.Err) {
      let error = Object.entries(result.Err);
      let errorMsg = `${error[0][0]} : ${error[0][1]}`;
      throw new Error(errorMsg);
    }

    return result.Ok;
  },

  /* formatters */

  formatDonation(amount) {
    return parseInt(amount, 10) * 10 ** 8;
  },

  formatDonationE8s(e8s) {
    return (BigInt(e8s) / BigInt(10 ** 8)).toString();
  },

  formatAddress(address) {
    if (!address) return;
    return (
      address.slice(0, 5) +
      "..." +
      address.slice(address.length - 5, address.length)
    );
  },

  formatDate(nanosecs) {
    if (nanosecs === 0) {
      return "--";
    }

    const milisecs = Number(nanosecs / BigInt(10 ** 6));
    let dateObj = new Date(milisecs);
    let date = dateObj.toLocaleDateString("en-us", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    let time = dateObj.toLocaleString("en-us", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return date + ", " + time;
  },
};
