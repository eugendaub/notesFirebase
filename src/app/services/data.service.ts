import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion, arrayRemove, getDoc, serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';

export interface Note {
  id?: string;
  title: string;
  text: string;
  userEmail: string;
}
export interface User{
  id?: string;
  email: string;
  userOrders: [];
}
export interface Order {
  id?: string;
  text: string;
  title: string;
}
export interface Table {
  id?: string;
  table: string;
}


@Injectable({
  providedIn: 'root'
})
export class DataService {
  userOrderId= null;

  constructor(private firestore: Firestore, private auth: AuthService ) { }

  getNotes(): Observable<Note[]> {
    const notesRef = collection(this.firestore, 'notes');
    return collectionData(notesRef, { idField: 'id'}) as Observable<Note[]>;
  }
  getAllSushiOrders(orderId) {
    const notesRef = collection(this.firestore, `orders/${orderId}`);
    return collectionData(notesRef, { idField: 'id'});
  }
  getUsers(): Observable<User[]> {
    const notesRef = collection(this.firestore, 'users');
    return collectionData(notesRef, { idField: 'id'}) as Observable<User[]>;
  }
  getUserContentDataWithUserId(userId) {
    const notesRef = doc(this.firestore, `users/${userId}`);
    return docData(notesRef, { idField: 'id'});
  }
  getChatInfo(chatId){
    const chat = doc(this.firestore, `orders/${chatId}`);
    return docData(chat);
  }
  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
  }

  getNoteById(id): Observable<Note> {
    const noteDocRef = doc(this.firestore, `notes/${id}`);
    return docData(noteDocRef, { idField: 'id' }) as Observable<Note>;
  }

  addNote(note: Note) {
    const notesRef = collection(this.firestore, 'notes');
    return addDoc(notesRef, note);
  }

  addMessage(note: Note) {
    const userId = this.auth.getUserId();
    const messages = collection(this.firestore, `chats/${userId}/messages`);
    return addDoc(messages, note);
  }
  addMessageToTable(note: Note) {
    const userId = this.auth.getUserId();
    const messages = collection(this.firestore, `table/${userId}/messages`);
    return addDoc(messages, note);
  }

  addTable(table: Table) {
    const notesRef = collection(this.firestore, 'table');
    return addDoc(notesRef, table);
  }

  deleteNote(note: Note) {
    const noteDocRef = doc(this.firestore, `notes/${note.id}`);
    return deleteDoc(noteDocRef);
  }
  deleteUserDocument(userId) {
    const noteDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(noteDocRef);
  }

  deleteOrder(note: Note) {
    const noteDocRef = doc(this.firestore, `orders/${note.id}`);
    return deleteDoc(noteDocRef);
  }

  deleteOrderAndUserOrders(note: Note) {
    const userId = this.auth.getUserId();
    console.log('uerID: ', userId);
    console.log('note: ', note);

    const orderRef = doc(this.firestore, `orders/${note.id}`);
    return deleteDoc(orderRef)
  .then(res => {
      const userRef = doc(this.firestore, `users/${userId}`);
      return updateDoc(userRef, {
        userOrders: arrayRemove(note.id)
      });
    });
  }

  updateNote(note: Note) {
    const noteDocRef = doc(this.firestore, `notes/${note.id}`);
    return updateDoc(noteDocRef, { title: note.title, text: note.text });
  }

  addOrderToUser(logInUserId,logInUserEmail, order: Order){
    const chatsRef = collection(this.firestore, 'orders');
    const userOrder = {
      userid: logInUserId,
      userEmail: logInUserEmail,
      order
    };


    return addDoc(chatsRef, userOrder).then( res => {
      console.log('created order ADDDOC: ', res);
      const groupID = res.id;
      const promises = [];

      // In der DB muss für jeden user der DB eintrag angepasst werden
      // (in diesem Fall in welchen Chats befindet sich der User)


        const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
        const update = updateDoc(userChatsRef, {
          userOrders: arrayUnion(groupID)
        });
        promises.push(update);
      return Promise.all(promises);
    });
  }
  addOrderwithText(logInUserId,logInUserEmail){
    //const chatsRef = collection(this.firestore, 'orders');
    const userOrder = {
      userid: logInUserId,
      userEmail: logInUserEmail
    };
    const urlLink = doc(this.firestore, `users/${logInUserId}`);
    console.log('urlLink: ', urlLink);

    return getDoc(urlLink).then( res => {
      console.log('getDoc: ', res);
      const groupID = res.id;
      const promises = [];

      console.log('res.id: ', res.id);
      // In der DB muss für jeden user der DB eintrag angepasst werden
      // (in diesem Fall in welchen Chats befindet sich der User)


      const userChatsRef = doc(this.firestore, `users/${logInUserId}`);

      //promises.push(update);
      return Promise.all(promises);
    });
  }
  addUserOrdersToCollection(logInUserId, logInUserEmail, order: Order){
    this.getUserContentDataWithUserId(logInUserId).subscribe(res => {
      this.userOrderId = res.userOrders;
      console.log('userOrderID: ', this.userOrderId);
    });
    const messages = collection(this.firestore, `orders/${this.userOrderId}/sushiOrder`);
    return addDoc( messages, {
      userid: logInUserId,
      userEmail: logInUserEmail,
      order,
      createdAt: serverTimestamp()
    });
  }

  createOrderForUser(logInUserId,logInUserEmail){
    const chatsRef = collection(this.firestore, 'orders');
    const chat = {
      userid: logInUserId,
      userEmail: logInUserEmail
    };

    return addDoc(chatsRef, chat).then( res => {
      console.log('created order ADDDOC: ', res);
      const groupID = res.id;
      const promises = [];

      // In der DB muss für jeden user der DB eintrag angepasst werden
      // (in diesem Fall in welchen Chats befindet sich der User)


      const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
      const update = updateDoc(userChatsRef, {
        userOrders: arrayUnion(groupID)
      });
      promises.push(update);
      return Promise.all(promises);
    });
  }

  addOrder(chatId,msg){
    const userId = this.auth.getUserId();
    const messages = collection(this.firestore, `orders/${chatId}/userOrder`);
    return addDoc( messages, {
      from: userId,
      msg
    });
  }





}
