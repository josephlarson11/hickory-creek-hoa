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
};

export const boardMembers: BoardMember[] = [
  {
    position: "President",
    name: "Michelle Eguia"
  },
  {
    position: "Vice President",
    name: "Matt Creager"
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

export const documents: DocumentItem[] = [
  {
    id: "restrictions-first-addition",
    title: "Hickory Creek Restrictions - 1st Addition",
    category: "Declaration / CC&Rs",
    updatedAt: "2023-01-05",
    description: "Revived amended and restated restrictions for the 1st Addition.",
    href: "/documents/restrictions/hickory-creek-1st-addition-restrictions.pdf",
    isApproved: true
  },
  {
    id: "restrictions-second-addition",
    title: "Hickory Creek Restrictions - 2nd Addition",
    category: "Declaration / CC&Rs",
    updatedAt: "2023-01-05",
    description: "Revived amended and restated restrictions for the 2nd Addition.",
    href: "/documents/restrictions/hickory-creek-2nd-addition-restrictions.pdf",
    isApproved: true
  },
  {
    id: "restrictions-third-addition",
    title: "Hickory Creek Restrictions - 3rd Addition",
    category: "Declaration / CC&Rs",
    updatedAt: "2023-01-05",
    description: "Revitalized restrictions for the 3rd Addition.",
    href: "/documents/restrictions/hickory-creek-3rd-addition-restrictions.pdf",
    isApproved: true
  }
];

export const events: CalendarEvent[] = [];

export const galleryImages = [
  {
    id: "entrance",
    title: "Neighborhood Entrance",
    src: "/images/entrance.jpg"
  }
];
