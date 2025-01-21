// ... (código anterior permanece igual)

export interface Guest {
  id: string;
  name: string;
  surname?: string;
  side: 'groom' | 'bride';
  probability: 'high' | 'medium' | 'low';
  invitation_delivered: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  family_members?: GuestFamilyMember[];
}

// ... (resto do código permanece igual)