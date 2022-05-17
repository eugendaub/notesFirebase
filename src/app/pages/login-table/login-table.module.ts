import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginTablePageRoutingModule } from './login-table-routing.module';

import { LoginTablePage } from './login-table.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginTablePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LoginTablePage]
})
export class LoginTablePageModule {}
