export type CounselingRequestStatus =
  | "booked"
  | "acknowledged"
  | "responded"
  | "completed";

export type CounselingWhoWillJoin = "student" | "student_and_parent";

export type CounselingActiveRequest = {
  id: string;
  status: "booked" | "acknowledged" | "responded";
  createdAt: string;
};

export type CounselingMe = {
  canRequest: boolean;
  activeRequest: CounselingActiveRequest | null;
};

export type CounselingContactInput = {
  emailEnabled: boolean;
  email: string;
  phoneEnabled: boolean;
  phone: string;
};

export type CounselingBookingForm = {
  studentName: string;
  whoWillJoin: CounselingWhoWillJoin;
  courseInterestedIn: string;
  expectedMark: string;
  twelfthMarks: string;
  state: string;
  category: string;
  preferredDayTime: string;
  talkAbout: string;
  contact: CounselingContactInput;
};

export type CounselingBookingFieldErrors = {
  contact?: string;
  email?: string;
  phone?: string;
};

export type CreateCounselingRequestPayload = {
  studentName?: string;
  whoWillJoin: CounselingWhoWillJoin;
  courseInterestedIn?: string;
  expectedMark?: string;
  twelfthMarks?: string;
  state?: string;
  category?: string;
  preferredDayTime?: string;
  talkAbout?: string;
  contact: {
    emailEnabled: boolean;
    email?: string;
    phoneEnabled: boolean;
    phone?: string;
  };
};

export type CounselingPrefill = {
  studentName: string;
  email: string;
  phone: string;
  state: string;
  courseInterestedIn: string;
  expectedMark: string;
  latestMockScore: number | null;
  latestMockMaxScore: number | null;
};
