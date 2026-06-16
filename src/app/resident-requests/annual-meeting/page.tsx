import { PageHero } from "@/components/page-hero";
import { ResidentRequestForm } from "@/components/resident-request-form";

export const metadata = {
  title: "Annual Meeting Agenda Request"
};

export default function AnnualMeetingRequestPage() {
  return (
    <>
      <PageHero eyebrow="Resident Submissions" title="Annual Meeting Agenda Request" />
      <section className="section">
        <ResidentRequestForm kind="annual-meeting" title="Annual Meeting Agenda Request" />
      </section>
    </>
  );
}
