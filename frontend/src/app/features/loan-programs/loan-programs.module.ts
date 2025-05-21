import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoanProgramsComponent } from './components/loan-programs/loan-programs.component';
import { ProgramDetailComponent } from './components/program-detail/program-detail.component';
import { RateCalculatorComponent } from './components/rate-calculator/rate-calculator.component';

const routes: Routes = [
  { path: '', component: LoanProgramsComponent },
  { path: 'detail/:id', component: ProgramDetailComponent },
  { path: 'calculator', component: RateCalculatorComponent }
];

@NgModule({
  declarations: [
    LoanProgramsComponent,
    ProgramDetailComponent,
    RateCalculatorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LoanProgramsModule { }
