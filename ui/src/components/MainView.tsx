// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useMemo } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider, Button, Modal } from 'semantic-ui-react';
import { Party } from '@daml/types';
import { User } from '@daml.js/daml-react';
import { Work } from '@daml.js/daml-react';
import { publicContext, userContext } from './App';
import UserList from './UserList';
import PartyListEdit from './PartyListEdit';
import WorkRequestForm from './WorkRequestForm';
import { WorkRequest} from '../types';



// USERS_BEGIN
const MainView: React.FC = () => {
  const username = userContext.useParty();
  const myUserResult = userContext.useStreamFetchByKeys(User.User, () => [username], [username]);
  const aliases = publicContext.useStreamQueries(User.Alias, () => [], []);
  const myUser = myUserResult.contracts[0]?.payload;
  const allUsers = userContext.useStreamQueries(User.User).contracts;
// USERS_END
  const [showModal, setShowModal] = useState(false)

  // Sorted list of users that are following the current user
  const followers = useMemo(() =>
    allUsers
    .map(user => user.payload)
    .filter(user => user.username !== username)
    .sort((x, y) => x.username.localeCompare(y.username)),
    [allUsers, username]);

  // Map to translate party identifiers to aliases.
  const partyToAlias = useMemo(() =>
    new Map<Party, string>(aliases.contracts.map(({payload}) => [payload.username, payload.alias])),
    [aliases]
  );
  const allUserAliases = useMemo(() => {
    const userAliases = new Map();
    aliases.contracts.forEach(({ payload }) => {
      userAliases.set(payload.username, payload.alias);
    });
    return userAliases;
  }, [aliases]);


  const myUserName = aliases.loading ? 'loading ...' : partyToAlias.get(username) ?? username;

  // FOLLOW_BEGIN
  const ledger = userContext.useLedger();

  const follow = async (userToFollow: Party): Promise<boolean> => {
    try {
      await ledger.exerciseByKey(User.User.Follow, username, {userToFollow});
      return true;
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
      return false;
    }
  }
  // FOLLOW_END

   // Function to submit a new work request to the DAML ledger
   const submitWorkRequest = async (workRequest: WorkRequest) => {
    try {
      const workProposal = await ledger.create(Work.WorkProposal, {
        client: username,
        worker: workRequest.worker,
        jobCategory: workRequest.jobCategory,
        jobTitle: workRequest.jobTitle,
        jobDescription: workRequest.jobDescription,
        note: workRequest.note,
        rateType: workRequest.rateType,
        rateAmount: workRequest.rateAmount,
      });
      console.log("Work proposal created:", workProposal);
      return true;
    } catch (error) {
      alert(`Error creating work proposal:\n${error}`);
      return false;
    }
  };

  // Function to handle submission of work request form
  const handleSubmitWorkRequest = (workRequest: WorkRequest) => {
    console.log('Work Request Data:', workRequest as WorkRequest);
    if (typeof workRequest.rateAmount === 'number') {
      submitWorkRequest(workRequest)
        .then((success) => {
          if (success) {
            setShowModal(false); // Close the modal after submission
          }
        });
    } else {
      alert('Invalid rateAmount value');
    }
  };

  const handleCancelWorkRequest = () => {
    setShowModal(false); // Close the modal when cancel is clicked
  };

  console.log("Aliases: ", aliases);
  console.log("All Users", allUsers);
  
  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{padding: '1ex 0em 0ex 0em'}}>
                {myUserName ? `Welcome, ${myUserName}!` : 'Loading...'}
            </Header>

            <Segment>
              <Header as='h2'>
                <Icon name='user' />
                <Header.Content>
                  {myUserName ?? 'Loading...'}
                  <Header.Subheader>Users I'm following</Header.Subheader>
                </Header.Content>
              </Header>
              <Divider />
              <PartyListEdit
                parties={myUser?.following ?? []}
                partyToAlias={partyToAlias}
                onAddParty={follow}
              />
            </Segment>
            <Segment>
              <Header as='h2'>
                <Icon name='globe' />
                <Header.Content>
                  The Network
                  <Header.Subheader>My followers and users they are following</Header.Subheader>
                </Header.Content>
              </Header>
              <Divider />
              {/* USERLIST_BEGIN */}
              <UserList
                users={followers}
                partyToAlias={partyToAlias}
                onFollow={follow}
              />
              {/* USERLIST_END */}
            </Segment>
            <Segment>
              <Header as="h2">
                <Icon name='wrench' />
                <Header.Content>
                  Work Requests
                  <Header.Subheader>My Work Requests</Header.Subheader>
                </Header.Content>
              </Header>
              <Divider />
              <Button type="button" onClick={() => setShowModal(!showModal)}>New Request</Button>
              <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                closeIcon
              >
                <Modal.Header>New Work Request</Modal.Header>
                <Modal.Content>
                  <WorkRequestForm onSubmit={handleSubmitWorkRequest} onCancel={handleCancelWorkRequest} username={myUserName} userAliases={Array.from(allUserAliases.values())} />
                </Modal.Content>
              </Modal>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default MainView;
