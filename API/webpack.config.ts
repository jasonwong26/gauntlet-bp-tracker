import { resolve } from "path";
import { Configuration } from "webpack";
import * as dotenv from "dotenv";

dotenv.config();

const config: Configuration = {
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  entry: { 
    onconnect: "./src/connection/connect.ts", 
    ondisconnect: "./src/connection/disconnect.ts",
    default: "./src/connection/default.ts",
    subscribe: "./src/connection/subscribe.ts",
    unsubscribe: "./src/connection/unsubscribe.ts",

    getcampaign: "./src/campaign/get.ts",
    createcampaign: "./src/campaign/create.ts",
    updatecampaign: "./src/campaign/update.ts",
    deletecampaign: "./src/campaign/delete.ts",

    getsettings: "./src/campaignsettings/get.ts",
    savesettings: "./src/campaignsettings/save.ts",

    getcharacter: "./src/character/get.ts",
    savecharacter: "./src/character/save.ts",
    deletecharacter: "./src/character/delete.ts",
    additem: "./src/character/additem.ts",
    removeitem: "./src/character/removeitem.ts",

    getnotifications: "./src/notifications/get.ts",
  },
    
  output: {
    filename: "[name]/app.js",
    libraryTarget: "commonjs2",
    path: resolve(__dirname, "lib")
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }]
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  target: "node"
};

export default config;