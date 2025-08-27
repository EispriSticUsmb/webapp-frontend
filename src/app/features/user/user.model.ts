export type UserRole = 'ADMIN' | 'USER' | 'MEMBRE';
export type UserType = 'ETUDIANT' | 'ENSEIGNANT' | 'ANCIEN' | 'AUTRE';

export interface User {
  id?: string;
  email?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role?: UserRole;
  createdAt?: Date;
  hasVerifiedEmail?: boolean;
  userType: UserType;
}
