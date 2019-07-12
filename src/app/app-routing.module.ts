import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'contact-update', loadChildren: './contacts/contact-update/contact-update.module#ContactUpdatePageModule' },
  { path: 'multi-attr', loadChildren: './multi-attr/multi-attr.module#MultiAttrPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
