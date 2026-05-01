import { ApplicationDetailScreen } from "@/screens/ApplicationDetailScreen";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetailScreen id={id} />;
}
