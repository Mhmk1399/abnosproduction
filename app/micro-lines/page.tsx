"use client";
import { useState } from "react";
import { useMicroLines } from "../../hooks/useMicroLines";
import Link from "next/link";
import MicroLineModal from "../../components/MicroLineModal";

export default function MicroLinesPage() {
  const { microLines, isLoading, error, mutate } = useMicroLines();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMicroLine, setSelectedMicroLine] = useState<any>(null);

  // Filter micro lines based on search term
  const filteredLines = microLines.filter(
    (line) =>
      line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (microLine: any) => {
    setSelectedMicroLine(microLine);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this micro line?")) {
      try {
        const response = await fetch("/api/microLine", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete micro line");
        }

        // Refresh the data
        mutate();
      } catch (error) {
        console.error("Error deleting micro line:", error);
        alert("Failed to delete micro line");
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMicroLine(null);
  };

  const handleModalSave = async (formData: any) => {
    try {
      const response = await fetch("/api/microLine", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _id: selectedMicroLine._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update micro line");
      }

      // Refresh the data
      mutate();
      setIsModalOpen(false);
      setSelectedMicroLine(null);
    } catch (error) {
      console.error("Error updating micro line:", error);
      alert("Failed to update micro line");
    }
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Micro Lines</h1>
        <Link
          href="/configure-micro-line"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Micro Line
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search micro lines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Steps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLines.map((line) => (
              <tr key={line._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {line.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {line.description || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {line.steps ? line.steps.length : 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleEdit(line)}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(line._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredLines.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No micro lines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <MicroLineModal
          microLine={selectedMicroLine}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
