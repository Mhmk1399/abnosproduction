"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { navMenuItems } from "../lib/sideBar";
import ProductionLinesPage from "./addProductionLine";
import WelcomeScreen from "./welcome";
import AddInventoryForm from "./addInventory";
import InventoryList from "./inventoryList";
import ConfigurePage from "@/app/configure/page";
import ConfigureMicroLinePage from "@/app/configure-micro-line/page";
import LayerDetailsPage from "@/app/layers/[id]/page";

interface MenuItemChild {
  id: string;
  title: string;
}

interface NavMenuItem {
  id: string;
  title: string;
  children: {
    id: string;
    title: string;
  }[];
}

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1,
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  closed: {
    opacity: 0,
    x: 20,
    transition: {
      delay: 0,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  closed: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Enhanced NavItem component with better hover effects and animations
const NavItem = ({
  item,
  setActiveChild,
  setIsOpen,
  activeChild,
}: {
  item: NavMenuItem;
  setActiveChild: (childId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  activeChild: string | null;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-open dropdown if a child is active
  useEffect(() => {
    if (
      activeChild &&
      item.children.some((child) => child.id === activeChild)
    ) {
      setIsDropdownOpen(true);
    }
  }, [activeChild, item.children]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleChildClick = (childId: string) => {
    setActiveChild(childId);
    // Don't close sidebar on mobile for better UX
    if (window.innerWidth > 768) {
      setIsOpen(false);
    }
  };

  // Check if any child is active
  const hasActiveChild =
    activeChild && item.children.some((child) => child.id === activeChild);

  return (
    <motion.div variants={itemVariants} className="mb-3">
      <motion.div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${
          hasActiveChild
            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800"
        }`}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleDropdown}
      >
        <span
          className={`font-medium ${
            hasActiveChild ? "text-white" : "text-indigo-800"
          }`}
        >
          {item.title}
        </span>
        <motion.div
          animate={{
            rotate: isDropdownOpen ? 180 : 0,
            color: hasActiveChild ? "#ffffff" : "#4f46e5",
          }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${
              hasActiveChild ? "text-white" : "text-indigo-600"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pr-4 border-r-2 border-indigo-200 mr-3 mt-1">
              {item.children.map((child: MenuItemChild) => {
                const isActive = child.id === activeChild;

                return (
                  <motion.div
                    key={child.id}
                    className={`py-2 px-4 mb-2 rounded-md cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-500 text-white shadow-sm transform translate-x-2"
                        : "hover:bg-indigo-100 text-gray-700 hover:text-indigo-700"
                    }`}
                    whileHover={{
                      x: isActive ? 2 : 6,
                      backgroundColor: isActive
                        ? "rgba(99, 102, 241, 0.8)"
                        : "rgba(99, 102, 241, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChildClick(child.id)}
                  >
                    <div className="flex items-center">
                      <span
                        className={isActive ? "font-medium text-white" : ""}
                      >
                        {child.title}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Function that renders a child component based on the active child's id
const renderChildComponent = (
  childId: string | null,
  setActiveChild: (childId: string) => void,
  setIsOpen: (isOpen: boolean) => void,
  isPinned: boolean
) => {
  try {
    switch (childId) {
      case "addInventory":
        return <AddInventoryForm />;
      case "InventoryList":
        return <InventoryList />;
      case "ProductionLinesPage":
        return <ProductionLinesPage />;
      case "configure":
        return <ConfigurePage />;
      case "configureMicroLine":
        return <ConfigureMicroLinePage />;
      case "layer":
        return <LayerDetailsPage />;
      default:
        return (
          <WelcomeScreen
            setActiveChild={setActiveChild}
            setIsOpen={setIsOpen}
            isPinned={isPinned}
            activeChild={childId}
          />
        );
    }
  } catch (error) {
    console.error("Error rendering child component:", error);
    return (
      <div className="p-4 text-red-600">
        <h2 className="text-lg font-bold">خطا در بارگذاری</h2>
        <p>لطفاً دوباره تلاش کنید.</p>
      </div>
    );
  }
};

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside (only if not pinned)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isPinned &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isPinned]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Close sidebar with Escape
      if (event.key === "Escape" && isOpen && !isPinned) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPinned]);

  return (
    <div className="flex h-full" dir="rtl">
      {/* Enhanced Floating Action Button with Tooltip */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl focus:outline-none relative"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </>
          )}
        </motion.button>
      </div>

      {/* Enhanced Backdrop with Blur Effect */}
      <AnimatePresence>
        {isOpen && !isPinned && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{
              opacity: 1,
              backdropFilter: "blur(8px)",
              transition: { duration: 0.4 },
            }}
            exit={{
              opacity: 0,
              backdropFilter: "blur(0px)",
              transition: { duration: 0.3, delay: 0.1 },
            }}
            className="fixed inset-0 bg-indigo-900/10 z-30"
            onClick={() => !isPinned && setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Redesigned Sidebar with Glass Morphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                width: "320px",
                boxShadow: "10px 0px 50px rgba(99, 102, 241, 0.15)",
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.4,
                },
              },
              closed: {
                width: "0px",
                boxShadow: "none",
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 40,
                  delay: 0.1,
                  duration: 0.4,
                },
              },
            }}
            className={`fixed top-0 right-0 h-full z-40 overflow-hidden ${
              isPinned
                ? "bg-white border-l border-indigo-100"
                : "bg-white/90 backdrop-blur-md border-l border-indigo-100/50"
            }`}
          >
            <motion.div
              variants={contentVariants}
              className="h-full flex flex-col py-6 px-4 overflow-hidden"
            >
              {/* Enhanced Logo and App Name with Pin Button */}
              <motion.div
                variants={itemVariants}
                className="mt-10 mb-8 px-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-2xl shadow-lg flex items-center justify-between w-full relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-[url('/assets/images/pattern.svg')] opacity-10"
                    animate={{
                      x: [0, 10, 0],
                      y: [0, 5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 8,
                      repeatType: "mirror",
                    }}
                  />
                  <div className="flex items-center">
                    <motion.div
                      className="bg-white p-1.5 rounded-full mr-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src="/assets/images/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </motion.div>
                    <h1 className="text-xl font-bold text-white">
                      آبنوس پلتفورم
                    </h1>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Menu Items with Dropdowns */}
              <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                {navMenuItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    setActiveChild={setActiveChild}
                    setIsOpen={setIsOpen}
                    activeChild={activeChild}
                  />
                ))}
              </div>

              {/* Redesigned User Profile Card */}
              <motion.div variants={itemVariants} className="mt-auto py-4 px-3">
                <motion.div
                  className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 opacity-50"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <div className="z-10 w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-indigo-800">
                          آبنوس سیستم
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          مدیریت تولید
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-indigo-100 p-2 rounded-full text-indigo-600"
                        onClick={() => !isPinned && setIsOpen(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="mt-4 text-center text-xs text-gray-400 flex justify-center items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.span
                    className="px-2 py-1 bg-indigo-50 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    نسخه ۱.۰.۰
                  </motion.span>
                  <span>•</span>
                  <motion.span whileHover={{ scale: 1.05 }}>
                    آبنوس سیستم
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Smooth Transition */}
      <motion.div
        className={`flex-1 transition-all duration-300 p-4 ${
          isPinned && isOpen ? "mr-[320px]" : ""
        }`}
        animate={{
          opacity: activeChild ? 1 : 0.97,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        <motion.main
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {renderChildComponent(
            activeChild,
            setActiveChild,
            setIsOpen,
            isPinned
          )}
        </motion.main>
      </motion.div>
    </div>
  );
};

export default SideBar;
