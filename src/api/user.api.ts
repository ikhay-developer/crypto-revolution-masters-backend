import axios from "axios"
import "dotenv/config"
import { Router } from "express"
import { 
    doc,
    DocumentData,
    getDocs, 
    getDoc,
    query, 
    QueryDocumentSnapshot, 
    deleteDoc,
    setDoc, 
    where 
} from "firebase/firestore"
import { table } from "../services/database"

interface UserDetail {
    password: string,
    username: string,
    email: string
}

const resetPasswordEmailHtml = (resetCode:string) => {
    return `<h2>CryptoRM password reset</h2>
    <p style="line-height: 30px;">Sorry for the lost your password. But don't be alarmed, just use this code to reset your password:</p>
    <h1>${resetCode}</h1>
    <P>Note that this code will expire after 1 hour</P>`
}

const userApi:Router = Router()

userApi.post("/:id/portfolio/sell", async (req, res) => {
    let id = req.params.id
    let { name, amount, time } = req.body as { name:string, amount:number, time:string, "current price":number }
    let snapshot = await getDoc(doc(table.user, id))
    if (snapshot.exists()) {
        name = name.toLowerCase() 
        let userData = snapshot.data() as any
        userData["transaction"] = [
            {
                name: name, 
                amount,
                time,
                action: "sell",
                "current price": req.body["current price"]
            }, 
            ...userData["transaction"]
        ] 
        if (name in userData["assets"]) {
            userData["assets"][name] = (userData["assets"][name] - amount) > 0 ? userData["assets"][name] - amount : 0
        }
        setDoc(doc(table.user, id), userData)
        .then(_ => {
            res.json({ state: "success" })
        })
        .catch(_ => {
            res.json({ state: "failed", reason: "backend error" })
        })
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
}) 

userApi.post("/:id/portfolio/buy", async (req, res) => {
    let id = req.params.id
    let { name, amount, time } = req.body as { name:string, amount:number, time:string, "current price":number }
    let snapshot = await getDoc(doc(table.user, id))
    if (snapshot.exists()) {
        name = name.toLowerCase() 
        let userData = snapshot.data() as any
        userData["transaction"] = [
            {
                name: name, 
                amount,
                time,
                action: "buy",
                "current price": req.body["current price"]
            }, 
            ...userData["transaction"]
        ] 
        if (name in userData["assets"]) {
            userData["assets"][name] = userData["assets"][name] + amount
        } else {
            userData["assets"][name] = amount
        }
        setDoc(doc(table.user, id), userData)
        .then(_ => {
            res.json({ state: "success" })
        })
        .catch(_ => {
            res.json({ state: "failed", reason: "backend error" })
        })
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.get("/:id/portfolio", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    try {
        let snapshot = await getDoc(doc(table.user, id))
        if (snapshot.exists()) {
            let assets = (snapshot.data() as any)["assets"] as {[name:string]: number}
            let assetsCoins = Object.keys(assets)
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data
                    .filter(({ name }) => assetsCoins.includes(name.toLowerCase()))
                    .map(value => (
                            {
                                ...value, 
                                amount: assets[value.name.toLowerCase()], 
                                amount_in_current_price: assets[value.name.toLowerCase()] * value.current_price
                            }
                        )
                    )
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } else {
            res.json({ state: "failed", reason: "user doesn't exist" })
        }
    } catch (error) {
        res.json({ state: "failed", reason: "backend error" })
    }
})

userApi.get("/:id/favourite-coins", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    try {
        let snapshot = await getDoc(doc(table.user, id))
        if (snapshot.exists()) {
            let favouriteCoins = (snapshot.data() as any)["favourite coins"] as Array<string>
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                data = data.filter(({ name }) => favouriteCoins.includes(name.toLowerCase()))
                res.json({ state: "success", data })
            } else {
                throw new Error()
            }
        } else {
            res.json({ state: "failed", reason: "user doesn't exist" })
        }
    } catch (error) {
        res.json({ state: "failed", reason: "backend error" })
    }
})

userApi.post("/:id/favourite-coins", async (req, res) => {
    let id = req.params.id
    let favouriteCoins = req.body as Array<string>
    favouriteCoins = favouriteCoins.map(value => value.toLowerCase())
    let docRef = doc(table.user, id)
    let snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
        let userData = snapshot.data() as any
        userData["favourite coins"] = favouriteCoins
        setDoc(docRef, userData)
        .then(_ => {
            res.json({ state: "success" })
        })
        .catch(_ => {
            res.json({ state: "failed", reason: "backend error" })
        })
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    } 
})

userApi.put("/:id", async (req, res) => {
    let id:string = req.params.id
    const docRef = doc(table.user, id)
    const docSnap = await getDoc(docRef)
    let state = "failed"
    let reason:string = "username and email already in use"
    let shouldEditUserName:boolean = false
    let shouldEditEmail:boolean = false
    if (docSnap.exists()) {
        let { username, password, email } = req.body as UserDetail
        if (username != undefined) {
            let q = query(table.user, where("username", "==", username))
            const snapshot = await getDocs(q)
            if (snapshot.empty) {
                shouldEditUserName = true
            } else {
                if (snapshot.docs.at(0)?.id == id) {
                    shouldEditUserName = true
                } else {
                    shouldEditUserName = false
                    reason = "username already in use"
                }
            }
        } else if (username == undefined) {
            username = docSnap.data().username
            shouldEditUserName = true
        }
        if (email != undefined) {
            let q = query(table.user, where("email", "==", email))
            const snapshot = await getDocs(q)
            if (snapshot.empty) {
                shouldEditEmail = true
            } else {
                if (snapshot.docs.at(0)?.id == id) {
                    shouldEditEmail = true
                } else {
                    shouldEditEmail = false
                    reason = "email already in use"
                }
            }
        } else if (email == undefined) {
            email = docSnap.data().email
            shouldEditEmail = true
        }
        if (!shouldEditUserName && !shouldEditEmail)
            reason = "username and email already in use"
        let shouldEditUserDetail:boolean = shouldEditEmail && shouldEditUserName
        password = password == undefined ? docSnap.data().password : password
        let favourite_coins = docSnap.data()["favourite coins"]
        let transaction = docSnap.data()["transaction"]
        let assets = docSnap.data()["assets"]
        if (shouldEditUserDetail) {
            setDoc(docRef, { username, password, email, transaction, assets, "favourite coins": favourite_coins })
            .then(() => {
                state = "success"
                res.json({data: { id, email, password, username }, state})
            })
            .catch(() => {
                state = "failed"
                res.json({state, reason: "backend error"})
            }) 
        } else {
            state = "failed"
            res.json({state, reason})
        }
    } else {
        res.json({ state, reason: "user doesn't not exist"})
    }
})

userApi.delete('/:id', async (req, res) => {
    let id:string = req.params.id
    const docRef = doc(table.user, id)
    let state = "failed"
    deleteDoc(docRef)
    .then(() => {
        state = "success"
        res.json({ state })
    })
    .catch(() => {
        res.json({state, reason: "backend error"})
    })
})

userApi.get("/:id", async (req, res) => {
    let id = req.params.id
    let snapshot = await getDoc(doc(table.user, id))
    if (snapshot.exists()) {
        let { username, email, password } = snapshot.data() as any
        res.json({ state: "success", data: { username, email, password } })
    } else {
        res.json({ state: "failed", reason: "user doesn't exist" })
    }
})

userApi.post("/login", async (req, res) => {
    const { password, email_or_username } = req.body as { password:string, email_or_username:string }
    let state = "failed"
    const queryEmail = query(table.user, where("email", "==", email_or_username), where("password", "==", password))
    const queryUsername = query(table.user, where("username", "==", email_or_username), where("password", "==", password))
    const snapshotQueryEmail = await getDocs(queryEmail)
    const snapshotQueryUsername = await getDocs(queryUsername)
    if (!snapshotQueryUsername.empty) {
        let doc = snapshotQueryUsername.docs.at(0) as QueryDocumentSnapshot<DocumentData>
        state = "success"
        let data = { 
            id: doc.id, 
            email: doc.data().email, 
            password: doc.data().password, 
            username: doc.data().username 
        }
        res.json({ data , state })
    } else if (!snapshotQueryEmail.empty) {
        let doc = snapshotQueryEmail.docs.at(0) as QueryDocumentSnapshot<DocumentData>;8
        state = "success"
        let data = { 
            id: doc.id, 
            email: doc.data().email, 
            password: doc.data().password, 
            username: doc.data().username 
        }
        res.json({ data , state })
    } else {
        res.json({ state, reason: "invalided details" })
    }
})

userApi.post("/signin", async (req, res) => {
    const { email, username, password } = req.body as UserDetail
    let state = "failed"
    const queryEmail = query(table.user, where("email", "==", email))
    const queryUsername = query(table.user, where("username", "==", username))
    const snapshotQueryEmail = await getDocs(queryEmail)
    const snapshotQueryUsername = await getDocs(queryUsername)
    if (snapshotQueryEmail.empty && snapshotQueryUsername.empty) {
        let size:number = (await getDocs(table.user)).size
        let id:string = (size + 1).toString()
        setDoc(doc(table.user, id), { email, password, username, transaction: [], assets:{}, "favourite coins": []})
        .then(() => {
            state = "success"
            res.json({data: { id, email, password, username }, state})
        }).catch(() => {
            state = "failed"
            res.json({state, reason: "backend error"})
        })
    } else if (!snapshotQueryEmail.empty) {
        res.json({ state, reason: "email already exist" })
    } else if (!snapshotQueryUsername.empty) {
        res.json({ state, reason: "username already exist" })
    } else {
        res.json({ state, reason: "unknown error" }) 
    }
})

export default userApi