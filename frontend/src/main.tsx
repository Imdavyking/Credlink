import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apollo.services.ts";
import { ThirdwebProvider } from "thirdweb/react";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThirdwebProvider>
    </ApolloProvider>
  </StrictMode>
);
