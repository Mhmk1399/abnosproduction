"use client";
import { useLayerProcessing } from "../hooks/useLayerProcessing";
// import { Layer } from "./types/production";
import { useState, useEffect, useRef } from "react";
import { useProductLayers } from "../hooks/useProductLayers";
import {
  FiLayers,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

export default function WorkerInputForm({
  stepId,
  stepName,
  workerId,
}: {
  stepId?: string;
  stepName?: string;
  workerId?: string;
}) {
  // Debug props
  console.log("WorkerInputForm props:", { stepId, stepName, workerId });

  // Add the missing debugRef
  const debugRef = useRef({
    layersCount: 0,
    filteredCount: 0,
    renderCount: 0,
  });

  // Keep existing hook call and state variables...
  const {
    layerId,
    setLayerId,
    currentLayer,
    isProcessComplete,
    setIsProcessComplete,
    isDefective,
    setIsDefective,
    notes,
    setNotes,
    recentLayers,
    error,
    success,
    isLoading,
    isLayersLoading,
    stepsLayers,
    inputRef,
    handleSubmit,
    handleProcessComplete,
    productionLine,
    allSteps,
    currentStepIndex,
  } = useLayerProcessing({
    stepId,
    workerId: workerId || "default-worker",
  });

  // State for fake data (keep existing)...
  const [useFakeData, setUseFakeData] = useState(false);
  const [fakeCurrentLayer, setFakeCurrentLayer] = useState<any>(null);
  const [fakeRecentLayers, setFakeRecentLayers] = useState<any[]>([]);
  const [fakeError, setFakeError] = useState("");
  const [fakeSuccess, setFakeSuccess] = useState("");
  const [fakeIsLoading, setFakeIsLoading] = useState(false);
  const [fakeIsProcessComplete, setFakeIsProcessComplete] = useState(false);
  const [fakeIsDefective, setFakeIsDefective] = useState(false);
  const [fakeNotes, setFakeNotes] = useState("");
  // Add these new state variables
  const [fakeProductionLine, setFakeProductionLine] = useState<any>(null);
  const [fakeAllSteps, setFakeAllSteps] = useState<any[]>([]);
  const [fakeCurrentStepIndex, setFakeCurrentStepIndex] = useState<number>(-1);

  // State for layers in the current step
  const [currentStepLayers, setCurrentStepLayers] = useState<any[]>([]);
  const [isCurrentStepLayersLoading, setIsCurrentStepLayersLoading] =
    useState(true);
  const [currentStepLayersError, setCurrentStepLayersError] = useState<
    string | null
  >(null);

  // Use the useProductLayers hook to get all product layers
  const {
    layers,
    isLoading: isProductLayersLoading,
    error: productLayersError,
  } = useProductLayers();

  // Filter layers to show only those with currentStep matching stepId
  useEffect(() => {
    if (!stepId || isProductLayersLoading || !layers) {
      return;
    }

    try {
      console.log("StepId to match:", stepId);
      console.log("All layers:", layers);

      // Filter layers where currentStep._id matches stepId
      const filteredLayers = layers.filter((layer) => {
        if (!layer.currentStep) {
          console.log(`Layer ${layer.code} has no currentStep`);
          return false;
        }

        // Extract the step ID based on the structure
        const currentStepId =
          typeof layer.currentStep === "object"
            ? layer.currentStep._id
            : layer.currentStep;

        console.log(`Layer ${layer.code} has currentStep ID: ${currentStepId}`);

        const isMatch = currentStepId === stepId;
        console.log(`Is match with ${stepId}? ${isMatch}`);

        return isMatch;
      });

      console.log(
        `Found ${filteredLayers.length} layers in step ${stepId}:`,
        filteredLayers
      );
      setCurrentStepLayers(filteredLayers);
      setCurrentStepLayersError(null);
    } catch (err) {
      console.error("Error filtering layers:", err);
      setCurrentStepLayersError("Failed to filter layers for current step");
    } finally {
      setIsCurrentStepLayersLoading(false);
    }
  }, [stepId, layers, isProductLayersLoading]);

  // Custom submit handler (keep existing)...
  const customHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the input is test-id
    if (layerId.toLowerCase() === "test-id") {
      setUseFakeData(true);
      setFakeIsLoading(true);

      // Simulate loading
      setTimeout(() => {
        // setFakeCurrentLayer(fakeLayer);
        setFakeProductionLine(fakeProductionLine);
        setFakeAllSteps(fakeAllSteps);
        setFakeCurrentStepIndex(fakeCurrentStepIndex);
        setFakeIsLoading(false);
        setFakeError("");
      }, 800);

      return;
    }

    // If not test-id, use the real handler
    setUseFakeData(false);
    handleSubmit(e);
  };

  // Custom process complete handler (keep existing)...
  const customHandleProcessComplete = () => {
    if (useFakeData) {
      setFakeIsLoading(true);

      // Simulate processing
      setTimeout(() => {
        // Add to fake recent layers
        setFakeRecentLayers([
          {
            ...fakeCurrentLayer,
            status: fakeIsDefective ? "defective" : "completed",
            processedAt: new Date(),
          },
          ...fakeRecentLayers,
        ]);

        setFakeSuccess(`Layer ${fakeCurrentLayer.code} processed successfully`);
        setFakeCurrentLayer(null);
        setFakeIsProcessComplete(false);
        setFakeIsDefective(false);
        setFakeNotes("");
        setFakeIsLoading(false);
        setLayerId("");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setFakeSuccess("");
        }, 3000);
      }, 1000);

      return;
    }

    // If not using fake data, use the real handler
    handleProcessComplete();
  };

  // If no step is selected, show a message
  if (!stepId || !stepName) {
    console.log("No step selected condition met:", { stepId, stepName });
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          مرحله تولیدی انتخاب نشده است
        </h3>
        <p className="text-yellow-600">
          لطفا یک مرحله تولید را برای ادامه انتخاب کنید
        </p>
      </div>
    );
  }

  // Determine which data to use (keep existing)...
  const displayCurrentLayer = useFakeData ? fakeCurrentLayer : currentLayer;
  const displayRecentLayers = useFakeData ? fakeRecentLayers : recentLayers;
  const displayError = useFakeData ? fakeError : error;
  const displaySuccess = useFakeData ? fakeSuccess : success;
  const displayIsLoading = useFakeData ? fakeIsLoading : isLoading;
  const displayIsProcessComplete = useFakeData
    ? fakeIsProcessComplete
    : isProcessComplete;
  const displayIsDefective = useFakeData ? fakeIsDefective : isDefective;
  const displayNotes = useFakeData ? fakeNotes : notes;
  // const displayStepsLayers = useFakeData ? fakeStepsLayers : stepsLayers;
  // const displayIsLayersLoading = useFakeData ? false : isLayersLoading;

  // Debug info
  console.log("Render debug:", {
    currentStepLayersLength: currentStepLayers?.length,
    isCurrentStepLayersLoading,
    currentStepLayersError,
  });

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">ایستگاه کاری</h2>
            <p className="text-blue-100">مرحله: {stepName}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-100">شناسه کارگر</p>
            <p className="font-medium">{workerId || "تنظیم نشده"}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Hint Card */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <FiInfo className="text-blue-500  ml-1 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">راهنمای استفاده:</p>
            <ol className="list-decimal mr-5 space-y-1">
              <li>کد لایه را اسکن کنید یا به صورت دستی وارد نمایید</li>
              <li>دکمه «بررسی» را بزنید تا اطلاعات لایه نمایش داده شود</li>
              <li>
                پس از انجام عملیات، وضعیت لایه را مشخص کنید (سالم یا معیوب)
              </li>
              <li>در صورت نیاز توضیحات را وارد کنید</li>
              <li>دکمه «ثبت» را بزنید تا عملیات ثبت شود</li>
            </ol>
          </div>
        </div>

        {/* Layer ID Input Form */}
        <form onSubmit={customHandleSubmit} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label
                htmlFor="layerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                کد لایه را وارد کنید{" "}
                {useFakeData && (
                  <span className="text-blue-500">
                    (استفاده از داده آزمایشی)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  id="layerId"
                  value={layerId}
                  onChange={(e) => setLayerId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="کد لایه را اسکن کنید یا به صورت دستی وارد نمایید..."
                  required
                  disabled={displayIsLoading}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FiLayers size={18} />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                برای تست می‌توانید از کد "test-id" استفاده کنید
              </p>
            </div>
            <button
              type="submit"
              className=" px-6 py-3 mt-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
              disabled={displayIsLoading}
            >
              {displayIsLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
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
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>بررسی</span>
              )}
            </button>
          </div>

          {displayError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              {displayError}
            </div>
          )}
        </form>

        {/* Current Layer Details */}
        {displayCurrentLayer && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                اطلاعات لایه
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {displayCurrentLayer.code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500">مشتری</p>
                <p className="font-medium">
                  {displayCurrentLayer.customer?.name || "نامشخص"}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500">کد تولید</p>
                <p className="font-medium">
                  {displayCurrentLayer.productionCode || "نامشخص"}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500">ابعاد</p>
                <p className="font-medium">
                  {displayCurrentLayer.width && displayCurrentLayer.height
                    ? `${displayCurrentLayer.width} × ${displayCurrentLayer.height}`
                    : "نامشخص"}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500">دسته</p>
                <p className="font-medium">
                  {displayCurrentLayer.batchId || "نامشخص"}
                </p>
              </div>
            </div>

            {displayIsProcessComplete ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وضعیت لایه
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsDefective(false)}
                        className={`flex-1 py-2 px-4 rounded-md border ${
                          !displayIsDefective
                            ? "bg-green-100 border-green-300 text-green-800"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        } transition-colors flex items-center justify-center gap-2`}
                      >
                        <FiCheckCircle size={18} />
                        <span>سالم</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDefective(true)}
                        className={`flex-1 py-2 px-4 rounded-md border ${
                          displayIsDefective
                            ? "bg-red-100 border-red-300 text-red-800"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        } transition-colors flex items-center justify-center gap-2`}
                      >
                        <FiXCircle size={18} />
                        <span>معیوب</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    id="notes"
                    value={displayNotes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="در صورت نیاز توضیحات خود را وارد کنید..."
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    در صورت معیوب بودن لایه، دلیل آن را ذکر کنید
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={customHandleProcessComplete}
                    disabled={displayIsLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                  >
                    {displayIsLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                        <span>در حال ثبت...</span>
                      </>
                    ) : (
                      <span>ثبت و تکمیل</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsProcessComplete(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>شروع پردازش</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {displaySuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
            <FiCheckCircle className="ml-2 flex-shrink-0" size={20} />
            <span>{displaySuccess}</span>
          </div>
        )}

        {/* Layers in Current Step */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <FiLayers className="ml-2 text-blue-500" />
            لایه‌های موجود در مرحله فعلی ({stepName})
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start">
            <FiInfo
              className="text-blue-500 mt-1 ml-2 flex-shrink-0"
              size={16}
            />
            <p className="text-sm text-blue-700">
              در این بخش لایه‌هایی که در حال حاضر در این مرحله هستند نمایش داده
              می‌شوند. شما می‌توانید کد لایه را از این لیست انتخاب کنید.
            </p>
          </div>

          {isCurrentStepLayersLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">در حال بارگذاری لایه‌ها...</p>
            </div>
          ) : currentStepLayersError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center">
                <FiAlertCircle className="ml-2" />
                <p>{currentStepLayersError}</p>
              </div>
            </div>
          ) : currentStepLayers && currentStepLayers.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کد لایه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مشتری
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ابعاد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کد تولید
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStepLayers.map((layer) => {
                    console.log("Rendering layer:", layer.code);

                    // Extract customer name safely
                    const customerName =
                      typeof layer.customer === "object"
                        ? layer.customer.name
                        : "مشتری نامشخص";

                    // Format dimensions
                    const dimensions =
                      layer.width && layer.height
                        ? `${layer.width}×${layer.height}`
                        : "نامشخص";

                    return (
                      <tr
                        key={layer._id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => setLayerId(layer.code)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {layer.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dimensions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {layer.productionCode || "نامشخص"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FiLayers className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600">
                در حال حاضر هیچ لایه‌ای در این مرحله وجود ندارد
              </p>
              <p className="text-sm text-gray-500 mt-2">
                لطفا منتظر بمانید تا لایه‌ها به این مرحله برسند یا با سرپرست خود
                تماس بگیرید
              </p>
            </div>
          )}
        </div>

        {/* Recently Processed Layers */}
        {displayRecentLayers && displayRecentLayers.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FiClock className="ml-2 text-blue-500" />
              لایه‌های اخیراً پردازش شده
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start">
              <FiInfo
                className="text-blue-500 mt-1 ml-2 flex-shrink-0"
                size={16}
              />
              <p className="text-sm text-blue-700">
                این لیست نشان‌دهنده لایه‌هایی است که اخیراً توسط شما پردازش
                شده‌اند.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کد لایه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      دسته
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      زمان
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayRecentLayers.map((layer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {layer.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {layer.batchId || "نامشخص"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            layer.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : layer.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {layer.status === "completed"
                            ? "تکمیل شده"
                            : layer.status === "in-progress"
                            ? "در حال انجام"
                            : "معیوب"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {layer.processedAt
                          ? new Date(layer.processedAt).toLocaleTimeString(
                              "fa-IR"
                            )
                          : "نامشخص"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Test Mode Indicator */}
        {useFakeData && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">حالت آزمایشی فعال است</span>
            </div>
            <p className="mt-1 mr-7">
              شما در حال استفاده از داده‌های آزمایشی هستید. برای بازگشت به
              داده‌های واقعی، یک کد لایه دیگر وارد کنید.
            </p>
          </div>
        )}

        {/* Debug Info - Hidden in Production */}
        <div className="mt-6 p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm">
          <details>
            <summary className="font-medium text-gray-700 cursor-pointer">
              اطلاعات عیب‌یابی (فقط برای توسعه‌دهندگان)
            </summary>
            <div className="mt-2">
              <p>اطلاعات عیب‌یابی:</p>
              <ul className="list-disc pr-5 mt-1">
                <li>تعداد کل لایه‌ها: {debugRef.current.layersCount}</li>
                <li>لایه‌های فیلتر شده: {debugRef.current.filteredCount}</li>
                <li>
                  تعداد لایه‌های مرحله فعلی: {currentStepLayers?.length || 0}
                </li>
                <li>
                  در حال بارگذاری: {isCurrentStepLayersLoading ? "بله" : "خیر"}
                </li>
                <li>دارای خطا: {currentStepLayersError ? "بله" : "خیر"}</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
