import React from "react";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";

type Props = {
  loadingText: string;
};

const LoaderLarge : React.FC<Props> = ({ loadingText }) => (
  <div>
    <Segment>
      <Dimmer active>
        <Loader size="massive">{loadingText}</Loader>
      </Dimmer>

      <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
      <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
      <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
    </Segment>
  </div>
);

export default LoaderLarge;
