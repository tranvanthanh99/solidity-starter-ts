import { ethers } from "hardhat";
import {
  deployContract,
  deployMultiContract,
  deployContractUpgradeable,
  deployMultiContractUpgradeable,
} from "../utils/contract";
import { Lock, Counter, TransparentCounter, UupsCounter, Nft721 } from "../../typechain-types";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;
  const lockedAmount = ethers.utils.parseEther("0.001");
  const savePath = "./scripts/data/contracts.json";
  const [signer] = await ethers.getSigners();

  console.log(`signer: ${signer.address}`);

  const nft721 = await deployContract<Nft721>(
    {
      name: "Nft721",
      args: [],
    },
    savePath,
    false
  );

  const reTx = await nft721.transferOwnership("0xD690C037cf32f57BB8977866f7C6dcC630e17B27");
  console.log(reTx);

  // const lock = await deployContract<Lock>(
  //   {
  //     name: "Lock",
  //     artifactPath: "contracts/Lock.sol:Lock",
  //     args: [unlockTime, { value: lockedAmount }],
  //   },
  //   savePath,
  //   true
  // );

  // lock.connect(signer).withdraw();

  // const [lock1, counter] = await deployMultiContract(
  //   [
  //     {
  //       name: "Lock1",
  //       artifactPath: "contracts/Lock1.sol:Lock1",
  //       args: [unlockTime, { value: lockedAmount }],
  //     },
  //     {
  //       name: "Counter",
  //       args: [],
  //     },
  //   ],
  //   savePath,
  //   true
  // );

  // let waiting = await (counter as Counter).connect(signer).incrementCounter();
  // await waiting.wait();
  // const count = await (counter as Counter).connect(signer).getCount();
  // console.log(count);

  // const transparentCounter = await deployContractUpgradeable<TransparentCounter>(
  //   {
  //     name: "TransparentCounter",
  //     initializer: "__Counter_init",
  //     args: [1],
  //   },
  //   savePath,
  //   true
  // );

  // const uupsCounter = await deployContractUpgradeable<UupsCounter>(
  //   {
  //     name: "UupsCounter",
  //     initializer: "initialize",
  //     kind: "uups",
  //     args: [1],
  //   },
  //   savePath,
  //   true
  // );

  // const [c1, c2] = await deployMultiContractUpgradeable(
  //   [
  //     {
  //       name: "TransparentCounter",
  //       initializer: "__Counter_init",
  //       kind: "transparent",
  //       args: [1],
  //     },
  //     {
  //       name: "UupsCounter",
  //       initializer: "initialize",
  //       kind: "uups",
  //       args: [1],
  //     },
  //   ],
  //   savePath,
  //   false
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
