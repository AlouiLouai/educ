export type UserRole = "student" | "teacher" | "admin";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id?: string;
  title: string;
  teacher: string;
  grade: string;
  level: string;
  price: number;
  rating: number;
  tag: string;
  image: string;
}

export interface PurchasedDocument {
  title: string;
  progress: number;
  subject: string;
}

export interface AdminStat {
  label: string;
  value: string;
  trend: string;
}

export interface SupportTicket {
  subject: string;
  owner: string;
  priority: string;
  priorityKey: string;
}
