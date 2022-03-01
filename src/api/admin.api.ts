import axios from "axios"
import "dotenv/config"
import { Router } from "express"
import { 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    setDoc 
} from "firebase/firestore"
import { table } from "../services/database"

const adminApi = Router()

adminApi.post("/favourite-coin", async (req, res) => {
    const data = req.body
    setDoc(doc(table.admin, "favourite-coin"), {coins: data})
    .then(_ => res.json({ state: "success" }))
    .catch(_ => res.json({ state: "failed", reason: "backend error" }))
})

adminApi.get("/favourite-coin", async (req, res) => {
    let url = `${req.protocol}://${req.headers.host}`
    try {
        let snapshot = await getDoc(doc(table.admin, "favourite-coin"))
        let favouriteCoins = (snapshot.data() as any)["coins"] as Array<string>
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
    
})

adminApi.get("/message", async (_, res) => {
    const snapshot = await getDoc(doc(table.admin, "message"))
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        let dataArray = Array.from(Object.values(data))
        dataArray.reverse()
        res.json({ state: "success", data: dataArray })
    } else {
        res.json({ state: "failed", reason: "backend error" })
    } 
})

adminApi.post("/message", async (req, res) => {
    const snapshot = await getDoc(doc(table.admin, "message"))
    const body = req.body
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        let dataArray = Array.from(Object.values(data))
        body["date"] = new Date().toISOString()
        data[dataArray.length + 1] = body
        setDoc(doc(table.admin, "message"), data)
        .then(_ => res.json({ state: "success", data: {...body} }))
        .catch(_ => res.json({ state: "failed", reason: "backend error" }))
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.post("/ads/:id", async (req, res) => {
    const snapshot = await getDoc(doc(table.admin, "ads"))
    const body = req.body
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        data[req.params.id] = {...body}
        setDoc(doc(table.admin, "ads"), data)
        .then(_ => res.json({ state: "success", data: {...body} }))
        .catch(_ => res.json({ state: "failed", reason: "backend error" }))
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.delete("/ads/:id", async (req, res) => {
    const snapshot = await getDoc(doc(table.admin, "ads"))
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        if (req.params.id in data) {
            let adData = data[req.params.id]
            let adImageUrl = (adData["image"] as string)
            axios.delete(adImageUrl)
            .then(e => {
                if (e.data.state == "success") {
                    delete data[req.params.id]
                    setDoc(doc(table.admin, "ads"), data)
                    .then(_ => res.json({ state: "success" }))
                    .catch(_ => res.json({ state: "failed", reason: "backend error" }))
                } else {
                    res.json({ state: "failed", reason: "backend error" })
                }
            })
            .catch(e => {
                res.json({ state: "failed", reason: "backend error" })
            })
        } else {
            res.json({ state: "success" })
        }
    }
})

adminApi.get("/ads", async (_, res) => {
    const snapshot = await getDoc(doc(table.admin, "ads"))
    if (snapshot.exists()) {
        let dataObj = Object(snapshot.data())
        let data:{index: string, image: string, link:string, message:string}[] = []
        Object.keys(dataObj).forEach(i => {
            data.push({index: i, ...dataObj[i]})
        }) 
        data.reverse()
        res.json({ state: "success", data })
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.get("/auth", async (_, res) => {
    const snapshot = await getDoc(doc(table.admin, "auth"))
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        res.json({ state: "success", data })
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.post("/auth", async (req, res) => {
    let { username, password } = req.body as { username:string, password:string }
    setDoc(doc(table.admin, "auth"), { username, password })
    .then(_ => res.json({ state: "success", data: { username, password } }))
    .catch(_ => res.json({ state: "failed", reason: "backend error" }))
})

adminApi.get("/users", async (_, res) => {
    let snapshot = await getDocs(query(table.user))
    let parseDoc = snapshot.docs.map(value => ({ id: value.id, username: value.data()["username"], email: value.data()["email"]}))
    res.json( parseDoc )
})

export default adminApi