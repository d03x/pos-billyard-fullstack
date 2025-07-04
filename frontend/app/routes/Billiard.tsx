import BilliardManagement from "~/billiard/BilliardManagement";
import { PageHeader } from "~/components/PageHeader";

export default function Billiard() {
  return (
    <div>
      <PageHeader
        title="Billiard Management"
        description="Kelola meja bilyar dengan mudah di sini."
      />
      <BilliardManagement />
    </div>
  );
}
