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
import { createTransport } from "nodemailer"
import { table } from "../services/database"

interface UserProfileTransactionData {
    amount: number,
    "current price": number,
    action: "buy"|"sell"
    time: string
}

interface UserProfileData {
    name: string
    amount: number,
    transactions: Array<UserProfileTransactionData>
}

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

// userApi.post("/:id/reset_code", async (req, res) => {
//     let id = req.params.id
//     let { resetCode } = req.body as  { resetCode: string }
//     let state = "failed"
//     let snapshot = await getDoc(doc(table.user, id))
//     if (snapshot.exists()) {
//         let userData = snapshot.data() as any
//         if (userData["recovery code"] == resetCode) {
//             userData["recovery code"] = "00000"
//             setDoc(doc(table.user, id), userData)
//             .then(_ => {
//                 res.json({ state: "success" })
//             })
//             .catch(_ => {
//                 res.json({ state, reason: "backend error" })
//             })
//         } else {
//             res.json({ state, reason: "incorrect reset code" })
//         }
//     } else {
//         res.json({ state, reason: "user doesn't exist" })
//     }

    
// })

userApi.get("/:id/profile", async (req, res) => {
    let id = req.params.id
    let url = `${req.protocol}://${req.headers.host}`
    try {
        let snapshot = await getDoc(doc(table.user, id))
        if (snapshot.exists()) {
            let profile = (snapshot.data() as any)["profile"] as Array<UserProfileData>
            let coins = await axios.get(`${url}/${process.env.API_SECRET_KEY}/coins`)
            if (coins.data.state == "success") {
                let data = coins.data.data as Array<any>
                let coinsInProfile:Array<string> = profile.map(({ name }) => name.toLowerCase())
                data = data.filter(({ name }) =>  coinsInProfile.includes(name.toLowerCase()))
                data.forEach((value, index) => {
                    let { amount, transactions } = profile.filter(({name}) => name.toLowerCase() == value.name.toLowerCase()).at(0) as UserProfileData
                    data[index] = {...value, amount, transactions }
                })
                data = data.filter(value => value.amount > 0)
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

userApi.post("/:id/profile/buy", async (req, res) => {
    let id = req.params.id
    let { name, transaction } = req.body as { name:string, transaction: UserProfileTransactionData }
    let docRef = doc(table.user, id)
    let snapshot = await getDoc(doc(table.user, id))
    if (snapshot.exists()) {
        let userData = snapshot.data() as any
        let userProfile = userData["profile"] as Array<UserProfileData>
        userProfile = userProfile.map(value => ({ ...value, name: value.name.toLocaleLowerCase() }))
        let filteredUserProfile = userProfile.filter(value => value.name == name)
        if (filteredUserProfile.length <= 0) {
            userProfile.push({
                name: name.toLocaleLowerCase(),
                amount: transaction.amount,
                transactions: [transaction]
            })
        } else {
            userProfile.forEach((value, index) => {
                if (value.name.toLocaleLowerCase() == name.toLocaleLowerCase()) {
                    userProfile[index] = {
                        amount: value.amount + transaction.amount,
                        name: value.name.toLocaleLowerCase(),
                        transactions: [transaction, ...value.transactions]
                    }
                }
            })
        }
        userData["profile"] = userProfile
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

userApi.post("/:id/profile/sell", async (req, res) => {
    let id = req.params.id
    let { name, transaction } = req.body as { name:string, transaction: UserProfileTransactionData }
    let docRef = doc(table.user, id)
    let snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
        let userData = snapshot.data() as any
        let userProfile = userData["profile"] as Array<UserProfileData>
        userProfile = userProfile.map(value => ({ ...value, name: value.name.toLocaleLowerCase() }))
        let filteredUserProfile = userProfile.filter(value => value.name == name)
        if (filteredUserProfile.length > 0) {
            userProfile.forEach((value, index) => {
                if (value.name.toLocaleLowerCase() == name.toLocaleLowerCase()) {
                    userProfile[index] = {
                        amount: value.amount - transaction.amount <= 0 ? 0 : value.amount - transaction.amount,
                        name: value.name.toLocaleLowerCase(),
                        transactions: [transaction, ...value.transactions]
                    }
                }
            })
        }
        userData["profile"] = userProfile
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

userApi.get("/:id/reset_code", (req, res) => {
    let id = req.params.id
    let { email } = req.body as { email: string }
    let password_reset_code:string = Math.floor((19999 + (Math.random() * (99999 - 19999)))).toString()
    let state = "failed"
    let mailTransporter = createTransport({
        host: process.env.SENDER_HOST,
        secure: false,
        tls: {
            ciphers:'SSLv3'
        },
        auth: {
            user: process.env.SENDER_AUTH_USER,
            pass: process.env.SENDER_AUTH_PASSWORD
        }
    })
    mailTransporter.sendMail(
        {
            from: "crypto-revolution-masters@outlook.com",
            to: email,
            subject: "Reset password on Crypto Revolution Masters app",
            html: resetPasswordEmailHtml(password_reset_code)
        },
        async (err) => {
            if (err) {
                console.log(err.message)
                res.json({ state, reason: "backend error" })
            } else {
                let snapshot = await getDoc(doc(table.user, id))
                let userData = snapshot.data() as any
                userData["recovery code"] = password_reset_code
                setDoc(doc(table.user, id), userData)
                .then(_ => {
                    state = "success"
                    res.json({ state })
                    userData["recovery code"] = "00000"
                    setTimeout(_ => setDoc(doc(table.user, id), userData), 3600000)
                })
                .catch(_ => {
                    res.json({ state, reason: "backend error" })
                })
            }
        }
    )
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
        let recovery_code = docSnap.data()["recovery code"]
        let favourite_coins = docSnap.data()["favourite coins"]
        let profile = docSnap.data()["profile"]
        if (shouldEditUserDetail) {
            setDoc(docRef, { username, password, email, profile, "recovery code": recovery_code, "favourite coins": favourite_coins })
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
        setDoc(doc(table.user, id), {email, password, username, "profile": [], "favourite coins": [], "recovery code": "00000"})
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