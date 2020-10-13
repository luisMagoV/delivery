import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfilePage} from './profile.page';
import {ContactPage} from './contact/contact';
import {HelpPage} from './help/help';
import {FaqPage} from './faq/faq';
import {FavoritesPage} from './favorites/favorites';
import {ProfileEditPage} from './edit/profile-edit';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'contact',
    component: ContactPage,
  },
  {
    path: 'help',
    component: HelpPage,
  },
  {
    path: 'faq',
    component: FaqPage,
  },
  {
    path: 'favorites',
    component: FavoritesPage,
  },
  {
    path: 'edit',
    component: ProfileEditPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
