# DERO RPC BRIDGE

Safely connect your local wallet with a website using Dero RPC Bridge to power their dapps.

## Chrome Store

<https://chrome.google.com/webstore/detail/dero-rpc-bridge/nmofcfcaegdplgbjnadipebgfbodplpd>

## Firefox ADD-ONS

<https://addons.mozilla.org/en-US/firefox/addon/dero-rpc-bridge/>

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

## BUILD

Go to extension folder and install NPM dependencies  
`cd extension && npm install`  

Pack extension manifest 3  
`npm run build`  
`npm run ext-build` check folder `web-ext-artifacts-m3`  

Pack extension manifest 2 (firefox)  
`npm run build-m2`  
`npm run ext-build-m2` check folder `web-ext-artifacts-m2`  

## Donations

If you want to support future development of the tool.  
Send any amount to `dero1qyhunyuk24g9qsjtcr4r0c7rgjquuernqcfnx76kq0jvn4ns98tf2qgj5dq70`  

Thanks for all the donations!  

## Copyright and license

Code and documentation copyright 2022 the Dero RPC Bridge.  
Code released under the [MIT License](https://github.com/g45t345rt/dero-rpc-bridge/blob/master/LICENSE).  
