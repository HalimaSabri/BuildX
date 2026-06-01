export type UserRole = 'Admin' | 'User';
export type BackendType = 'NodeJS' | 'Laravel';
export type DatabaseType = 'MySQL' | 'PostgreSQL';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  entities: string[];
  relations: string[];
  roles: string[];
  kpis: { label: string; value: string; change: string; positive: boolean }[];
  umlData: {
    classes: { name: string; attributes: string[]; methods: string[] }[];
    links: { from: string; to: string; type: string; label: string }[];
    useCases: { actor: string; cases: string[] }[];
  };
  files: GeneratedFile[];
}

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  templateId: string;
  backendType: BackendType;
  dbType: DatabaseType;
  app: AppTemplate;
  createdAt: string;
}

export interface DatabaseShape {
  users: User[];
  generations: Generation[];
}
