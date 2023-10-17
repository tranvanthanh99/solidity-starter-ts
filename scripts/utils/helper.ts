import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, network, upgrades, run } from "hardhat";
import { promises as fsPromises } from "fs";

export const createSignature = async (values: string[] = [], types: string[] = [], wallet: SignerWithAddress) => {
  // STEP 1:
  // building hash has to come from system address
  // 32 bytes of data
  const messageHash = ethers.utils.solidityKeccak256(types, values);

  // STEP 2: 32 bytes of data in Uint8Array
  const messageHashBinary = ethers.utils.arrayify(messageHash);

  // STEP 3: To sign the 32 bytes of data, make sure you pass in the data
  return await wallet.signMessage(messageHashBinary);
};

export const getContract = async <C extends Contract>(name: string, JSONPath: string): Promise<C> => {
  // env must be either "dev" | "staging" | "prod"
  const env = process.env.ENV ?? "dev";
  const contracts = JSON.parse((await fsPromises.readFile(JSONPath)).toString());
  console.log(contracts[env][network.name]);
  const c: C = contracts[env][network.name][name] && ethers.getContractAt(name, contracts[env][network.name][name]);
  return c;
};

export const getBlockTimeStamp = async (): Promise<number> => {
  const blockNumber = await ethers.provider.getBlockNumber();

  // Get the block information for the current block
  const block = await ethers.provider.getBlock(blockNumber);

  // Get the timestamp for the current block
  return block.timestamp;
};
