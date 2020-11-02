import * as React from "react";

export const Home: React.FC = () => (
  <div className="container">
    <h1>Welcome</h1>
    <hr/>
    <p>
      Inspired by the excellent 5th Edition Dungeons and Dragons content <a target="_blank" rel="noopener noreferrer" href="https://www.spectrecreations.com/#MotG">Masters of the Gauntlet</a> by TheArenaGuy, this site provides an easy to use online interface for tracking Battle Points - a unique system to that module.
      With the rise of online DnD campaigns and excellent tools like <a target="_blank" rel="noopener noreferrer" href="https://www.dndbeyond.com/">DnDBeyond</a>, <a target="_blank" rel="noopener noreferrer" href="https://roll20.net/">Roll20</a> and many others, I wanted to make something easy to use to collaborate my players.
    </p>
    <p>
      The Gauntlet module uses provides a streamlined set of rules that focuses on a series of increasingly difficult combat encounters.  This allows for fast, fun campaigns that are perfect for new players or for veterans wanting to experiment with new characters and playstyles.
      Instead of receiving typical currency or item rewards, characters receive points after each encounter which they can spend on equipment and upgrades.  
      This site allows players and to track the points they have earned and spent.
      It also allows the Dungeon Master to view their activity, and even customize the reward system for the campaign. 
    </p>
    <h2>Getting Started</h2>
    <p>
      Click <a className="btn btn-default btn-sm btn-success" href="/campaign/create">here</a> to get start creating your first campaign!
    </p>
  </div>
);
