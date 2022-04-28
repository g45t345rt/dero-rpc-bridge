# DERO RPC BRIDGE

Safely connect your local wallet with a website using Dero RPC Bridge to power their dapps.

## Browser extension

Act as a bridge to dispatch Dero transaction from any website to your wallet.  
The extension will intercept any kind of transfer request and display a dialog window to confirm the transaction.

## Web API (For devs)

Use this api to easily interact with the browser extension from your website.  
Check folder `/api/webpage-test` on how to use the api.

## DEV

Open first terminal  
`cd api && npm run start`  
Open second terminal  
`cd extension && npm run start`  

Pack extension for release  
`cd extension && npm run build-ext` check folder `web-ext-artifacts`  
