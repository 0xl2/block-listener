### Ethereum Block Listener

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
