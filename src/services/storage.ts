import { 
    getStorage, 
    ref, 
    uploadBytes,

} from "firebase/storage"
import firebaseApp from "."

const storage = getStorage(firebaseApp)

export async function uploadFile (fileName:string, data:Blob|Uint8Array|ArrayBuffer) {
    let fileRef = await uploadBytes(ref(storage, `/ads-images/${fileName}`), data)
    const { name } = fileRef.metadata
    return {
        name, 
        url: `/ads-images/${fileName}`
    }
}

export default storage
