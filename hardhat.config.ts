import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    bscMainnet: {
      url: process.env.BSCMAINNET_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      // gasPrice: 7000000000,
    },
    bscTestnet: {
      url: process.env.BSCTESTNET_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      // gasPrice: 70000000000,
    },
    polygon: {
      url: process.env.POLYGON_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      gasPrice: 150000000000,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      gasPrice: 70000000000,
    },
    goerli: {
      url: process.env.GOERLI_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      gasPrice: 2985000000,
    },
    meldTestnet: {
      url: process.env.MELDTESTNET_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      // gasPrice: 2985000000,
    },
    localnet: {
      url: process.env.LOCALNET_RPC ?? "",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      // gasPrice: 70000000000,
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGON_API ?? "",
      bscTestnet: process.env.BSCSCAN_API ?? "",
      goerli: process.env.ETH_API ?? "",
      polygonMumbai: process.env.POLYGON_API ?? "",
    },
  },
};

export default config;
