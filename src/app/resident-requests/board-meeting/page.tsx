import { PageHero } from "@/components/page-hero";
import { ResidentRequestForm } from "@/components/resident-request-form";

export const metadata = {
  title: "Board Meeting Agenda Request"
};

export default function BoardMeetingRequestPage() {
  return (
    <>
      <PageHero eyebrow="Resident Submissions" title="Board Meeting Agenda Request" />
      <section className="section">
        <ResidentRequestForm kind="board-meeting" title="Board Meeting Agenda Request" />
      </section>
    </>
  );
}
