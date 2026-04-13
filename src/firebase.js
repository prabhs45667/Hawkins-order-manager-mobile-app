import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Helper function to upload generated pdf Blobs to Firebase
export const uploadPDFToCloud = async (pdfBlob, filename) => {
    try {
        const storageRef = ref(storage, `bills/${filename}`);
        const snapshot = await uploadBytes(storageRef, pdfBlob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
    } catch (e) {
        console.error("Error uploading to Firebase Storage:", e);
        throw e;
    }
}
