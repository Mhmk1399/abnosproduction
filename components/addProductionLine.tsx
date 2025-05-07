"use client";
import { useProductionLines } from "../hooks/useProductionLines";
import ProductionLineView from "../components/ProductionLineView";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiPlus, FiAlertCircle, FiPackage } from "react-icons/fi";

export default function ProductionLinesPage() {
  const { lines, isLoading, error } = useProductionLines();

  const handleStepClick = (
    stepId: string,
    stepName: string,
    stepDescription: string
  ) => {
    console.log(`Clicked on step ${stepName} (${stepId}): ${stepDescription}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="container mx-auto p-6 max-w-6xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      dir="rtl"
    >
      <motion.div
        className="flex justify-between items-center mb-10"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold text-gray-800 font-vazir">
          خطوط تولید
        </h1>
        <Link
          href="/configure"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 shadow-md"
        >
          <span className="font-vazir">ایجاد خط جدید</span>
          <FiPlus className="text-lg" />
        </Link>
      </motion.div>

      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg mb-8 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-xl text-red-500" />
            <p className="font-bold font-vazir">خطا:</p>
          </div>
          <p className="mt-2 pr-7 font-vazir">{error}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-lg p-8 animate-pulse"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {lines && lines.length > 0 ? (
            <motion.div className="space-y-8" variants={containerVariants}>
              {lines
                .filter((line) => line && line._id)
                .map((line: any) => (
                  <motion.div key={line._id} variants={itemVariants}>
                    <ProductionLineView
                      lineId={line._id}
                      onStepClick={handleStepClick}
                    />
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white rounded-xl shadow-lg p-10 text-center my-36"
              variants={itemVariants}
            >
              <div className="flex justify-center mb-6">
                <FiPackage className="text-6xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-3 font-vazir">
                هیچ خط تولیدی یافت نشد
              </h2>
              <p className="text-gray-500 mb-8 font-vazir">
                با ایجاد اولین خط تولید خود شروع کنید.
              </p>
              <Link
                href="/configure"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center gap-2 shadow-md font-vazir"
              >
                <FiPlus className="text-lg" />
                <span>ایجاد خط تولید</span>
              </Link>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
