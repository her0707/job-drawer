import { ApplicationFormScreen } from "@/screens/ApplicationFormScreen";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationFormScreen id={id} />;
}
