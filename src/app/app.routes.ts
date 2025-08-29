import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { EventComponent } from './features/event/event/event.component';
import { ListEventsComponent } from './features/event/list-events/list-events.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { ContactComponent } from './features/public/contact/contact.component';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { AuthGuard } from './core/auth/authGuard';
import { adminGuard } from './core/auth/adminGuard';
import { ShopRedirectComponent } from './features/auth/pages/redirect/shop.component';
import { DiscordRedirectComponent } from './features/auth/pages/redirect/discord.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Accueil | EISPRI STIC',
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: 'Contact | EISPRI STIC',
    },
    {
        path: 'login',
        component: AuthComponent,
        title: 'Authentification | EISPRI STIC',
    },
    {
        path: 'register',
        component: AuthComponent,
        title: 'Authentification | EISPRI STIC',
    },
    {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile | EISPRI STIC',
        canMatch: [AuthGuard],
        canActivate: [AuthGuard],
    },
    {
        path: 'event',
        children: [
            { path: '', redirectTo: '/events', pathMatch: 'full'},
            { path: ':id', component: EventComponent }
        ],
    },
    {
        path: 'events',
        component: ListEventsComponent,
        title: "Événements | EISPRI STIC"
    },
    {
        path: 'boutique',
        component: ShopRedirectComponent,
    },
    {
        path: 'discord',
        component: DiscordRedirectComponent,
    },
    {
        path: '**',
        component: NotFoundComponent,
        title: 'Page non trouvée | EISPRI STIC'
    },
];
