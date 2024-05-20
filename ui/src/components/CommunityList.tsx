import React, { useState } from "react";
import {
  Segment,
  Header,
  Button,
  Divider,
  Icon,
  Table,
  TableRow,
  TableHeaderCell,
  TableHeader,
  TableCell,
  TableBody,
} from "semantic-ui-react";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";

type Props = {
  aliases: { username: string; alias: string; skillset: Skillset }[];
};

const CommunityList: React.FC<Props> = ({ aliases }) => {
  const [showCommunity, setShowCommunity] = useState(false);
  return (
    <Segment>
      <Header as="h2">
        <Icon name="users" />
        <Header.Content>Our Community</Header.Content>
        <Button primary onClick={() => setShowCommunity(!showCommunity)}>
          Show Community
        </Button>
      </Header>
      <Divider />
      {showCommunity && (
        <Table celled striped>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Member</TableHeaderCell>
              <TableHeaderCell>Skillset</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
          {aliases.map((alias) => (
            <TableRow key={alias.username}>
              <TableCell>{alias.alias}</TableCell>
              <TableCell>{alias.skillset}</TableCell>
            </TableRow>))}
          </TableBody>
          
        </Table>
      )}
    </Segment>
  );
};

export default CommunityList;
