import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginTablePage } from './login-table.page';

const routes: Routes = [
  {
    path: '',
    component: LoginTablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginTablePageRoutingModule {}
