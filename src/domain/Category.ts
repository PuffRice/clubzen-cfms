export interface Category {
  id: number;
  groupId: number;
  name: string;
  color?: string | null;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}