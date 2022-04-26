import axios from "axios"
import "dotenv/config"
import { Router } from "express"
import { createClient } from "@supabase/supabase-js"

interface UserDetail {
    password: string,
    username: string,
    email: string
}

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const userApi:Router = Router()

userApi.get("/:id/coins", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    const userData =  await supabase
        .from("users")
        .select("favourite-coins")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let favouriteCoins:Array<string> = userData.data["favourite-coins"]
        try {
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.map(value => {
                    if (favouriteCoins.includes(value.name.toLowerCase())) {
                        return ({...value, "add_to_watch_list": true})
                    } else {
                        return ({...value, "add_to_watch_list": false})
                    }
                })
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } catch (error) {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.post("/:id/portfolio/sell", async (req, res) => {
    let id = req.params.id
    let { name, amount, time } = req.body as { name:string, amount:number, time:string, "current price":number }
    name = name.toLowerCase()
    const userData =  await supabase
        .from("users")
        .select("id, assets")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let userId = userData.data.id
        if (name in userData.data.assets) {
            userData.data.assets[name] = (userData.data.assets[name] - amount) > 0 ? userData.data.assets[name] - amount : 0
            const { error } = await supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId })
            if (!error) {
                const _transaction = await supabase
                .from("transactions")
                .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "sell"
                })
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" })
                } else {
                    res.json({ state: "success" })
                }
            } else {
                res.json({ state: "failed", reason: "backend error" })
            }  
        } else {
            res.send()
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
}) 

userApi.post("/:id/portfolio/buy", async (req, res) => {
    let id = req.params.id
    let { name, amount, time } = req.body as { name:string, amount:number, time:string, "current price":number }
    name = name.toLowerCase()
    const userData =  await supabase
        .from("users")
        .select("id, assets")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let userId = userData.data.id
        if (name in userData.data.assets) {
            userData.data.assets[name] = userData.data.assets[name] + amount
            const { error } = await supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId })
            if (!error) {
                const _transaction = await supabase
                .from("transactions")
                .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "buy"
                })
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" })
                } else {
                    res.json({ state: "success" })
                }
            } else {
                res.json({ state: "failed", reason: "backend error" })
            }  
        } else {
            userData.data.assets[name] = amount
            const { error } = await supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId })
            if (!error) {
                const _transaction = await supabase
                .from("transactions")
                .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "buy"
                })
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" })
                } else {
                    res.json({ state: "success" })
                }
            } else {
                res.json({ state: "failed", reason: "backend error" })
            }
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.get("/:id/portfolio/search", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    const userData =  await supabase
        .from("users")
        .select("assets")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        try {
            let assets = userData.data.assets
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.map(value => (
                    {
                        ...value, 
                        amount: assets[value.name.toLowerCase()] != undefined ? assets[value.name.toLowerCase()] : 0, 
                    }
                ))
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } catch (error) {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.get("/:id/portfolio", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    const userData =  await supabase
        .from("users")
        .select("assets")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        if (Object.keys(userData.data.assets).length > 0) {
            try {
                let assetsData = userData.data.assets
                let assetsCoins = Object.keys(assetsData)
                let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
                if (coins.data.state == "success") {
                    let assets = coins.data.data as Array<any>
                    let balance = 0
                    assets = assets
                        .filter(({ name }) => assetsCoins.includes(name.toLowerCase()))
                        .filter(value => Math.round(assetsData[value.name.toLowerCase()]) > 0)
                        .map(value => {
                                balance += assetsData[value.name.toLowerCase()] * value.current_price
                                return {
                                    ...value, 
                                    amount: assetsData[value.name.toLowerCase()], 
                                    amount_in_current_price: assetsData[value.name.toLowerCase()] * value.current_price
                                }
                            }
                        )
                    res.json({ state: "success", data: { assets, balance } })
                } else {
                    throw new Error()
                }
            } catch (error) {
                res.json({ state: "failed", reason: "backend error" })
            }
            
        } else {
            res.json({ state: "success", data: { assets: [], balance: 0.0 } })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.get("/:id/favourite-coins", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    const userData =  await supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let favouriteCoins:Array<string> = userData.data["favourite-coins"]
        try {
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.filter(({ name }) => favouriteCoins.includes(name.toLowerCase()))
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } catch (error) {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.delete("/:id/favourite-coins", async (req, res) => {
    let id = req.params.id
    let unFavouriteCoins = req.body as Array<string>
    unFavouriteCoins = unFavouriteCoins
        .map(value => value.toLowerCase())
        .filter(value => value != String())
    const userData =  await supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let userId = userData.data.id
        let favouriteCoins:Array<string> = userData.data["favourite-coins"]
        favouriteCoins = favouriteCoins
            .filter(coin => !unFavouriteCoins.includes(coin.toLowerCase()))
        const { error } = await supabase
            .from("users")
            .update({ "favourite-coins": favouriteCoins })
            .match({ id: userId })
        if (!error) {
            res.json({ state: "success" })
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.post("/:id/favourite-coins", async (req, res) => {
    let id = req.params.id
    let favouriteCoins = req.body as Array<string>
    favouriteCoins = favouriteCoins
        .map(value => value.toLowerCase())
        .filter(value => value != String())
    const userData =  await supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (userData.data) {
        let userId = userData.data.id
        favouriteCoins = [...favouriteCoins, ...userData.data["favourite-coins"]]
        favouriteCoins = favouriteCoins.filter((coin, index) => favouriteCoins.indexOf(coin) == index)
        const { error } = await supabase
            .from("users")
            .update({ "favourite-coins": favouriteCoins })
            .match({ id: userId })
        if (!error) {
            res.json({ state: "success" })
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.put("/:id", async (req, res) => {
    let id:string = req.params.id
    const { data } =  await supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (data) {
        let userId = data.id
        let { username, password, email } = req.body
        let newUserData:{[name:string]: any} = {}
        newUserData["user_metadata"] = {}
        if (email) {
            let emailChecker = await supabase
            .from("users")
            .select("id")
            .neq("id", userId)
            .eq("email", email)
            .limit(1)
            .single()
            if (!emailChecker.data) {
                newUserData["email"] = email
            } else {
                res.json({ state: "failed", reason: "email already in use" })
                return
            }
        }
        if (username) {
            let usernameChecker = await supabase
            .from("users")
            .select("id")
            .neq("id", userId)
            .eq("username", username)
            .limit(1)
            .single()
            if (!usernameChecker.data) {
                newUserData["user_metadata"]["username"] = username
            } else {
                res.json({ state: "failed", reason: "username already in use" })
                return
            }
        }
        if (password) {
            newUserData["user_metadata"]["password"] = password
        }
        const { error } = await supabase.auth.api.updateUserById( userId, newUserData )
        if (!error) {
            res.json({ data: { id, email, password, username }, state: "success" })
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "failed", reason: "user doesn't not exist" })
    }
})

userApi.delete('/:id', async (req, res) => {
    let id:string = req.params.id
    const { data } =  await supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (data) {
        const userId = data.id
        const { error } = await supabase
            .from("users")
            .delete()
            .match({ id: userId })
        if (!error) {
<<<<<<< HEAD
=======
            res.json({ state: "success" })
>>>>>>> ffcdf0f36f059ca871af9f1961cf2cb18c1f0380
            const { error: authError } = await supabase.auth.api.deleteUser(userId)
            if (!authError) {
                res.json({ state: "success" })
            } else {
                res.json({ state: "failed", reason: "backend error" })
            }
<<<<<<< HEAD
=======
            
>>>>>>> ffcdf0f36f059ca871af9f1961cf2cb18c1f0380
        } else {
            res.json({ state: "failed", reason: "backend error" })
        }
    } else {
        res.json({ state: "success" })
    }
})

userApi.get("/:id", async (req, res) => {
    let id = req.params.id
    const { data } =  await supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${ /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single()
    if (data) {
        res.json({ state: "success", data })
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.post("/login", async (req, res) => {
    const { password, email_or_username } = req.body as { password:string, email_or_username:string }
    const { data } =  await supabase
        .from("users")
        .select("id, password, username, email")
        .or(`email.eq.${email_or_username},username.eq.${email_or_username}`)
        .eq("password", password)
        .limit(1)
        .single()
    if (data) {
        res.json({ data , state: "success" })
    } else {
        res.json({ state: "failed", reason: "invalided details" })
    }
})

userApi.post("/signin", async (req, res) => {
    const { email, username, password } = req.body as UserDetail
<<<<<<< HEAD
    const appId = req.body["app-id"]
=======
>>>>>>> ffcdf0f36f059ca871af9f1961cf2cb18c1f0380
    const emailChecker =  await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1)
        .single()
    if (emailChecker.data) {
        res.json({ state: "failed", reason: "email already exist" })
    } else {
        const usernameChecker = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .limit(1)
            .single()
        if (usernameChecker.data) {
            res.json({ state: "failed", reason: "username already exist" })
        } else {
            const { error, user } = await supabase.auth.api.createUser({
                user_metadata: {
                    password,
<<<<<<< HEAD
                    username,
                    "app-id": appId
=======
                    username
>>>>>>> ffcdf0f36f059ca871af9f1961cf2cb18c1f0380
                },
                email,
                password,
                email_confirm: true
            })
            if (error) {
                res.json({state: "failed", reason: "backend error"})
            } else {
                res.json({ data: { id :user.id, email, password, username }, state: "success" })
            }
        }
    }
})

export default userApi