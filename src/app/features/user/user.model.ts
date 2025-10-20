import { EventParticipant } from "../event/event/event.model";
import { Team, TeamInvitation } from "../team/team.modele";

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MEMBRE = 'MEMBRE',
}

export enum UserType {
  ETUDIANT = 'ETUDIANT',
  ENSEIGNANT = 'ENSEIGNANT',
  ANCIEN = 'ANCIEN',
  AUTRE = 'AUTRE',
}

export enum NotificationType {
  TEAM_INVITATION = 'TEAM_INVITATION',
  TEAM_INVITATION_DELETE = 'TEAM_INVITATION_DELETE',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  TEAM_KICK = 'TEAM_KICK',
  GENERAL = 'GENERAL',
}

export enum SiteStatus {
  MAINTENANCE = 'MAINTENANCE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  UNKNOWN = 'UNKNOWN',
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;

  firstName: string;
  lastName: string;

  profileImage?: string;

  role: UserRole;
  hasVerifiedEmail: boolean;
  userType: UserType;

  createdAt: Date;
  updatedAt: Date;

  participations?: EventParticipant[];
  ledTeams?: Team[];

  notifications?: Notification[];
  sentNotifications?: Notification[];

  receivedInvitations?: TeamInvitation[];
  sentInvitations?: TeamInvitation[];

  site?: Site;
}

export interface Notification {
  id: string;

  user: User;
  userId: string;

  fromUser?: User;
  fromUserId?: string;

  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Site {
  id: string;
  status: SiteStatus;
  domain?: string;

  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: string;
}

export interface PartialUser {
  email?: string;

  username?: string;

  firstName?: string;

  lastName?: string;

  userType?: UserType;
}
