export interface User {
  id: string;
  name: string;
  username: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked the post
}

export interface PostFormData {
  content: string;
}

export type FilterType = 'all' | 'mine' | 'liked';

export interface PostFilters {
  search: string;
  filter: FilterType;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email?: string;
}

export interface LoginFormData {
  username: string;
}

export interface SignupFormData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
