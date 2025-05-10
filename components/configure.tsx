"use client";
import { useRouter } from "next/navigation";
import ProductionLineBuilder from "./ProductionLineBuilder";

export default function ConfigurePage() {
  const router = useRouter();

  const handleSave = (config: any) => {
    console.log("Production line saved:", config);

    // Redirect to the production lines list after a short delay
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-20">پیکربندی خط تولید</h1>
      <ProductionLineBuilder onSave={handleSave} />
    </div>
  );
}
