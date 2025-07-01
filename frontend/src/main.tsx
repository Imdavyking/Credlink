import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { flareTestnet, sepolia } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { WALLET_CONNECT_PROJECT_ID } from "./utils/constants.ts";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apollo.services.ts";

const config = getDefaultConfig({
  appName: "Umix",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [flareTestnet, sepolia],
});
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={lightTheme()}>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  </StrictMode>
);
