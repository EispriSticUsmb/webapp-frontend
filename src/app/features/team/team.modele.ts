import { Event, EventParticipant } from "../event/event/event.model";
import { User } from "../user/user.model";

export interface Team {
  id: string;
  name: string;

  event: Event;
  eventId: string;

  leader: User;
  leaderId: string;

  members?: EventParticipant[];
  invitations?: TeamInvitation[];

  createdAt: Date;
}
export interface TeamInvitation {
  id: string;

  team: Team;
  teamId: string;

  event: Event;
  eventId: string;

  invited: User;
  invitedId: string;

  invitedBy: User;
  invitedById: string;

  respondedAt?: Date;
  createdAt: Date;
}