import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Payment Settings" };

export default async function PaymentPage() {
  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Payment Settings
      </h1>
      <p className="text-gray-500 mb-8">
        Manage your billing and payment options.
      </p>

      <div className="card text-center py-16">
        <div className="text-5xl mb-4">💳</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Online payment integration is coming soon. In the meantime, contact
          your admin for any billing questions or to update your payment
          information.
        </p>
      </div>
    </div>
  );
}
