import axios from "axios"
import { Router } from "express"

const coinsApi:Router = Router()

coinsApi.get("/", async (_, res) => {
    try {
        const coingeckoApi =  await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=2000&page=1&sparkline=false&price_change_percentage=1h")
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
                low_24h
            }))
            res.send({ state: "success", data })
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    } catch (error) {
        res.json({ state: "failed", reason: "backend error" })
    }
})

export default coinsApi