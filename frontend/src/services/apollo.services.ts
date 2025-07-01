import { ApolloClient, InMemoryCache } from "@apollo/client";
import { SUBQUERY_ENDPOINT } from "../utils/constants";

const client = new ApolloClient({
  uri: SUBQUERY_ENDPOINT,
  cache: new InMemoryCache(),
});

export default client;
