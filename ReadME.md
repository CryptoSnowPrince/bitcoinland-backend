# ordinalbtc-marketplace-backend

### API_URL

```
https://ordinalbtc.app/api
```
### API_LIST
```
POST
https://ordinalbtc.app/api/users/getUserInfo
erc20Account: string

POST
https://ordinalbtc.app/api/users/setUserInfo
erc20Account: string
name: string
avatar: number
background: number
actionDate: date
signData: object

POST
https://ordinalbtc.app/api/users/getUserInscriptions
btcAccount: string

POST
https://ordinalbtc.app/api/users/withdrawInscription
erc20Account: string
inscriptionID: string
receiver: string
signData: object

POST
https://ordinalbtc.app/api/users/listInscription
inscriptionID: string
name: string
category: number
btcSeller: string
tokenAddress: string
tokenAmount: number
description: string
lockTime: number
actionDate: date
signData: object

POST
https://ordinalbtc.app/api/users/unListInscription
inscriptionID: string
btcSeller: string
actionDate: date
signData: object

POST
https://ordinalbtc.app/api/offers/getList
categories: [Number]
tokenAddresses: [String]
btcSellers: [String]
btcBuyers: [String]
inscriptionIDs: [String]
inscriptionNumbers: [String]
states: [Number]
minPrice: Number
maxPrice: Number
sortBy: Number
active: boolean

GET
https://ordinalbtc.app/api/inscriptions/detail?inscriptionID=${inscriptionID}
inscriptionID: String

GET
https://ordinalbtc.app/api/inscriptions/withdrawDetail?orderNumber=${orderNumber}
orderNumber: Number

GET
https://ordinalbtc.app/api/offers/getMostTrendList

GET
https://ordinalbtc.app/api/utils/getGasPrice?chainID=Number
const CHAINID_ETH = 1
const CHAINID_BSC = 56
const CHAINID_GOERLI = 5

GET
https://ordinalbtc.app/api/users/getNotify?erc20Account=erc20Account

POST
https://ordinalbtc.app/api/users/removeNotify
erc20Account: erc20Account
removeAll: bool
type: Number
link: string
content: string
notifyDate: Date
```