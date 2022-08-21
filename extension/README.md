# DERO RPC BRIDGE

Act as a bridge to dispatch Dero transaction from any website to your wallet.  
The extension will intercept any kind of transfer request and display a dialog window to confirm the transaction.

## DEV

Open terminal  
`npm run start`

## BUILD

Go to extension folder and install NPM dependencies  
`npm install`  

Pack extension manifest 3  
`npm run build`  
`npm run ext-build` check folder `web-ext-artifacts-m3`  

Pack extension manifest 2 (firefox)  
`npm run build-m2`  
`npm run ext-build-m2` check folder `web-ext-artifacts-m2`  
