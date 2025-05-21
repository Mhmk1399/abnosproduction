"use client";
import { useState, useEffect, useRef } from "react";
import { useStepExecutions } from "@/hooks/useStepExecutions";
import { useProductLayer } from "@/hooks/useProductLayers";
import { BarcodeService } from "@/services/barcodeService";
import {
  FiBarChart2,
  FiCheck,
  FiX,
  FiInfo,
  FiClock,
  FiPrinter,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { layerData, StepExecution } from "@/types/types";

export default function WorkerPage() {
  // Authentication state
  const [stepId, setStepId] = useState<string | null>(null);
  const [stepName, setStepName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Barcode scanning state
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [scanMessage, setScanMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [scannedLayerId, setScannedLayerId] = useState<string | null>(null);
  const [scannedLayer, setScannedLayer] = useState<layerData | null>(null);
  const [layerHistory, setLayerHistory] = useState<StepExecution[]>([]);
  const [isProcessingStep, setIsProcessingStep] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Form data for worker authentication
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  // Hooks for API interactions
  const { getStepExecutions, createStepExecution } = useStepExecutions();
  const {
    layer,
    isLoading: layerLoading,
    updateLayer,
  } = useProductLayer(scannedLayerId || "");

  // Check local storage for existing step authentication on component mount
  useEffect(() => {
    const storedStepId = localStorage.getItem("workerStepId");
    const storedStepName = localStorage.getItem("workerStepName");

    if (storedStepId && storedStepName) {
      setStepId(storedStepId);
      setStepName(storedStepName);
    }

    setIsLoading(false);
  }, []);

  // Update scanned layer when layer data is loaded
  useEffect(() => {
    if (layer && !layerLoading) {
      setScannedLayer(layer);
      loadLayerHistory(layer._id);
    }
  }, [layer, layerLoading]);

  // Focus the barcode input when available
  useEffect(() => {
    if (stepId && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [stepId, scannedLayerId]);

  // Load history for a specific layer
  const loadLayerHistory = async (layerId: string) => {
    try {
      const history = await getStepExecutions(layerId);
      // Sort by execution date (newest first)
      const sortedHistory = history.sort(
        (a, b) =>
          new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
      );
      setLayerHistory(sortedHistory);
    } catch (err) {
      console.error("Failed to load layer history:", err);
    }
  };

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
    setScannedLayerId(null);
    setScannedLayer(null);
    setLayerHistory([]);
    setBarcodeInput("");
    setScanMessage(null);
  };

  // Handle barcode scan
  // Example usage in a component
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Barcode scan initiated with input:", barcodeInput);

    if (!barcodeInput.trim()) {
      console.log("Error: Empty barcode input");
      setScanMessage({
        type: "error",
        text: "Please scan or enter a barcode",
      });
      return;
    }

    // Reset previous scan
    setScannedLayerId(null);
    setScanMessage({
      type: "info",
      text: "Searching for layer...",
    });
    console.log("Searching for layer with barcode:", barcodeInput);

    try {
      // Extract the MongoDB ID part from the barcode
      // Assuming format is "L-{mongoId}-{suffix}" or similar
      let shortId = barcodeInput.trim();

      // Check if the barcode has the L- prefix format
      const matches = shortId.match(/L-([a-f0-9]+)-\d+/i);
      if (matches && matches[1]) {
        // Extract just the MongoDB ID part
        shortId = matches[1];
        console.log("Extracted MongoDB ID from formatted barcode:", shortId);
      } else {
        console.log("Using original input as shortId:", shortId);
      }

      // Find the layer by short ID using direct fetch
      console.log("Sending API request to find layer with shortId:", shortId);
      const response = await fetch(`/api/productLayer/findByShortId`, {
        method: "GET",
        headers: {
          shortId: shortId,
        },
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        console.log("API error:", response.status, response.statusText);
        throw new Error(
          `Failed to find layer: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API response data:", data);

      if (!data.layerId) {
        console.log("No layer ID returned from API");
        setScanMessage({
          type: "error",
          text: "Layer not found",
        });
        return;
      }

      console.log("Layer found with ID:", data.layerId);

      // Set the selected layer ID without production line validation
      setScannedLayerId(data.layerId);
      setScanMessage({
        type: "success",
        text: "Layer found",
      });

      // If you need to fetch additional layer details, you can do it here
      console.log("Attempting to fetch full layer details");
      try {
        const layerResponse = await fetch(`/api/productLayer/detailed`, {
          method: "GET",
          headers: {
            id: data.layerId,
          },
        });

        if (layerResponse.ok) {
          const layerDetails = await layerResponse.json();
          console.log("Full layer details:", layerDetails);
          // You can set these details to state if needed
          // setLayerDetails(layerDetails);
        } else {
          console.log("Failed to fetch layer details:", layerResponse.status);
        }
      } catch (detailsErr) {
        console.log("Error fetching layer details:", detailsErr);
      }
    } catch (err) {
      console.error("Error scanning barcode:", err);
      setScanMessage({
        type: "error",
        text: `Failed to process barcode: ${err.message || "Unknown error"}`,
      });
    } finally {
      // Clear the input
      console.log("Clearing barcode input");
      setBarcodeInput("");
    }
  };

  // Complete the current step for a layer
  const completeStep = async () => {
    if (!scannedLayer || !stepId) return;

    setIsProcessingStep(true);
    try {
      // Check if this layer is at the current step
      const currentStepId =
        typeof scannedLayer.currentStep === "object"
          ? scannedLayer.currentStep?._id
          : scannedLayer.currentStep;

      if (currentStepId !== stepId) {
        setScanMessage({
          type: "error",
          text: "This layer is not currently at this step",
        });
        return;
      }

      // Get the production line
      const productionLineId =
        typeof scannedLayer.productionLine === "object"
          ? scannedLayer.productionLine._id
          : scannedLayer.productionLine;

      if (!productionLineId) {
        setScanMessage({
          type: "error",
          text: "No production line assigned to this layer",
        });
        return;
      }

      // Record the step execution
      await createStepExecution({
        layer: scannedLayer._id,
        step: stepId,
        productionLine: productionLineId,
        passed: true,
        notes: completionNotes || `Step completed by worker at ${stepName}`,
        scannedAt: new Date().toISOString(),
        treatmentsApplied:
          scannedLayer.treatments?.map((t) => ({
            treatment:
              typeof t.treatment === "object" ? t.treatment._id : t.treatment,
            count: t.count || 1,
            measurement: t.measurement || "unit",
          })) || [],
      });

      // Get the production line details to find the next stepاس
      const productionLineResponse = await fetch(
        `/api/production-lines/detailed`,
        {
          method: "GET",
          headers: {
            id: productionLineId,
          },
        }
      );

      if (!productionLineResponse.ok) {
        throw new Error("Failed to fetch production line details");
      }

      const productionLine = await productionLineResponse.json();

      // Find the current step index
      const steps = productionLine.steps || [];
      const currentStepIndex = steps.findIndex((s) => {
        const stepId = typeof s.step === "object" ? s.step._id : s.step;
        return stepId === currentStepId;
      });

      // If this is the last step, mark as completed
      if (currentStepIndex === steps.length - 1) {
        await updateLayer({
          _id: scannedLayer._id,
          completed: true,
          completedAt: new Date().toISOString(),
        });

        setScanMessage({
          type: "success",
          text: "Production completed for this layer!",
        });
      }
      // Otherwise, move to the next step
      else if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
        const nextStep = steps[currentStepIndex + 1];
        const nextStepId =
          typeof nextStep.step === "object" ? nextStep.step._id : nextStep.step;

        await updateLayer({
          _id: scannedLayer._id,
          currentStep: nextStepId,
        });

        setScanMessage({
          type: "success",
          text: "Step completed, moved to next step",
        });
      }

      // Refresh the layer data and history
      setScannedLayerId(null);
      setScannedLayer(null);
      setLayerHistory([]);
      setCompletionNotes("");
    } catch (err) {
      console.error("Error completing step:", err);
      setScanMessage({
        type: "error",
        text: "Failed to complete step",
      });
    } finally {
      setIsProcessingStep(false);
    }
  };

  // Print a barcode for a layer
  const printBarcode = () => {
    if (!scannedLayer) return;
    BarcodeService.printBarcode(scannedLayer._id, scannedLayer.productionCode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
          ایستگاه کاری
        </h1>

        {stepId && stepName ? (
          <>
            <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
              <div>
                <span className="text-gray-600">مرحله فعلی: </span>
                <span className="font-medium text-blue-700">{stepName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                تغییر مرحله
              </button>
            </div>

            {/* Barcode Scanner Section */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h2 className="text-lg font-medium mb-4 text-blue-800">
                اسکن بارکد
              </h2>
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      ref={barcodeInputRef}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="بارکد را اسکن کنید یا وارد نمایید..."
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                      dir="rtl"
                      autoFocus
                      disabled={!!scannedLayer}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiBarChart2 className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!!scannedLayer}
                >
                  <FiCheck className="inline ml-1" />
                  جستجو
                </button>
              </form>

              {scanMessage && (
                <div
                  className={`mt-3 p-3 rounded-lg flex items-center ${
                    scanMessage.type === "success"
                      ? "bg-green-50 text-green-700"
                      : scanMessage.type === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {scanMessage.type === "success" ? (
                    <FiCheckCircle className="ml-2" />
                  ) : scanMessage.type === "error" ? (
                    <FiX className="ml-2" />
                  ) : (
                    <FiInfo className="ml-2" />
                  )}
                  {scanMessage.text}
                </div>
              )}
            </div>

            {/* Scanned Layer Details */}
            {scannedLayer && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-medium text-blue-800">
                    اطلاعات لایه
                  </h2>
                  <button
                    onClick={() => {
                      setScannedLayerId(null);
                      setScannedLayer(null);
                      setLayerHistory([]);
                      setScanMessage(null);
                      if (barcodeInputRef.current) {
                        barcodeInputRef.current.focus();
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    <FiX className="inline ml-1" />
                    بستن
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium mb-3 text-gray-700">
                      اطلاعات تولید
                    </h3>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-gray-600">کد تولید:</span>
                        <span className="font-medium">
                          {scannedLayer.productionCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ابعاد:</span>
                        <span className="font-medium">
                          {scannedLayer.width} × {scannedLayer.height}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">مرحله فعلی:</span>
                        <span className="font-medium">
                          {typeof scannedLayer.currentStep === "object"
                            ? scannedLayer.currentStep?.name
                            : "نامشخص"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاریخ تولید:</span>
                        <span className="font-medium">
                          {new Date(
                            scannedLayer.productionDate
                          ).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 text-gray-700">
                      اطلاعات شیشه
                    </h3>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع شیشه:</span>
                        <span className="font-medium">
                          {typeof scannedLayer.glass === "object"
                            ? scannedLayer.glass?.name
                            : "نامشخص"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عملیات:</span>
                        <div className="text-left">
                          {scannedLayer.treatments &&
                          scannedLayer.treatments.length > 0 ? (
                            <div className="flex flex-wrap justify-end gap-1">
                              {scannedLayer.treatments.map((treatment, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
                                >
                                  {typeof treatment.treatment === "object"
                                    ? treatment.treatment?.name
                                    : "نامشخص"}
                                  {treatment.count > 1 &&
                                    ` (${treatment.count})`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">هیچ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barcode */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">بارکد</h3>
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <img
                        src={BarcodeService.generateBarcodeDataUrl(
                          BarcodeService.generateBarcodeValue(scannedLayer._id),
                          { height: 60, displayValue: true }
                        )}
                        alt="Barcode"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <button
                      onClick={printBarcode}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1.5"
                    >
                      <FiPrinter className="inline ml-1" />
                      چاپ بارکد
                    </button>
                  </div>
                </div>

                {/* Step Completion Form */}
                <div className="mb-6 border-t pt-4">
                  <h3 className="font-medium mb-3 text-gray-700">
                    تکمیل مرحله
                  </h3>

                  {/* Check if current step matches worker's step */}
                  {(() => {
                    const currentStepId =
                      typeof scannedLayer.currentStep === "object"
                        ? scannedLayer.currentStep?._id
                        : scannedLayer.currentStep;

                    if (currentStepId !== stepId) {
                      return (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
                          <FiAlertCircle className="inline ml-2" />
                          این لایه در حال حاضر در مرحله دیگری قرار دارد و
                          نمی‌تواند در این ایستگاه پردازش شود.
                        </div>
                      );
                    }

                    return (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            یادداشت‌ها (اختیاری)
                          </label>
                          <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                            rows={3}
                            placeholder="هرگونه توضیح یا یادداشت مربوط به این مرحله را وارد کنید..."
                            dir="rtl"
                          />
                        </div>

                        <button
                          onClick={completeStep}
                          disabled={isProcessingStep}
                          className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                            isProcessingStep
                              ? "bg-gray-300 cursor-not-allowed text-gray-600"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {isProcessingStep ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              در حال پردازش...
                            </>
                          ) : (
                            <>
                              <FiCheck className="inline" />
                              تکمیل مرحله و انتقال به مرحله بعد
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Production History */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-700">
                    تاریخچه تولید
                  </h3>
                  {layerHistory.length === 0 ? (
                    <div className="bg-gray-50 p-4 text-center rounded-md text-gray-500">
                      تاریخچه تولید موجود نیست
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                      <div className="space-y-4">
                        {layerHistory.map((execution) => (
                          <div key={execution._id} className="relative pr-10">
                            {/* Timeline dot */}
                            <div
                              className={`absolute right-2 top-2 w-5 h-5 rounded-full flex items-center justify-center ${
                                execution.passed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {execution.passed ? (
                                <FiCheckCircle size={14} />
                              ) : (
                                <FiClock size={14} />
                              )}
                            </div>

                            <div className="bg-white p-3 rounded-lg border shadow-sm">
                              <div className="flex justify-between items-start">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    execution.passed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {execution.passed
                                    ? "تکمیل شده"
                                    : "در حال انجام"}
                                </div>
                                <div>
                                  <h3 className="font-medium text-right">
                                    {typeof execution.step === "object"
                                      ? execution.step.name
                                      : "مرحله نامشخص"}
                                  </h3>
                                  <div className="text-sm text-gray-500 text-right">
                                    {new Date(
                                      execution.scannedAt
                                    ).toLocaleString("fa-IR")}
                                  </div>
                                </div>
                              </div>

                              {execution.notes && (
                                <div className="mt-2 text-sm bg-gray-50 p-2 rounded text-right">
                                  <FiFileText className="inline ml-1 text-gray-500" />
                                  {execution.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center text-blue-800">
              ورود به ایستگاه کاری
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 mt-0.5 mr-1 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-blue-700">
                لطفا نام ایستگاه کاری و رمز عبور خود را وارد کنید. این اطلاعات
                توسط سرپرست به شما داده شده است.
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  نام ایستگاه کاری
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="نام ایستگاه را وارد کنید"
                    required
                    dir="rtl"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  مثال: مونتاژ، بسته‌بندی، کنترل کیفیت
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  رمز عبور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="رمز عبور را وارد کنید"
                    required
                    dir="rtl"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  رمز عبور توسط سرپرست به شما داده شده است
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>ورود به ایستگاه</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
