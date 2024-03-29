import axios from "axios"
import { Router } from "express"

const coinsApi:Router = Router()

const fetchCoinsFromCoingecko = async (pageList:Array<string>): Promise<Array<any>> => {
    let returnData:Array<any> = Array()
    for await (const page of pageList) {
        try {
            const coingeckoApi =  await axios.get(`https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h&x_cg_pro_api_key=CG-yT2kvLSBNH83P7vLxQCbwWtT`)
            if (coingeckoApi.status >= 200 && coingeckoApi.status <= 300) {
                let data = (coingeckoApi.data as Array<any>)
                .map(({ 
                    name, 
                    symbol, 
                    image, 
                    current_price, 
                    market_cap, 
                    market_cap_rank, 
                    fully_diluted_valuation, 
                    market_cap_change_24h,
                    market_cap_change_percentage_24h,
                    ath_change_percentage,
                    price_change_percentage_1h_in_currency,
                    price_change_percentage_24h,
                    price_change_24h,
                    high_24h, 
                    low_24h  
                }) => ({
                    name, 
                    symbol, 
                    image, 
                    current_price, 
                    market_cap, 
                    market_cap_rank, 
                    fully_diluted_valuation,
                    market_cap_change_24h,
                    market_cap_change_percentage_24h,
                    ath_change_percentage, 
                    high_24h, 
                    low_24h,
                    price_change_24h,
                    price_change_percentage_24h,
                    price_change_percentage_1h_in_currency
                }))
                returnData.push(...data)
            } else {
                throw new Error()
            }
        } catch (error) {
            returnData.push()
        }
    }
    return returnData
}

coinsApi.get("/", async (_, res) => {
    fetchCoinsFromCoingecko(["1", "2", "3", "4"])
    .then(data => res.send({ state: "success", data }))
    .catch(_ => res.json({ state: "failed", reason: "backend error" }))
})

export default coinsApi