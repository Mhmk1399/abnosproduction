"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MicroLineBuilder from "../../../components/MicroLineBuilder";

export default function EditMicroLinePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [microLine, setMicroLine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMicroLine() {
      try {
        // Fetch the micro line by ID
        const response = await fetch(`/api/microLine/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch micro line");
        }
        const data = await response.json();
        setMicroLine(data);
      } catch (err) {
        console.error("Error fetching micro line:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMicroLine();
  }, [params.id]);

  const handleSave = (config: any) => {
    console.log("Micro line updated:", config);

    // Redirect to the micro lines list after a short delay
    setTimeout(() => {
      router.push("/micro-lines");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">
        Edit Micro Line
      </h1>
      <MicroLineBuilder initialConfig={microLine} onSave={handleSave} />
    </div>
  );
}