"use client";
import MicroLineBuilder from "../../components/MicroLineBuilder";
import { useRouter } from "next/navigation";

export default function ConfigureMicroLinePage() {
  const router = useRouter();

  const handleSave = (config: any) => {
    console.log("Micro line saved:", config);

    // Redirect to the micro lines list after a short delay
    setTimeout(() => {
      router.push("/micro-lines");
    }, 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">
        Micro Line Configuration
      </h1>
      <MicroLineBuilder onSave={handleSave} />
    </div>
  );
}