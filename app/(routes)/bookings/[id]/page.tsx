import { redirect } from "next/navigation";
import BookingFormClient from "../../../_components/BookingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../_lib/auth";
interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await getServerSession(authOptions);
  const carId  = await params;

  if (!session || !session.user) {
    redirect("/login");
  }

  return <BookingFormClient carId={carId.id} />;
}
