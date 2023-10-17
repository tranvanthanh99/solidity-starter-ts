import type { BigNumber } from "ethers";

export type DeployParameters = {
  name: string;
  artifactPath?: string;
  args: any[];
};

export type DeployProxyParameters = {
  name: string;
  artifactPath?: string;
  initializer: string;
  kind?: "uups" | "transparent" | "beacon";
  args: any[];
};
