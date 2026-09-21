export interface BranchOffice {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radius: number; // in meters, default 100
  is_active?: boolean;
  created_at?: string;
}

export type BranchFormData = Omit<BranchOffice, 'id' | 'created_at'>;
