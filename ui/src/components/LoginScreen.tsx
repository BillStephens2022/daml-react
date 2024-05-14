// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Dropdown, Form, Grid, Header, Image, Segment } from "semantic-ui-react";
import Credentials, { PublicParty } from "../Credentials";
import Ledger from "@daml/ledger";
import {
  DamlHubLogin as DamlHubLoginBtn,
  usePublicParty,
} from "@daml/hub-react";
import { authConfig, Insecure } from "../config";

// Define options for the skillset dropdown
const skillsetOptions = [
  { key: 'handyman', text: 'Handyman', value: 'Handyman' },
  { key: 'technology', text: 'Technology', value: 'Technology' },
  { key: 'landscaping', text: 'Landscaping', value: 'Landscaping' },
  { key: 'financial', text: 'Financial', value: 'Financial'}
];

type Props = {
  onLogin: (credentials: Credentials) => void;
};

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({ onLogin }) => {
 
  const [selectedSkillset, setSelectedSkillset] = useState<string>("");

  const login = useCallback(
    async (credentials: Credentials) => {
      console.log("Credentials received:", credentials); 
      onLogin(credentials);
    },
    [onLogin],
  );

  const wrap: (c: JSX.Element) => JSX.Element = component => (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header
          as="h1"
          textAlign="center"
          size="huge"
          style={{ color: "#223668" }}>
          <Header.Content>
            Create
            <Image
              as="a"
              href="https://www.digitalasset.com/developers"
              target="_blank"
              src="/daml.svg"
              alt="Daml Logo"
              spaced
              size="small"
              verticalAlign="bottom"
            />
            App
          </Header.Content>
        </Header>
        <Form size="large" className="test-select-login-screen">
          <Segment>{component}</Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );

  const InsecureLogin: React.FC<{ auth: Insecure }> = ({ auth }) => {
    const [username, setUsername] = useState("");
    

    const handleLogin = async (event: React.FormEvent) => {
      if (!selectedSkillset) {
        alert('Please select a skillset.');
        return;
      }
      event.preventDefault();
      const token = auth.makeToken(username);
      const ledger = new Ledger({ token: token });
      const primaryParty: string = await auth.userManagement
        .primaryParty(username, ledger)
        .catch(error => {
          const errorMsg =
            error instanceof Error ? error.toString() : JSON.stringify(error);
          alert(`Failed to login as '${username}':\n${errorMsg}`);
          throw error;
        });

      const useGetPublicParty = (): PublicParty => {
        const [publicParty, setPublicParty] = useState<string | undefined>(
          undefined,
        );
        const setup = () => {
          const fn = async () => {
            const publicParty = await auth.userManagement
              .publicParty(username, ledger)
              .catch(error => {
                const errorMsg =
                  error instanceof Error
                    ? error.toString()
                    : JSON.stringify(error);
                alert(
                  `Failed to find primary party for user '${username}':\n${errorMsg}`,
                );
                throw error;
              });
            // todo stop yolowing error handling
            setPublicParty(publicParty);
          };
          fn();
        };
        return { usePublicParty: () => publicParty, setup: setup };
      };
      console.log("selected Skillset - 1st log: ", selectedSkillset)
      await login({
        user: { userId: username, primaryParty: primaryParty },
        party: primaryParty,
        token: auth.makeToken(username),
        getPublicParty: useGetPublicParty,
        skillset: selectedSkillset,
      });
    };

    return wrap(
      <>
        {/* FORM_BEGIN */}
        <Form.Input
          fluid
          placeholder="Username"
          value={username}
          className="test-select-username-field"
          onChange={(e, { value }) => setUsername(value?.toString() ?? "")}
        />
        <Dropdown
              fluid
              selection
              placeholder="Select Skillset"
              options={skillsetOptions}
              onChange={(e, { value }) => setSelectedSkillset(value as string)}
            />
        <Button
          primary
          fluid
          className="test-select-login-button"
          onClick={handleLogin}>
          Log in
        </Button>
        {/* FORM_END */}
      </>,
    );
  };

  const DamlHubLogin: React.FC = () => 
     wrap(
      <DamlHubLoginBtn
        onLogin={creds => {
          if (creds) {
            login({
              party: creds.party,
              user: { userId: creds.partyName, primaryParty: creds.party },
              token: creds.token,
              getPublicParty: () => ({
                usePublicParty: () => usePublicParty(),
                setup: () => {},
              }),
              skillset: selectedSkillset
            });
          }
        }}
        options={{
          method: {
            button: {
              render: () => <Button primary fluid />,
            },
          },
        }}
      />,
    );
  

  return authConfig.provider === "none" ? (
    <InsecureLogin auth={authConfig} />
  ) : authConfig.provider === "daml-hub" ? (
    <DamlHubLogin />
  ) : (
    <div>Invalid configuation.</div>
  );
};

export default LoginScreen;
