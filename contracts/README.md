# Contracts

## **Requirements**

Ensure you have the following installed before starting:

-   **[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)**
    -   Verify installation:
        ```bash
        git --version
        ```
        Expected output: `git version x.x.x`
-   **[Node.js](https://nodejs.org/en/)**
    -   Verify installation:
        ```bash
        node --version
        ```
        Expected output: `vx.x.x`
-   **[Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)** (instead of `npm`)
    -   Verify installation:
        ```bash
        yarn --version
        ```
        Expected output: `x.x.x`
    -   If Yarn is not installed, install it with:
        ```bash
        npm install --global yarn
        ```

---

## **Quickstart**

Clone the repository and install dependencies:

```bash
git clone https://github.com/Imdavyking/econova/
cd econova/contracts
yarn
```

---

## **Environment Variables Setup**

Create a `.env` file in the project root and configure the following variables:

```bash
KEYSTORE_FILE=./keystore.json
RPC_URL=
ORACLE_ADDRESS=
NODE_ENV=
CHAIN_ID=
API_URL=
BROWSER_URL=
CHAIN_NAME=
CHAIN_CURRENCY_NAME=
CHAIN_SYMBOL=
CHAIN_BLOCKEXPLORER_URL=
API_SCAN_VERIFIER_KEY=
CROSS_CHAIN_ID=
CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY=
DEPLOY_CROSS_CHAIN_OFT="true"
```

---

## **Keystore Setup**

To create a keystore file and encrypt your private key:

```bash
yarn keystore:create <PRIVATE_KEY> <PASSWORD>
```

Then, export the keystore password before running commands:

```bash
export KEYSTORE_PASSWORD="<PASSWORD>"
```

---

## **Usage**

### **Deploy Contracts**

```bash
yarn deploy
```

### **Run Tests**

```bash
yarn test
```

---

## **Deployment to Mainnet**

### **1. Setup Environment Variables**

-   **Keystore Password**: Instead of storing `KEYSTORE_PASSWORD` in `.env`, export it before running any commands:

    ```bash
    export KEYSTORE_PASSWORD="your-secure-password"
    ```

---

### **3. Deploy Contracts**

```bash
yarn deploy
```

---

## **Need Help?**

For questions or support, open an issue on [GitHub](https://github.com/Imdavyking/econova/issues).

---
