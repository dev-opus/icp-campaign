# ICP Campaign Platform

This smart contract DApp is built on the **Internet Computer Platform** using TypeScript and the Azle framework.
The frontend is built using the React.js web UI library.

Authentication is managed by the **Internet Identity** canister, while transactions are managed by the **Ledger** canister. 


## How it works
Anyone can create and donate to campaigns. However, campaign creators cannot donate to their own campaigns. When campaigns are created, they have a `Maximum Time To Live` of seven (7) days, after which they are deactivated. Deactivated campaigns cannot be donated to. A Campaign has a **minimum donation** amount, but can accept donations above or equal to that amount, but not below it.

## How to run the DApp

- Start the Local Internet Computer network by running

```
	dfx start --background
```

- Deploy the Local Ledger Canister

```
	npm run deploy-ledger
```

- Deploy the local Internet Identity Cannister

```
	npm run deploy-identity
```

- Deploy the DApp (backend canister and frontend UI)

```
	npm run gen-deploy:local
```

After the deployments, visit the url in the terminal that looks like the one below

```
URLs:
  Frontend canister via browser
    dfinity_js_frontend: http://127.0.0.1:4943/?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai
		
```
