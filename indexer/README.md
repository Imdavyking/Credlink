# 🚀 Credlink Subgraph (Etherlink)

This subgraph indexes the `Credlink` smart contract deployed on **Etherlink Testnet**, capturing real-time lending data such as available liquidity per lender and token via the `LenderLiquidityUpdated` event.

> 🛠 **This subgraph is powered by [Goldsky](https://goldsky.com), a fast and reliable Web3 data indexing platform.**

---

## 📦 Setup & Deployment

> First-time setup:

```bash
yarn install
```

---

## 🛠 Deployment (Using Goldsky)

### Step 1: Log in to Goldsky

```bash
goldsky login
```

Make sure you are authenticated before continuing.

---

### Step 2: Prepare the Subgraph Configuration

```bash
yarn prepare:etherlink
```

This uses `mustache` to substitute values from `config/etherlink.json` into `subgraph.template.yaml`, creating a `subgraph.yaml`.

---

### Step 3: Generate Code

```bash
yarn codegen
```

---

### Step 4: Build the Subgraph

```bash
yarn build
```

---

### Step 5: Deploy to Goldsky

```bash
yarn goldsky:deploy:etherlink
```

---

## 📄 Example Scripts in `package.json`

```json
"scripts": {
  "codegen": "graph codegen",
  "build": "graph build",
  "prepare:etherlink": "mustache config/etherlink.json subgraph.template.yaml > subgraph.yaml",
  "goldsky:deploy:etherlink": "goldsky subgraph deploy credlink/1.0.0 --path ."
}
```

---

## 🌐 Live Subgraph (Goldsky)

After deploying, your subgraph will be available at:

```
https://api.goldsky.com/api/public/project_<your_project_id>/subgraphs/credlink/1.0.0/gn
```

> Replace `<your_project_id>` with your actual Goldsky project ID.

---

## ✅ Notes

- This subgraph indexes the `LenderLiquidityUpdated` event from Credlink to track active liquidity positions.
- It enables frontend apps to query real-time lending pool availability.
- 📡 **Goldsky** provides reliable, performant indexing — ideal for fast and scalable dApps.

---
