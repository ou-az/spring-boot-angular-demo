import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import standalone components
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductFormComponent },
  { path: ':id', component: ProductDetailComponent },
  { path: ':id/edit', component: ProductFormComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ProductsModule { }
