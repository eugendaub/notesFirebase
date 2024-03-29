import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential
  , signInWithEmailAndPassword, onAuthStateChanged,signOut } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserData = null;
  logout$: Subject<boolean> = new Subject<boolean>();

  constructor(private auth: Auth, private firestore: Firestore, private router: Router
  ) {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        docData(userDoc, { idField: 'id' }).pipe(
          takeUntil(this.logout$)
        ).subscribe(data => {
          this.currentUserData = data;
        })
      } else {
        this.currentUserData = null;
      }
    });
  }

  login({email, password}) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup({ email, password }): Promise<UserCredential> {
    try {
      const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
      const userDoc = doc(this.firestore, `users/${credentials.user.uid}`);
      await setDoc(userDoc, { email, order: [] });

      return credentials;
    } catch(err) {
      throw(err);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.logout$.next(true);


    this.router.navigateByUrl('/', {replaceUrl: true});
  }

  async deleteUser() {
    const user = this.auth.currentUser;
    await user?.delete();
    this.logout$.next(true);


    this.router.navigateByUrl('/', {replaceUrl: true});
  }

  getUserId(){
    return this.auth.currentUser.uid;
  }

  getUserEmail(){
    return this.currentUserData.email;
  }
}
