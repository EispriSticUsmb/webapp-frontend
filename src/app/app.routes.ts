import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { EventComponent } from './features/event/event/event.component';
import { ListEventsComponent } from './features/event/list-events/list-events.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { ContactComponent } from './features/public/contact/contact.component';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { ShopRedirectComponent } from './features/redirect/shop.component';
import { DiscordRedirectComponent } from './features/redirect/discord.component';
import { TeamComponent } from './features/team/team.component';
import { authGuard } from './core/auth/authGuard';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { PrivacyComponent } from './features/legal/pages/privacy.component/privacy.component';
import { LegalNoticeComponent } from './features/legal/pages/legal-notice.component/legal-notice.component';

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
        title: 'Profile | EISPRI STIC',
        children: [
            { path: '', component: ProfileComponent, canActivate: [authGuard]},
            { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard]}
        ],
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
        path: 'privacy',
        component: PrivacyComponent,
    },
    {
        path: 'legalNotice',
        component: LegalNoticeComponent,
    },
    {
        path: 'team',
        children: [
            {
                path: ':id', component: TeamComponent,
            }
        ],
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
