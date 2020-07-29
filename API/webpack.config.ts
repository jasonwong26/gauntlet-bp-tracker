import { resolve } from "path";
import { Configuration } from "webpack";
import * as dotenv from "dotenv";

dotenv.config();

const config: Configuration = {
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  entry: { 
    onconnect: "./src/onconnect/app.ts", 
    ondisconnect: "./src/ondisconnect/app.ts",
    default: "./src/default/app.ts",
    subscribe: "./src/subscribe/app.ts",
    unsubscribe: "./src/unsubscribe/app.ts",
    getcampaign: "./src/getcampaign/app.ts",
    getsettings: "./src/getsettings/app.ts",
    getcharacter: "./src/getcharacter/app.ts",
    savecharacter: "./src/savecharacter/app.ts",
    additem: "./src/additem/app.ts",
    removeitem: "./src/removeitem/app.ts"  
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