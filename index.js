const { ethers } = require("ethers");
const colors = require("colors");

const config = require("./config.json");

const BigNumber = ethers.BigNumber;

const provider = new ethers.providers.JsonRpcProvider(config.rpc_url);
const poolABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0Out",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1Out",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "to", type: "address" },
    ],
    name: "Swap",
    type: "event",
  },
];

const poolContract = new ethers.Contract(config.poolAddr, poolABI, provider);

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time * 1e3));
}

(async () => {
  let currentNode = 0;

  while (true) {
    try {
      const highestblock = await provider.getBlock("latest");
      const needle = highestblock["number"];

      if (currentNode === 0) currentNode = needle;

      // console.log(
      //   `Last checked block is: ${currentNode}, latest block is ${needle}`
      // );

      // check if new block generated i.e latest_block_number > latest_check_block_number
      if (currentNode < needle) {
        // make arrary of number to iterate the block number difference
        const chunk = needle - currentNode;
        const keyArr = [...Array(chunk).keys()].map((i) => i + currentNode + 1);

        // iterate block number
        for (const keyVal of keyArr) {
          const blockTxs = await provider.getBlockWithTransactions(keyVal);

          if (blockTxs) {
            // check all block transactions
            await Promise.all(
              blockTxs["transactions"].map(async (blockTx) => {
                const blockResp = await provider.getTransactionReceipt(
                  blockTx.hash
                );

                for (const txLog of blockResp.logs) {
                  // if tx was swap on pool
                  if (
                    txLog.address == config.poolAddr &&
                    txLog.topics.length > 0 &&
                    txLog.topics[0] == config.swap_event
                  ) {
                    // parse log
                    const parsedLog = poolContract.interface.parseLog(txLog);
                    const logArgs = parsedLog.args;

                    // get block details
                    const blockInfo = await provider.getBlock(
                      blockTx.blockHash
                    );

                    // if inToken is USDC
                    console.log("==========================");
                    if (BigNumber.from(logArgs["amount0In"]).gt(0)) {
                      console.log(colors.red(`Swap!!, USDC -> ETH`));
                      console.log(colors.red(`Sender: ${logArgs["sender"]}`));
                      console.log(colors.red(`Receiver: ${logArgs["to"]}`));
                      console.log(
                        colors.red(
                          `USDC input amount: ${ethers.utils.formatUnits(
                            logArgs["amount0In"],
                            6
                          )}`
                        )
                      );
                      console.log(
                        colors.red(
                          `ETH output amount: ${ethers.utils.formatEther(
                            logArgs["amount1Out"]
                          )}`
                        )
                      );
                      console.log(
                        colors.red(`Transaction Hash: ${blockTx.hash}`)
                      );
                      console.log(
                        colors.red(
                          `Transaction Timestamp: ${blockInfo.timestamp}`
                        )
                      );
                    } else if (BigNumber.from(logArgs["amount1In"]).gt(0)) {
                      console.log(colors.blue(`Swap!!, ETH -> USDC`));
                      console.log(colors.blue(`Sender: ${logArgs["sender"]}`));
                      console.log(colors.blue(`Receiver: ${logArgs["to"]}`));
                      console.log(
                        colors.blue(
                          `ETH input amount: ${ethers.utils.formatEther(
                            logArgs["amount1In"]
                          )}`
                        )
                      );
                      console.log(
                        colors.blue(
                          `USDC output amount: ${ethers.utils.formatUnits(
                            logArgs["amount0Out"],
                            6
                          )}`
                        )
                      );
                      console.log(
                        colors.blue(`Transaction Hash: ${blockTx.hash}`)
                      );
                      console.log(
                        colors.blue(
                          `Transaction Timestamp: ${blockInfo.timestamp}`
                        )
                      );
                    }
                  }
                }
              })
            );
          }
        }

        currentNode = needle;
      }

      // console.log("Subscribe completed for block number: ", currentNode);
      await delay(2);
    } catch (err) {
      console.log(err, `current node is: ${currentNode}`);
    }
  }
}).call(this);
