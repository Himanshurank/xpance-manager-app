import { ETimeRange } from "./Enums";

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

export interface Member {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  avatar_url?: string;
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
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  paid_by: {
    name: string;
  };
  created_at: string;
  paidById?: string;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Group: undefined;
  GroupDetails: undefined;
  Transaction: undefined;
  Analytics: undefined;
  Settings: undefined;
  Profile: undefined;
  PersonalInformation: undefined;
  Notification: undefined;
  Security: undefined;
  PaymentMethods: undefined;
  HelpSupport: undefined;
};

export interface CategoryData {
  name: string;
  amount: number | unknown;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}
