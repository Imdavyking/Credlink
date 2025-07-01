# Indexer

This project specifically indexes the following:  
✅ **PointsAdded** - Tracking reward points for users.  
✅ **OwnershipTransfer** - Recording changes in contract ownership.  
✅ **OrocleUpdate** - Tracking updates to the system oracle.  
✅ **PointsRedeemed** - Logging when users redeem their reward points.  
✅ **ProposalCreated** - Logging when a token holder creates a proposal.  
✅ **ProposalExecuted** - Logging when a proposal is executed.  
✅ **ProposalCancelled** - Logging when a proposal is canceled.  
✅ **ProposalQueued** - Logging when a proposal is queued.

## **Getting Started**

### **1. Install SubQuery CLI**

First, install the SubQuery CLI globally using npm:

```sh
npm install -g @subql/cli
```

### **2. Clone the Project**

You can clone this GitHub repository:

```sh
git clone https://github.com/Imdavyking/econova/
cd econova/indexer
yarn
```

install dependencies with:

```sh
yarn install  # or npm install
```

### **3. Update .env**

Create a `.env` file in the project root and add the following variables:

```bash
  RPC_URL=
  CHAIN_ID=
  CONTRACT_ADDRESS=
  BLOCK_NUMBER=
  SUBQL_ACCESS_TOKEN=
  GOVERNOR_CONTRACT_ADDRESS=
```

### **4. Start the application locally**

```sh
yarn dev # or npm run dev
```

## **GraphQL Query Examples**

### **Query via cURL**

```sh
curl -X POST http://localhost:5100/graphql -H "Content-Type: application/json" --data '{"query":"{ pointsAddeds(first: 5, orderBy: BLOCK_HEIGHT_DESC) { nodes { id blockHeight user points contractAddress } } donations(first: 5, orderBy: BLOCK_HEIGHT_DESC) { nodes { id user token amount blockHeight contractAddress } } ownershipTransfers(first: 5, orderBy: BLOCK_HEIGHT_DESC) { nodes { id previousOwner newOwner blockHeight contractAddress } } }"}'
```

### **Query via GraphiQL / Postman**

1. Open **Postman** or **GraphiQL**.
2. Set the **GraphQL Endpoint**:
   ```
   http://localhost:5100/graphql
   ```
3. Use this query:
   ```graphql
   {
     pointsAddeds(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
       nodes {
         id
         blockHeight
         user
         points
         contractAddress
       }
     }
     donations(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
       nodes {
         id
         user
         token
         amount
         blockHeight
         contractAddress
       }
     }
     ownershipTransfers(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
       nodes {
         id
         previousOwner
         newOwner
         blockHeight
         contractAddress
       }
     }
     proposalCreateds(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
       nodes {
         contractAddress
         proposalId
         proposer
         state
         etaSecondsQueue
         targets
         voteEnd
         voteStart
         description
         id
         calldatas
         votesFor
         votesAgainst
         weightVotesFor
         weightVotesAgainst
         createdTimeStamp
         queuedTimeStamp
         executedTimeStamp
         canceledTimeStamp
       }
       totalCount
     }
   }
   ```
