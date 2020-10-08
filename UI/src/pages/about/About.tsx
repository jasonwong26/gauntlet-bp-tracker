import * as React from "react";

export const About: React.FC = () => (
  <div className="container">
    <h1>About this Website</h1>
    <hr/>
    <p>
      This website is still a work in progress.  A few features I plan on implementing in the near future:
    </p>
    <ul>
      <li>
        Importing/Updating characters from DnDBeyond
      </li>
      <li>
        Expanded customizations for campaign settings
      </li>
    </ul>
    <p>
      If you have feedback or suggestions for other improvements for the site please let me know!
    </p>

    <h2>Why I built this</h2>
    <p>
      I wanted to to write a website using React Hooks which leveraged an web socket API.  
      Why?  
      Simply because I hadn't done so before.
      I could have written this more quickly using stacks and frameworks I am experienced with, but this provided an opportunity to experiment.
    </p>

    <h2>How it works</h2>
    <p>
      This site is written with the following stacks and frameworks:
    </p>
    <p>
      <strong>Front End</strong>: TypeScript 3.7, React 16, create-react-app
      <br/>
      <strong>Back End</strong>: TypeScript 3.7, AWS API Gateway, Lambda, DynamoDb
      <br/>
      <strong>CI/CD</strong>: AWS SAM, CDK, CodePipeline, CodeBuild, CloudFormation
    </p>

    <h2>More information than anyone cares about</h2>
    Source code for this website can be found <a target="_blank" rel="noopener noreferrer" href="https://github.com/jasonwong26/gauntlet-bp-tracker">here</a>.
  </div>
);
