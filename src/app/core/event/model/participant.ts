export type EventParticipant = {
  id: string;
  eventId: string;
  userId: string;
  additionalInfo: string | null;
  teamId: string | null;
  createdAt: Date;

  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
};