// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDUl69TmSbIkuPRdCYs2cjr6DUPJtLKwb4',
  authDomain: 'fir-uploading-project.firebaseapp.com',
  projectId: 'fir-uploading-project',
  storageBucket: 'fir-uploading-project.appspot.com',
  messagingSenderId: '189664382797',
  appId: '1:189664382797:web:5c16867d953e924fc07104',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
