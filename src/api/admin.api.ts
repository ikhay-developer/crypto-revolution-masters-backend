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

adminApi.get("/ads", async (_, res) => {
    const snapshot = await getDoc(doc(table.admin, "ads"))
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
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
    const snapshot = await getDoc(doc(table.admin, "auth"))
    const { password, username } = req.body as {password: string, username:string }
    if (snapshot.exists()) {
        let data = Object(snapshot.data())
        if (data["password"] == password && data["username"] == username) {
            res.json({ state: "success" })
        } else if (data["username"] != username && data["password"] != password) {
            res.json({ state: "failed", reason: "incorrect username and password" })
        } else if (data["password"] != password) {
            res.json({ state: "failed", reason: "incorrect password" })
        } else if (data["username"] != username) {
            res.json({ state: "failed", reason: "incorrect username" })
        }
    } else {
        res.json({ state: "failed", reason: "backend error" })
    }
})

adminApi.put("/auth", async (req, res) => {
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