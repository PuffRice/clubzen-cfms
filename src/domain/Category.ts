export interface Category {
  id: number;
  groupId: number;
  name: string;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}