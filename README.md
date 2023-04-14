# Ethereum Block Listener

### 1. Using loop
Before start you need to add values in config.json file.
By updating this values, you can subscribe on any chain, any pool any event.
```bash
{
    "rpc_url": "rpc_url_here",
    "poolAddr": "pool_address_here",
    "swap_event": "swap_event_topic"
}
```

Install npm modules by running
```bash
npm install
// or
yarn install
```

Then run index.js
```bash
node index.js
```

Please check screenshot.
![image](https://user-images.githubusercontent.com/37606416/232139717-ad5d2e84-9151-48dd-8d55-3cc9b2c95fe3.png)

### 2. Using websocket

You need to add infura key in .env file.
Please check .env.example
```bash
INFURA_KEY=your_infura_key_here
```

Install npm packages by running
```bash
npm install
// or
yarn install
```

Running socket listener by running
```bash
node websocket.js
```

Please check screenshot.
![image](https://user-images.githubusercontent.com/37606416/232146257-d12a47c6-49b4-40ef-9697-18d1fdd1ace0.png)
