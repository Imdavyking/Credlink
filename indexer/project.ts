import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

import * as dotenv from "dotenv";
import { cleanDB } from "./src/utils/clean";

cleanDB();

dotenv.config();

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "creator-testnet-starter",
  description:
    "This project can be use as a starting point for developing your new Creator Testnet SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Creator Testnet this is 66665
     * https://chainlist.org/chain/66665
     */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: process.env.RPC_URL!?.split(",") as string[] | string,
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: +process.env.BLOCK_NUMBER!,
      options: {
        abi: "Abi",
        address: process.env.CONTRACT_ADDRESS!,
      },
      assets: new Map([["Abi", { file: "./abis/abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleDonatedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["Donated(address,address,uint256,uint8)"],
            },
          },
          {
            handler: "handleOwnershipTransferredAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["OwnershipTransferred(address,address)"],
            },
          },
          {
            handler: "handlePointsAddedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["PointsAdded(address,uint256)"],
            },
          },
          {
            handler: "handlePointsRedeemedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["PointsRedeemed(address,uint256)"],
            },
          },
          {
            handler: "handleSetOracleAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["SetOracle(address,address)"],
            },
          },
          {
            handler: "handleCharityAddedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["CharityAdded(uint8,address)"],
            },
          },
        ],
      },
    },
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: +process.env.BLOCK_NUMBER!,
      options: {
        abi: "Abi",
        address: process.env.GOVERNOR_CONTRACT_ADDRESS!,
      },
      assets: new Map([["Abi", { file: "./abis/governor.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleProposalCanceledAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["ProposalCanceled(uint256)"],
            },
          },
          {
            handler: "handleProposalCreatedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: [
                "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)",
              ],
            },
          },
          {
            handler: "handleProposalExecutedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["ProposalExecuted(uint256)"],
            },
          },
          {
            handler: "handleProposalQueuedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["ProposalQueued(uint256,uint256)"],
            },
          },
          {
            handler: "handleProposalThresholdSetAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["ProposalThresholdSet(uint256,uint256)"],
            },
          },
          {
            handler: "handleVoteCastAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["VoteCast(address,uint256,uint8,uint256,string)"],
            },
          },
          {
            handler: "handleVoteCastWithParamsAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: [
                "VoteCastWithParams(address,uint256,uint8,uint256,string,bytes)",
              ],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/Imdavyking/econova",
};

// Must set default to the project instance
export default project;
