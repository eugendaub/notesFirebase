import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {addDoc, collection, Firestore} from '@angular/fire/firestore';
import {DataService, Note} from '../../services/data.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';

export interface Table {
  id?: string;
  tableNr: string;
}

@Component({
  selector: 'app-login-table',
  templateUrl: './login-table.page.html',
  styleUrls: ['./login-table.page.scss'],
})
export class LoginTablePage implements OnInit {

  credentialsForm: FormGroup;


  constructor( private alertCtrl: AlertController,
               private modalCtrl: ModalController,
               private dataService: DataService,
               private router: Router,
               private firestore: Firestore,
               private fb: FormBuilder,
               private loadingCtrl: LoadingController,
               private authService: AuthService){ }

  ngOnInit() {
    this.credentialsForm = this.fb.group({
      email: ['a@a.de', [Validators.email, Validators.required]],
      password: ['111111', [Validators.minLength(6), Validators.required]]
    });
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.signup(this.credentialsForm.value).then(_ => {
      loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
      const logInUserEmail = this.authService.getUserEmail();
      const logInUserId= this.authService.getUserId();
      this.dataService.createOrderForUser(logInUserId, logInUserEmail);
    }, async err => {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Signup failed',
        message: 'Please try again later. Reason: ' + err,
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.login(this.credentialsForm.value).then(user => {
      console.log(user);

      loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }, async err => {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message,
        buttons: ['OK']
      });
      await alert.present();
    });
  }





  async addTable() {
    const alert = await this.alertCtrl.create({
      header: 'Add Table',
      inputs: [
        {
          name: 'title',
          placeholder: 'Add Table number',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Add',
          handler: res => {
            this.dataService.addTable({table: res.title});
            this.router.navigateByUrl('/home', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();

  }


}
