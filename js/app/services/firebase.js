

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js';
import { collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD3dHAP1oSv74Hd7aIeVqb-hVQif4TFzdQ",
    authDomain: "flixle-bdf0d.firebaseapp.com",
    projectId: "flixle-bdf0d",
    storageBucket: "flixle-bdf0d.appspot.com",
    messagingSenderId: "981575520879",
    appId: "1:981575520879:web:1659a0621e118e093af39a",
    measurementId: "G-P8P893DC9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestore instance

let currentAnswerId = "";

export const today = new Date();

export const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  

export async function persistAnswer(answerObj) {
    try {
        answerObj.createdAt = Timestamp.now();
        console.log(answerObj);
        const docRef = await addDoc(collection(db, "answers"), answerObj);
        currentAnswerId = docRef.id;
        //console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Function to check if a Firestore document's timestamp is from today
export async function getCurrentAnswer() {
    const today = new Date();

    try {
        // Get all documents from the "answers" collection
        const querySnapshot = await getDocs(collection(db, "answers"));

        // Find a document created today
        const currentAnswer = querySnapshot.docs.find((doc) => {
            // Check if `createdAt` exists
            const createdAt = doc.data().createdAt;

            if (createdAt) {
                // Convert `createdAt` to a JavaScript Date and compare with `today`
                return isSameDay(today, createdAt.toDate());
            } else {
                console.log("Document doesn't have a 'createdAt' timestamp");
                return null;  // Return false to indicate this document is not from today
            }
        });

        if (currentAnswer) {
            return currentAnswer.data();  // Return the document if found
        } else {
            return null;  // Return null if no document is from today
        }
    } catch (e) {
        console.error('Error getting current answer: ', e);
        throw e;  // Re-throw the error for proper handling
    }
}





/* 
// Reference to a collection (will create if doesn't exist)
const collectionRef = db.collection('flixle'); */

export { app, db, collection, getDocs, Timestamp, addDoc };
export { query, orderBy, limit, where, onSnapshot };
