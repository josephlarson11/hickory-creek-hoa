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
    name: "Mariusz Tatara"
  },
  {
    position: "Treasurer",
    name: "Mike Gomez"
  },
  {
    position: "Secretary",
    name: "Joe Larson"
  },
  {
    position: "Director",
    name: "Barb Kemper"
  },
  {
    position: "Director",
    name: "Matt Creager"
  }
];

export const announcements: Announcement[] = [
  {
    id: "summer-landscaping",
    title: "Summer Landscaping Reminders",
    summary: "Please keep lawns edged, irrigation adjusted, and yard debris collected on the approved schedule.",
    content:
      "As summer rains return, residents are encouraged to keep lawns edged, irrigation systems adjusted, and yard debris bundled for regular pickup. These simple steps help maintain Hickory Creek's welcoming appearance.",
    publishDate: "2026-06-10",
    author: "Board of Directors"
  },
  {
    id: "meeting-july",
    title: "July Board Meeting Notice",
    summary: "The next regular board meeting is scheduled for July 9, 2026.",
    content:
      "The July board meeting will include standard association business, resident comments, and updates on document publication. Residents may submit agenda requests through the online form.",
    publishDate: "2026-06-05",
    author: "Secretary"
  },
  {
    id: "document-library",
    title: "Approved Documents Library Launch",
    summary: "Public governing documents and approved minutes are being published in the new library.",
    content:
      "The association is organizing approved governing documents, policies, budgets, and minutes in one searchable public document library. Drafts and private records remain available only in the board portal.",
    publishDate: "2026-05-28",
    author: "Administrator"
  },
  {
    id: "storm-season",
    title: "Storm Season Preparedness",
    summary: "Secure loose outdoor items and review county preparedness guidance before severe weather.",
    content:
      "Residents should secure loose outdoor items, trim vegetation responsibly, and monitor official county weather guidance as storm season begins.",
    publishDate: "2026-05-20",
    author: "Board of Directors"
  }
];

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
  },
  {
    id: "arc-form",
    title: "Architectural Review Form",
    category: "Architectural Forms",
    updatedAt: "2026-06-03",
    description: "Form for exterior changes requiring architectural review.",
    href: "/documents/placeholders/architectural-review.pdf",
    isApproved: true
  },
  {
    id: "minutes-may",
    title: "Approved Meeting Minutes - May 2026",
    category: "Approved Meeting Minutes",
    updatedAt: "2026-06-08",
    description: "Approved minutes from the May 2026 regular board meeting.",
    href: "/documents/placeholders/minutes-may-2026.pdf",
    isApproved: true
  },
  {
    id: "budget",
    title: "Approved 2026 Budget",
    category: "Budgets",
    updatedAt: "2026-01-15",
    description: "Approved annual operating budget.",
    href: "/documents/placeholders/budget-2026.pdf",
    isApproved: true
  },
  {
    id: "records-policy",
    title: "Official Records Request Policy",
    category: "Policies",
    updatedAt: "2026-04-12",
    description: "Policy describing official records request handling.",
    href: "/documents/placeholders/records-policy.pdf",
    isApproved: true
  }
];

export const events: CalendarEvent[] = [
  {
    id: "board-july",
    title: "Regular Board Meeting",
    date: "2026-07-09",
    time: "6:30 PM",
    location: "Community meeting room / virtual option",
    type: "Board Meeting"
  },
  {
    id: "arc-august",
    title: "Architectural Review Deadline",
    date: "2026-08-03",
    time: "5:00 PM",
    location: "Online submission",
    type: "Community Event"
  },
  {
    id: "annual",
    title: "Annual Membership Meeting",
    date: "2026-10-15",
    time: "7:00 PM",
    location: "Brandon area meeting location to be announced",
    type: "Annual Meeting"
  }
];

export const galleryImages = [
  {
    id: "entrance",
    title: "Neighborhood Entrance",
    src: "/images/gallery-entrance.svg"
  },
  {
    id: "oak",
    title: "Mature Oak Canopy",
    src: "/images/gallery-oak.svg"
  },
  {
    id: "landscape",
    title: "Community Landscaping",
    src: "/images/gallery-landscape.svg"
  },
  {
    id: "meeting",
    title: "Community Meeting",
    src: "/images/gallery-meeting.svg"
  }
];
