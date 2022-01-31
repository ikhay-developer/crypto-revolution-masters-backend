import { 
    getFirestore, 
    CollectionReference, 
    collection,
    Firestore
} from "firebase/firestore"
import firebaseApp from "."

const database:Firestore = getFirestore(firebaseApp)

export const table:{
    user: CollectionReference
    admin: CollectionReference
} = {
    user: collection(database, "user"),
    admin: collection(database, "admin")
}

export default database