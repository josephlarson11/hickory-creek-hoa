export type Announcement = {
  id: string;
  title: string;
  content: string;
  summary: string;
  publishDate: string;
  author: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  description: string;
  href: string;
  isApproved: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "Board Meeting" | "Annual Meeting" | "Community Event";
};

export type BoardMember = {
  position: string;
  name: string;
  phone?: string;
};

export const boardMembers: BoardMember[] = [
  {
    position: "President",
    name: "Michelle Eguia",
    phone: "813-846-3480"
  },
  {
    position: "Vice President",
    name: "Matt Creager",
    phone: "813-298-7621"
  },
  {
    position: "Secretary",
    name: "Joe Larson"
  },
  {
    position: "Treasurer",
    name: "Mike Gomez"
  },
  {
    position: "Director",
    name: "Barb Kemper"
  },
  {
    position: "Director",
    name: "Mariusz Tatara"
  },
  {
    position: "Director",
    name: "Howard Hunter"
  }
];

export const announcements: Announcement[] = [];

export const documents: DocumentItem[] = [];

export const events: CalendarEvent[] = [];

export const galleryImages = [
  {
    id: "entrance",
    title: "Neighborhood Entrance",
    src: "/images/entrance.jpg"
  }
];
