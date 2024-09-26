import { Skillset } from "@daml.js/daml-react/lib/Common/module";

interface User {
  payload: {
    username: string;
    alias: string;
    skillset: Skillset;
  };
}

export const filterWorkersByJobCategory = (users: User[], jobCategory: Skillset) => {
  return users
    .filter((user) => user.payload.skillset === jobCategory)
    .map((user) => ({
      key: user.payload.username,
      value: user.payload.alias,
      text: user.payload.alias,
    }));
};
