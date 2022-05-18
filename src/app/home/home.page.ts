import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {DataService, Note} from '../services/data.service';
import {AlertController, ModalController} from '@ionic/angular';
import {ModalPage} from '../modal/modal.page';
import {Auth} from '@angular/fire/auth';
import {AuthService} from '../services/auth.service';
import {addDoc, collection, Firestore} from '@angular/fire/firestore';
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @Input() id: string;
  note: Note = null;
  notes: Note[] = [];
  messages = [];
  chatId = null;
  currentUserId = null;
  users = null;
  chatInfo = null;
  allOrders= [];

  constructor(private dataService: DataService,  private cd: ChangeDetectorRef, private alertCtrl: AlertController,
              private modalCtrl: ModalController, private auth: Auth, private authService: AuthService,
              private firestore: Firestore, private route: ActivatedRoute) {
    //Get All Notes
    this.dataService.getNotes().subscribe(res => {
      this.notes = res;
      this.cd.detectChanges();
    });
    //Get All Order ID
    this.dataService.getAllOrderId().subscribe(res =>{
      this.allOrders= res;
    });
    this.chatId = this.route.snapshot.paramMap.get('chatid');
    console.log('CHAT ID: ', this.chatId);


    /*
    this.chatId = this.route.snapshot.paramMap.get('chatid');
    this.currentUserId = this.authService.getUserId();

    console.log('My Chat: ', this.chatId);
    this.dataService.getChatInfo(this.chatId).pipe(
      switchMap( info => {
        this.users = {};
        this.chatInfo = info;

        for (const user of info.users){
          this.users[user.id]= user.email;
        }
        console.log('info: ', this.users);
        return this.chatService.getChatMessages(this.chatId);
      }),
      map(messages => messages.map(msg=>{
        msg.fromUser = this.users[msg.from] || 'Deleted';
        return msg;
      }))
    ).subscribe(res => {
      console.log('FIN: ', res);

          this.messages.push(res);
    });*/

  }

  async addNote() {
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId= this.authService.getUserId();
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
            //this.dataService.addNote({ text: res.text, title: res.title, userEmail: logInUserEmail });
            //this.dataService.addMessage({ text: res.text, title: res.title, userEmail: logInUserEmail });
            //this.dataService.addMessageToTable({ text: res.text, title: res.title, userEmail: logInUserEmail });
            this.dataService.addOrderToUser(logInUserId);
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
