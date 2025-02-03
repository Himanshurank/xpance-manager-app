export interface Group {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
}

export interface GroupDetails {
  id: string;
  name: string;
  icon: string;
  color: string;
  memberCount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  paid_by: {
    name: string;
  };
  created_at: string;
}
