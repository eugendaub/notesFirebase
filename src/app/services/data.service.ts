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
  arrayUnion
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';

export interface Note {
  id?: string;
  title: string;
  text: string;
  userEmail: string;
}
export interface Table {
  id?: string;
  table: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore, private auth: AuthService ) { }

  getNotes(): Observable<Note[]> {
    const notesRef = collection(this.firestore, 'notes');
    return collectionData(notesRef, { idField: 'id'}) as Observable<Note[]>;
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

  updateNote(note: Note) {
    const noteDocRef = doc(this.firestore, `notes/${note.id}`);
    return updateDoc(noteDocRef, { title: note.title, text: note.text });
  }

  addOrderToUser(chatUsers){
    const chatsRef = collection(this.firestore, 'orders');
    const chat = {
      users: chatUsers
    };

    return addDoc(chatsRef, chat).then( res => {
      console.log('created order ADDDOC: ', res);
      const groupID = res.id;
      const promises = [];

      // In der DB muss für jeden user der DB eintrag angepasst werden
      // (in diesem Fall in welchen Chats befindet sich der User)


        const userChatsRef = doc(this.firestore, `users/${chatUsers}`);
        const update = updateDoc(userChatsRef, {
          userOrders: arrayUnion(groupID)
        });
        promises.push(update);
      return Promise.all(promises);
    });
  }



}
