import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {DataService, Note} from '../services/data.service';
import {AlertController, ModalController} from '@ionic/angular';
import {ModalPage} from '../modal/modal.page';
import {Auth} from '@angular/fire/auth';
import {AuthService} from '../services/auth.service';
import {addDoc, collection, Firestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @Input() id: string;
  note: Note = null;
  notes: Note[] = [];

  constructor(private dataService: DataService,  private cd: ChangeDetectorRef, private alertCtrl: AlertController,
              private modalCtrl: ModalController, private auth: Auth, private authService: AuthService,
              private firestore: Firestore) {
    this.dataService.getNotes().subscribe(res => {
      this.notes = res;
      this.cd.detectChanges();
    });
  }

  async addNote() {
    const logInUserEmail = this.authService.getUserEmail();
    console.log('userEmail', logInUserEmail);
    const alert = await this.alertCtrl.create({
      header: 'Add Note',
      inputs: [
        {
          name: 'title',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'text',
          placeholder: 'Learn Ionic',
          type: 'textarea'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Add',
          handler: res => {
            this.dataService.addNote({ text: res.text, title: res.title, userEmail: logInUserEmail });
          }
        }
      ]
    });

    await alert.present();
  }

  async openNote(note: Note) {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: { id: note.id },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });

    await modal.present();
  }

  doneOrder(note: Note){

    this.dataService.deleteNote(note);

    //this.modalCtrl.dismiss();
  }
  logout(){
    this.authService.logout();
  }

  addMessage(chatId,msg){
    const userId = this.authService.getUserId();
    const messages = collection(this.firestore, `chats/${chatId}/messages`);
    return addDoc( messages, {
      from: userId,
      msg
    });
  }

}
