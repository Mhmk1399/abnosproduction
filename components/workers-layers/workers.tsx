"use client";
import { useState, useEffect, useRef } from "react";
import { useStepExecutions } from "@/hooks/useStepExecutions";
import { useProductLayer } from "@/hooks/useProductLayers";
import { BarcodeService } from "@/services/barcodeService";
import {
  FiBarChart2,
  FiX,
  FiInfo,
  FiClock,
  FiPrinter,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckSquare,
  FiGrid,
  FiHash,
  FiHelpCircle,
  FiInbox,
  FiLayers,
  FiLock,
  FiLogIn,
  FiLogOut,
  FiMaximize2,
  FiMessageSquare,
  FiMonitor,
  FiPackage,
  FiSearch,
  FiSettings,
  FiType,
  FiUsers,
} from "react-icons/fi";
import { layerData, StepExecution, TreatmentApplication } from "@/types/types";

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
      console.log("Failed to load layer history:", err);
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
        text: "لطفا اسکن کنید یا یک بارکد وارد کنید",
      });
      return;
    }

    // Reset previous scan
    setScannedLayerId(null);
    setScanMessage({
      type: "info",
      text: "جستجو برای لایه...",
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
          text: "لایه پیدا نشد",
        });
        return;
      }

      console.log("Layer found with ID:", data.layerId);

      // Set the selected layer ID without production line validation
      setScannedLayerId(data.layerId);
      setScanMessage({
        type: "success",
        text: "لایه پیدا شد",
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
        text:
          "بارکد پردازش نشد: " +
          (err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : "Unknown error"),
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
          text: "این لایه در حال حاضر در این مرحله نیست",
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
          text: "هیچ خط تولیدی به این لایه اختصاص داده نشده است",
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
          (
            scannedLayer.treatments as {
              treatment: { _id: string; name?: string } | string;
              count?: number;
              measurement?: string;
            }[]
          )?.map((t) => {
            // Create a properly typed TreatmentApplication object
            const treatmentApp: TreatmentApplication = {
              // If t.treatment is an object with _id, use that, otherwise use the string
              treatment:
                typeof t.treatment === "object" && t.treatment !== null
                  ? (t.treatment as { _id: string })._id // Just use the ID string
                  : (t.treatment as string), // Cast to string if it's already a string
              count: t.count || 1,
              measurement: t.measurement || "unit",
            };
            return treatmentApp;
          }) || [],
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
      const currentStepIndex = steps.findIndex(
        (s: { step: { _id: string } }) => {
          const stepId = typeof s.step === "object" ? s.step._id : s.step;
          return stepId === currentStepId;
        }
      );

      // If this is the last step, mark as completed
      if (currentStepIndex === steps.length - 1) {
        await updateLayer({
          _id: scannedLayer._id,
          completed: true,
          completedAt: new Date().toISOString(),
        });

        setScanMessage({
          type: "success",
          text: "تولید این لایه به پایان رسید!",
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
          text: "مرحله تکمیل شد، به مرحله بعد منتقل شد",
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
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800 flex items-center justify-center gap-3">
          <span className="bg-blue-100 p-2 rounded-full">
            <FiUsers className="text-blue-700" size={24} />
          </span>
          ایستگاه کاری
        </h1>

        {stepId && stepName ? (
          <>
            <div className="mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 p-1.5 rounded-md">
                  <FiActivity className="text-blue-600" size={18} />
                </span>
                <span className="text-gray-600">مرحله فعلی: </span>
                <span className="font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                  {stepName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiLogOut className="h-5 w-5" />
                تغییر مرحله
              </button>
            </div>

            {/* Barcode Scanner Section */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4 text-blue-800 flex items-center gap-2">
                <FiBarChart2  className="text-blue-600" size={20} />
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right pr-10"
                      dir="rtl"
                      autoFocus
                      disabled={!!scannedLayer}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiBarChart2  className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                  disabled={!!scannedLayer}
                >
                  <FiSearch className="inline" size={18} />
                  جستجو
                </button>
              </form>

              {scanMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-center ${
                    scanMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : scanMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {scanMessage.type === "success" ? (
                    <FiCheckCircle className="ml-3 flex-shrink-0" size={20} />
                  ) : scanMessage.type === "error" ? (
                    <FiAlertCircle className="ml-3 flex-shrink-0" size={20} />
                  ) : (
                    <FiInfo className="ml-3 flex-shrink-0" size={20} />
                  )}
                  <span>{scanMessage.text}</span>
                </div>
              )}
            </div>

            {/* Scanned Layer Details */}
            {scannedLayer && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                    <FiLayers className="text-blue-600" size={20} />
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
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-1.5"
                  >
                    <FiX className="inline" size={16} />
                    بستن
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                    <h3 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
                      <FiPackage className="text-gray-500" size={16} />
                      اطلاعات تولید
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiHash size={14} />
                          کد تولید:
                        </span>
                        <span className="font-medium bg-white px-2 py-1 rounded border border-gray-100">
                          {scannedLayer.productionCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiMaximize2 size={14} />
                          ابعاد:
                        </span>
                        <span className="font-medium bg-white px-2 py-1 rounded border border-gray-100">
                          {scannedLayer.width} × {scannedLayer.height}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiActivity size={14} />
                          مرحله فعلی:
                        </span>
                        <span className="font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {typeof scannedLayer.currentStep === "object"
                            ? scannedLayer.currentStep?.name
                            : "نامشخص"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiCalendar size={14} />
                          تاریخ تولید:
                        </span>
                        <span className="font-medium bg-white px-2 py-1 rounded border border-gray-100">
                          {new Date(
                            scannedLayer.productionDate
                          ).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                    <h3 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
                      <FiGrid className="text-gray-500" size={16} />
                      اطلاعات شیشه
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiType size={14} />
                          نوع شیشه:
                        </span>
                        <span className="font-medium bg-white px-2 py-1 rounded border border-gray-100">
                          {typeof scannedLayer.glass === "object"
                            ? scannedLayer.glass?.name
                            : "نامشخص"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <FiSettings size={14} />
                          عملیات:
                        </span>
                        <div className="text-left">
                          {scannedLayer.treatments &&
                          scannedLayer.treatments.length > 0 ? (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {scannedLayer.treatments.map((treatment, idx) => {
                                // Add a type assertion to help TypeScript understand the shape
                                const treatmentObj =
                                  typeof treatment.treatment === "object"
                                    ? (treatment.treatment as {
                                        _id: string;
                                        name?: string;
                                      })
                                    : null;
                                return (
                                  <span
                                    key={idx}
                                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                                  >
                                    {treatmentObj
                                      ? treatmentObj.name
                                      : "نامشخص"}
                                    {treatment.count > 1 &&
                                      ` (${treatment.count})`}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">
                              هیچ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barcode */}
                <div className="mb-6 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <h3 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <FiBarChart2  className="text-gray-500" size={16} />
                    بارکد
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
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
                      className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <FiPrinter className="inline" size={18} />
                      چاپ بارکد
                    </button>
                  </div>
                </div>

                {/* Step Completion Form */}
                <div className="mb-6 border-t border-gray-100 pt-6">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center gap-2">
                    <FiCheckSquare className="text-gray-500" size={16} />
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
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-start">
                          <FiAlertTriangle
                            className="inline ml-3 mt-0.5 flex-shrink-0"
                            size={20}
                          />
                          <span>
                            این لایه در حال حاضر در مرحله دیگری قرار دارد و
                            نمی‌تواند در این ایستگاه پردازش شود.
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2  items-center gap-1.5">
                            <FiMessageSquare size={14} />
                            یادداشت‌ها (اختیاری)
                          </label>
                          <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                            rows={3}
                            placeholder="هرگونه توضیح یا یادداشت مربوط به این مرحله را وارد کنید..."
                            dir="rtl"
                          />
                        </div>

                        <button
                          onClick={completeStep}
                          disabled={isProcessingStep}
                          className={`w-full px-4 py-3.5 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm ${
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
                              <FiCheckCircle className="inline" size={18} />
                              تکمیل مرحله و انتقال به مرحله بعد
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Production History */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center gap-2">
                    <FiClock className="text-gray-500" size={16} />
                    تاریخچه تولید
                  </h3>
                  {layerHistory.length === 0 ? (
                    <div className="bg-gray-50 p-5 text-center rounded-lg text-gray-500 border border-gray-100 flex flex-col items-center justify-center">
                      <FiInbox size={24} className="mb-2 text-gray-400" />
                      <span>تاریخچه تولید موجود نیست</span>
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

                            <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
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
                                      ? execution?.step?.name
                                      : "مرحله نامشخص"}
                                  </h3>
                                  <div className="text-sm text-gray-500 text-right flex items-center justify-end gap-1 mt-1">
                                    <FiCalendar
                                      size={12}
                                      className="text-gray-400"
                                    />
                                    {new Date(
                                      execution.scannedAt
                                    ).toLocaleString("fa-IR")}
                                  </div>
                                </div>
                              </div>

                              {execution.notes && (
                                <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg text-right border border-gray-100">
                                  <FiMessageSquare
                                    className="inline ml-1.5 text-gray-500"
                                    size={14}
                                  />
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
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-center text-blue-800 flex items-center justify-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-full">
                <FiLogIn className="text-blue-700" size={20} />
              </span>
              ورود به ایستگاه کاری
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo
                className="text-blue-500 mt-0.5 ml-3 flex-shrink-0"
                size={20}
              />
              <span className="text-sm text-blue-700">
                لطفا نام ایستگاه کاری و رمز عبور خود را وارد کنید. این اطلاعات
                توسط سرپرست به شما داده شده است.
              </span>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <FiAlertCircle className="ml-3 flex-shrink-0" size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2  items-center gap-1.5"
                >
                  <FiMonitor size={14} />
                  نام ایستگاه کاری
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiMonitor className="text-gray-400" size={18} />
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
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <FiHelpCircle size={12} />
                  مثال: مونتاژ، بسته‌بندی، کنترل کیفیت
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2  items-center gap-1.5"
                >
                  <FiLock size={14} />
                  رمز عبور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiLock className="text-gray-400" size={18} />
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
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <FiHelpCircle size={12} />
                  رمز عبور توسط سرپرست به شما داده شده است
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2 shadow-sm font-medium mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn size={18} />
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
