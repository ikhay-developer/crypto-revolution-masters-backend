import axios from "axios"
import "dotenv/config"
import { Router } from "express"
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'
import { createClient } from "@supabase/supabase-js"

(Date.prototype as any).toTemporalInstant = toTemporalInstant

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const adminApi = Router()

adminApi.get("/favourite-coin-data", async (req, res) => {
    let url = `${req.protocol}://${req.headers.host}`
    const { data } = await supabase
        .from("admin-data")
        .select("favourite-coin")
        .match({ id: 0 })
        .limit(1)
        .single()
    if (data) {
        let favouriteCoins = data["favourite-coin"] as Array<string>
        try {
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            let favouriteCoinList = await axios.get(`${url}/${process.env.API_SECRET_KEY}/admin/favourite-coin`)
            if (coins.data.state == "success" && favouriteCoinList.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.filter(value => favouriteCoins.includes(value.name.toLowerCase()))
                res.json({ 
                    state: "success", data: {
                        "favourite coins": favouriteCoins.map(value => value.toLowerCase()),
                        "favourite coin list": favouriteCoinList.data.data,
                        "coin list": coins.data.data.map((value: any) => ({...value, is_add_to_favourite: favouriteCoins.includes(value.name.toLowerCase())})),
                    }
                }) 
            } else {
                throw new Error()
            }
        } catch (error) {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "backend error" }) 
    }
})

adminApi.post("/favourite-coin", async (req, res) => {
    let data = req.body as Array<string>
    data = data.map(value => value.toLowerCase())
    const { error } = await supabase
        .from("admin-data")
        .update({ "favourite-coin": data })
        .match({ id: 0 })
    if (!error)
        res.json({ state: "success", data })
    else
        res.json({ state: "failed", reason: "backend error" })
})

adminApi.get("/favourite-coin", async (req, res) => {
    let url = `${req.protocol}://${req.headers.host}`
    const { data } = await supabase
        .from("admin-data")
        .select("favourite-coin")
        .match({ id: 0 })
        .limit(1)
        .single()
    if (data) {
        let favouriteCoins = data["favourite-coin"]
        try {
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.filter(value => favouriteCoins.includes(value.name.toLowerCase()))
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } catch (error) {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "backend error" }) 
    }
})

adminApi.get("/message", async (_, res) => {
    let { data } = await supabase
        .from("admin-msg")
        .select("link,message,date,image")
    if (data) {
        data = data
        .map((value:any) => {
            if ((value.date as string).search(/\[/) < 0) {
                value.date = (new Date(value.date) as any).toTemporalInstant()
            } else {
                value.date = Temporal.Instant.from(value.date)
            }
            return { ...value }
        })
        .sort((a: any, b: any) => Temporal.Instant.compare(a.date, b.date))
        .map((value:any) => {
            value.date = new Date(value.date.epochMilliseconds).toISOString()
            return { ...value }
        })
        .reverse()
        res.json({ state: "success", data })
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.post("/message", async (req, res) => {
    const body = req.body
    const { error } = await supabase
        .from("admin-msg")
        .insert({...body })
    if (!error)
        res.json({ state: "success", data: { ...body } })
    else 
        res.json({ state: "failed", reason: "backend error" })
})

adminApi.post("/ads/:id", async (req, res) => {
    let index = req.params.id
    const body = req.body
    const { error } = await supabase
        .from("admin-ads")
        .insert({ index, ...body })
    if (!error)
        res.json({ state: "success", data: { index, ...body } })
    else 
        res.json({ state: "failed", reason: "backend error" })
})

adminApi.delete("/ads/:id", async (req, res) => {
    let index = req.params.id
    const { data } = await supabase
        .from("admin-ads")
        .select("image")
        .match({ index })
        .limit(1)
        .single()
    let [ file, directory ] = (data.image as string).split("/").reverse()
    axios.delete(`${req.protocol}://${req.headers.host}/${process.env.API_SECRET_KEY}/storage/${directory}/${file}`)
    .then(async (e) =>  {
        if (e.data.state == "success") {
            const { error } = await supabase
                .from("admin-ads")
                .delete()
                .match({ index })
            if (!error && data) {
                res.json({ state: "success"})
            } else {
                res.json({ state: "failed", reason: "backend error" })
            }
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    })
    .catch(e => {
        res.json({ state: "failed", reason: "backend error" })
    })    
})

adminApi.get("/ads", async (_, res) => {
    const { data } = await supabase
        .from("admin-ads")
        .select("*")
    if (data)
        res.json({ state: "success", data })
    else
        res.json({ state: "failed", reason: "backend error" })
})

adminApi.get("/auth", async (_, res) => {
    const { data } = await supabase
        .from("admin-data")
        .select("username,password")
        .match({ id: 0 })
        .limit(1)
        .single()
    if (data)
        res.json({ state: "success", data })
    else
        res.json({ state: "failed", reason: "backend error" })
})

adminApi.post("/auth", async (req, res) => {
    let { username, password } = req.body as { username:string, password:string }
    const { error } = await supabase
        .from("admin-data")
        .update({
            username,
            password
        })
        .match({ id: 0 })
    if (!error) 
        res.json({ state: "success", data: { username, password } })
    else
        res.json({ state: "failed", reason: "backend error" })  
})

adminApi.get("/users", async (_, res) => {
    const { data } = await supabase
        .from("users")
        .select("id,username,email")
    res.json(data)
})

export default adminApi