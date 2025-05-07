"use client";
import { useState, useEffect } from "react";
import WorkerInputForm from "../../components/WorkerInputForm";

export default function WorkerPage() {
  const [stepId, setStepId] = useState<string | null>(null);
  const [stepName, setStepName] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string>("default-worker");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  // Check local storage for existing step authentication on component mount
  useEffect(() => {
    const storedStepId = localStorage.getItem("workerStepId");
    const storedStepName = localStorage.getItem("workerStepName");
    
    if (storedStepId && storedStepName) {
      setStepId(storedStepId);
      setStepName(storedStepName);
      console.log("Loaded from localStorage:", { storedStepId, storedStepName });
    }
    
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/steps/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const data = await response.json();
      
      // Store step info in local storage
      localStorage.setItem("workerStepId", data.step._id);
      localStorage.setItem("workerStepName", data.step.name);
      
      // Update state
      setStepId(data.step._id);
      setStepName(data.step.name);
      console.log("Authentication successful:", { id: data.step._id, name: data.step.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("workerStepId");
    localStorage.removeItem("workerStepName");
    setStepId(null);
    setStepName(null);
  };

  // Debug output
  console.log("WorkerPage render state:", { stepId, stepName, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Worker Station
        </h1>
        
        {stepId && stepName ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <span className="text-gray-600">Current Step: </span>
                <span className="font-medium">{stepName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Change Step
              </button>
            </div>
            <WorkerInputForm 
              stepId={stepId} 
              stepName={stepName} 
              workerId={workerId} 
            />
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Step Authentication
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Step Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter step name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter step password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
