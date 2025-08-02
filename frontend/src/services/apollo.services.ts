import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GOLDSKY_ENDPOINT } from "../utils/constants";

const client = new ApolloClient({
  uri: GOLDSKY_ENDPOINT,
  cache: new InMemoryCache(),
});

export default client;
