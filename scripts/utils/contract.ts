import { ethers, network, upgrades, run } from "hardhat";
import { DeployParameters, DeployProxyParameters } from "./types";
import { Contract } from "ethers";
import { promises as fsPromises } from "fs";

export const deployContract = async <C extends Contract>(
  deployOption: DeployParameters,
  JSONPath?: string,
  verified: boolean = false
): Promise<C> => {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", signer.address);

  const f = await ethers.getContractFactory(deployOption.artifactPath ?? deployOption.name);
  const c = await f.deploy(...deployOption.args);
  console.log(`\n>>> ${deployOption.name} deployed at: ${c.address}`);

  await verifyContract(verified, deployOption.name, c.address, c, deployOption.artifactPath, ...deployOption.args);

  if (JSONPath != null) {
    await saveContract(JSONPath, JSON.stringify({ [deployOption.name]: c.address }));
  }
  return c as C;
};

export const deployMultiContract = async <C extends Contract>(
  deployOptions: DeployParameters[],
  JSONPath?: string,
  verified: boolean = false
): Promise<C[]> => {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", signer.address);

  const deployedAddresses: { [key: string]: string } = {};
  const deployedContracts: C[] = [];
  for (let i = 0; i < deployOptions.length; i++) {
    const p = deployOptions[i];
    try {
      const f = await ethers.getContractFactory(p.artifactPath ?? p.name);
      const c = await f.deploy(...p.args);
      console.log(`\n>>> ${p.name} deployed at: ${c.address}`);

      Object.assign(deployedAddresses, { [p.name]: c.address });
      deployedContracts.push(c as C);

      await verifyContract(verified, p.name, c.address, c, p.artifactPath, ...p.args);
    } catch (err: any) {
      console.log(`failed to deploy contract ${p.name}`);
      console.log(err.message);

      // return empty contract if failed
      deployedContracts.push(new Contract("", "") as C);
    }
  }

  if (JSONPath != null) {
    await saveContract(JSONPath, JSON.stringify(deployedAddresses));
  }

  return deployedContracts;
};

export const deployContractUpgradeable = async <C extends Contract>(
  deployOption: DeployProxyParameters,
  JSONPath?: string,
  verified: boolean = false
): Promise<C> => {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", signer.address);

  const f = await ethers.getContractFactory(deployOption.artifactPath ?? deployOption.name);

  const proxy = await upgrades.deployProxy(f, [...deployOption.args], {
    initializer: deployOption.initializer,
    kind: deployOption.kind,
  });
  const c = await proxy.deployed();

  console.log(`\n>>> ${deployOption.name} deployed at: ${c.address}`);

  // await c.deployTransaction.wait(6);
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(c.address);

  console.log(`${deployOption.name} implementation: ${implementationAddress}`);

  await verifyContract(verified, deployOption.name, c.address, c, deployOption.artifactPath, 0);

  if (JSONPath != null) {
    await saveContract(
      JSONPath,
      JSON.stringify({
        [deployOption.name]: c.address,
        [deployOption.name + "Implementation"]: implementationAddress,
      })
    );
  }
  return c as C;
};

export const deployMultiContractUpgradeable = async <C extends Contract>(
  deployOptions: DeployProxyParameters[],
  JSONPath?: string,
  verified: boolean = false
): Promise<C[]> => {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", signer.address);

  const deployedAddresses: { [key: string]: string } = {};
  const deployedContracts: C[] = [];
  for (let i = 0; i < deployOptions.length; i++) {
    const p = deployOptions[i];
    try {
      const f = await ethers.getContractFactory(p.artifactPath ?? p.name);

      const proxy = await upgrades.deployProxy(f, [...p.args], { initializer: p.initializer, kind: p.kind });
      const c = await proxy.deployed();

      // await c.deployTransaction.wait(6);
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(c.address);

      console.log(`\n>>> ${p.name} deployed at: ${c.address}`);
      console.log(`${p.name} implementation: ${implementationAddress}`);

      await verifyContract(verified, p.name, c.address, c, p.artifactPath, 0);

      Object.assign(deployedAddresses, {
        [p.name]: c.address,
        [p.name + "Implementation"]: implementationAddress,
      });
      deployedContracts.push(c as C);
    } catch (err: any) {
      console.log(`failed to deploy contract ${p.name}`);
      console.log(err.message);

      // return empty contract if failed
      deployedContracts.push(new Contract("", "") as C);
    }
  }

  if (JSONPath != null) {
    await saveContract(JSONPath, JSON.stringify(deployedAddresses));
  }

  return deployedContracts;
};

export const saveContract = async (JSONPath: string, deployedAddresses: string) => {
  try {
    // env must be either "dev" | "staging" | "prod"
    const env = process.env.ENV ?? "dev";
    const contracts = JSON.parse((await fsPromises.readFile(JSONPath)).toString());

    contracts[env] == null && Object.assign(contracts, { [env]: {} });
    contracts[env][network.name] == null &&
      Object.assign(contracts, { [env]: { [network.name]: {}, ...contracts[env] } });
    const data = {
      ...contracts,
      [env]: {
        ...contracts[env],
        [network.name]: {
          ...contracts[env][network.name],
          ...JSON.parse(deployedAddresses),
        },
      },
    };
    await fsPromises.writeFile(JSONPath, JSON.stringify(data, null, 2));
    console.log(`deployed data saved to ${JSONPath}`);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const verifyContract = async <C extends Contract>(
  verified: boolean,
  name: string,
  contractAddress: string,
  contract?: C,
  artifactPath?: string,
  confirmations: number = 6,
  ...args: any[]
) => {
  if (verified) {
    try {
      console.log(`verifying contract: ${name} at ${contractAddress}...`);

      if (contract == null) {
        contract = (await ethers.getContractAt(artifactPath ?? name, contractAddress)) as C;
      }
      // If 1 extra parameter was passed in, it contains overrides
      if (args.length === contract.interface.deploy.inputs.length + 1) {
        args.pop();
      }
      await contract?.deployTransaction?.wait(confirmations);

      await run("verify:verify", {
        contract: artifactPath,
        address: contractAddress,
        constructorArguments: [...args],
      });
    } catch (err: any) {
      console.log(`failed to verify contract ${name} at ${contractAddress}`);
      console.warn(err.message);
    }
  }
};
