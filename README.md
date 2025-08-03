# **CredLink: Interest-Free P2P Lending Protocol**

## Overview

CredLink is a decentralized lending protocol built on the **Etherlink** blockchain, offering **interest-free loans** backed by collateral. Inspired by the Liquity protocol, CredLink provides a stable and decentralized way for users to borrow funds without interest, using a **collateralized debt position (CDP)** model.

## Problem Statement

Traditional lending platforms impose high interest rates, creating significant financial burdens for borrowers. CredLink addresses this by enabling interest-free loans secured with collateral, maintaining protocol stability and user security.

## How It Works

Users lock collateral to borrow stablecoins without interest. The protocol ensures solvency by requiring the collateral to exceed the loan value by a minimum collateral ratio (e.g., 150%). If the collateral value falls below this ratio, it may be liquidated to repay the loan.

### Core Features

- **Interest-Free Loans**: Borrow stablecoins without paying interest.
- **Collateralized Debt Positions (CDPs)**: Loans are backed by locked collateral.
- **Liquidation Mechanism**: Collateral is liquidated if the collateral ratio is breached.
- **Stability Pool**: Maintains protocol health by absorbing liquidated collateral.

## How to Use

### Borrowers

1. Lock collateral (e.g., XTZ or other tokens).
2. Request a loan amount in stablecoins.
3. Maintain your collateral ratio to avoid liquidation.
4. Repay the loan to unlock your collateral.

### Lenders

1. Provide liquidity by depositing tokens into the protocol.
2. Support the stability pool to absorb liquidation risk.
3. Earn rewards from liquidation fees and protocol incentives.

## Tech Stack & Limitations

- **Thirdweb**: Used for wallet connection and contract interaction, streamlining the dApp experience on Etherlink.
- **Goldsky**: Implemented for indexing contract data and events off-chain, enabling efficient querying.
- **Redstone Oracle**: Planned for real-time price feeds. However, due to a version mismatch (Redstone uses ethers v5, Thirdweb uses ethers v6), integration was not possible in this release. This is a key area for future upgrades.

## Future Improvements

- Implement decentralized governance for protocol parameters.
- Add support for multiple collateral types and dynamic collateral ratios.
- Develop a collateral-backed token to enhance protocol stability.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the **Liquity Protocol**’s interest-free lending model.
- Built using **Solidity** for smart contracts and **Thirdweb** for front-end wallet integration.
