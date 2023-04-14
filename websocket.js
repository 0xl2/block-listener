const { ethers } = require("ethers");
const colors = require("colors");

require('dotenv').config();

const config = require("./config.json");

const BigNumber = ethers.BigNumber;

const rpcProvider = new ethers.providers.JsonRpcProvider(config.rpc_url);
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
const poolContract = new ethers.Contract(config.poolAddr, poolABI, rpcProvider);

const websocketProvider = new ethers.providers.WebSocketProvider(
  `${config.rpc_socket}${process.env.INFURA_KEY}`
);
const filter = {
  address: config.poolAddr,
  topics: [
    config.swap_event, // swap event topic
  ],
};

// const checkTx = async (txItem) => {
const checkTx = async (txHash, blockHash) => {
  //   const blockResp = await provider.getTransactionReceipt(txItem.transactionHash);
  const blockResp = await rpcProvider.getTransactionReceipt(txHash);

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
      const blockInfo = await rpcProvider.getBlock(blockHash);

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
        console.log(colors.red(`Transaction Hash: ${blockHash}`));
        console.log(
          colors.red(`Transaction Timestamp: ${blockInfo.timestamp}`)
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
        console.log(colors.blue(`Transaction Hash: ${blockHash}`));
        console.log(
          colors.blue(`Transaction Timestamp: ${blockInfo.timestamp}`)
        );
      }
    }
  }
};

websocketProvider.on(filter, (log) => {
  console.log(log);

  //   console.log(logData, log);

    if (logData && logData.transactionHash && logData.blockHash) {
        console.log('here')
        checkTx(logData.transactionHash, logData.blockHash);  
  }
    
});
