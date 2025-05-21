import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import components directly using their relative path
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
