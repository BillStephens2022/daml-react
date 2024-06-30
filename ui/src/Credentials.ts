import { User } from "@daml/ledger";

// This is used to find the public party.
// On Daml hub, we use @daml/hub-react for this.
// Locally we infer it from the token.
export type PublicParty = {
  usePublicParty: () => string | undefined;
  setup: () => void;
};

export type Credentials = {
  party: string;
  token: string;
  user: User;
  //skillset: string;
  getPublicParty: () => PublicParty;
};

export default Credentials;
