import { 
    getStorage, 
    ref, 
    uploadBytes,

} from "firebase/storage"
import firebaseApp from "."

const storage = getStorage(firebaseApp)

export async function uploadFile (fromUrl:string, fileName:string,  destination:string, data:Blob|Uint8Array|ArrayBuffer): Promise<string> {
    let timeStamp = new Date().toISOString()
    fileName = `${fileName}_${timeStamp}`
    let fileRef = await uploadBytes(ref(storage, `/${destination}/${fileName}`), data)
    const { name } = fileRef.metadata
    return `${fromUrl}/${destination}/${fileName}`
}

export default storage
