import { 
    getStorage, 
    ref, 
    uploadBytes,

} from "firebase/storage"
import firebaseApp from "."

const storage = getStorage(firebaseApp)

export async function uploadFile (fromUrl:string, fileName:string,  destination:string, data:Blob|Uint8Array|ArrayBuffer): Promise<string> {
    let fileRef = await uploadBytes(ref(storage, `/${destination}/${fileName}-${new Date().toISOString()}`), data)
    const { name } = fileRef.metadata
    return `${fromUrl}/${destination}/${fileName}`
}

export default storage
