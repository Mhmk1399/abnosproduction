"use client";
import WorkerInputForm from "../../components/WorkerInputForm";

export default function WorkerPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Worker Station</h1>
        <WorkerInputForm stepName="Cutting" workerId="W-12345" />
      </div>
    </div>
  );
}
