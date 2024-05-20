import React from "react";
import { Segment, Header, Divider, Grid } from "semantic-ui-react";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";

type Props = {
  aliases: { username: string; alias: string; skillset: Skillset }[];
};

const CommunityList: React.FC<Props> = ({ aliases }) => {
  return (
    <Segment>
      <Header as="h2">
        <Header.Content>Our Community</Header.Content>
      </Header>
      <Divider />
      <Grid columns={2} stackable>
        <Grid.Column>
          <Header as="h3">Member</Header>
          {aliases.map((alias) => (
            <p
              key={alias.username}
              style={{ minWidth: 0, width: "auto" }}
            >
              <p>{alias.alias}</p>
            </p>
          ))}
        </Grid.Column>
        <Grid.Column>
          <Header as="h3">Skillset</Header>
          {aliases.map((alias) => (
            <p
              key={alias.username}
              style={{ minWidth: 0, width: "auto" }}
            >
              <p>{alias.skillset}</p>
            </p>
          ))}
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

export default CommunityList;
