export interface Event {
    currentParticipants: number;
    id: string;
    title: string;
    descriptionSummary: string | null;
    description: string;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    registrationStart: Date | null;
    registrationEnd: Date | null;
    maxParticipants: number | null;
    allowTeams: boolean;
    maxTeamSize: number | null;
    externalLink: string | null;
    teams: {
        id: string;
        createdAt: Date;
        name: string;
        eventId: string;
        leaderId: string;
    }[];
}