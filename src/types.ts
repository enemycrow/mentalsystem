import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Objective {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface Reflection {
  id: number;
  objective_id: number;
  question_1: string | null;
  question_2: string | null;
  question_3: string | null;
  created_at: string;
}

export interface System {
  id: number;
  objective_id: number;
  purpose: string;
  created_at: string;
}

export interface SystemElement {
  id: number;
  system_id: number;
  name: string;
  description: string | null;
}

export interface SystemInteraction {
  id: number;
  system_id: number;
  element_from_id: number;
  element_to_id: number;
  description: string;
}

export interface AuthRequest extends Request {
  userId?: number;
}
