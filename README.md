# gauntlet-bp-tracker
A simple web application for running DnD Campaigns.

## Motivation
Inspired by the excellent 5th Edition Dungeons and Dragons content [Masters of the Gauntlet](https://www.spectrecreations.com/#MotG) by TheArenaGuy, this site provides an easy to use online interface for tracking Battle Points - a unique system to that module. With the rise of online DnD campaigns and excellent tools like [DnDBeyond](https://www.dndbeyond.com/), [Roll20](https://roll20.net/) and many others, I wanted to make something easy to use to collaborate my players.

The Gauntlet module uses provides a streamlined set of rules that focuses on a series of increasingly difficult combat encounters. This allows for fast, fun campaigns that are perfect for new players or for veterans wanting to experiment with new characters and playstyles. Instead of receiving typical currency or item rewards, characters receive points after each encounter which they can spend on equipment and upgrades. This site allows players and to track the points they have earned and spent. It also allows the Dungeon Master to view their activity, and even customize the reward system for the campaign.

## Tech Stack

### Front End
The front end is an SPA written in TypeScript 3.7 and React 16, scaffolded using the [create-react-app](https://github.com/facebook/create-react-app) package.  It utilizes Bootstap v4 and FontAwesome v4 for CSS and graphic frameworks.

The front end is hosted on an AWS S3 bucket and distributed by CloudFormation.

### Back End
The back end is a web socket API that calls Lambda methods with data stored in a DynamoDB document database.  All Lambda methods are written in TypeScript 3.7.  The API endpoints are defined by a [SAM](https://aws.amazon.com/serverless/sam/) document.

### CI/CD
The project's development pipeline was generated using a [CDK](https://aws.amazon.com/cdk/) template, which uses CodePipeline, CodeBuild, and CloudFormation to trigger build, test, and deploy actions. 
