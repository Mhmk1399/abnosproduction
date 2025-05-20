"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navMenuItems } from "../../lib/sideBar";
import WelcomeScreen from "./welcome";
import AddInventoryForm from "../inventory/addInventory";
import InventoryList from "../inventory/inventoryList";
import WorkerPage from "./workers";
import OptimizerPage from "../ProductionLine/optimaizer";
import LayerDetailsPage from "./layerDetail";
import AddProductionStep from "../steps/AddProductionStep";
import ProductionStepsView from "../steps/ProductionStepsView";

import {
  FaBoxOpen,
  FaIndustry,
  FaCogs,
  FaMicrochip,
  FaLayerGroup,
  FaStream,
  FaChartLine,
  FaListOl,
  FaCog,
  FaUsers,
} from "react-icons/fa";
import CreateProductionLine from "../ProductionLine/CreateProductionLine";
import ProductionLine from "../ProductionLine/ProductionLine";

const iconMap = {
  FaBoxOpen,
  FaIndustry,
  FaCogs,
  FaMicrochip,
  FaLayerGroup,
  FaStream,
  FaChartLine,
  FaListOl,
  FaCog,
  FaUsers,
};

interface MenuItemChild {
  id: string;
  title: string;
}

interface NavMenuItem {
  id: string;
  title: string;
  icon: string;
  children: {
    id: string;
    title: string;
  }[];
}

// Simple animation variants
const sidebarVariants = {
  open: {
    width: "280px",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  closed: {
    width: "0px",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

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
  const IconComponent = item.icon && iconMap[item.icon as keyof typeof iconMap];

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
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const hasActiveChild =
    activeChild && item.children.some((child) => child.id === activeChild);

  return (
    <div className="mb-2">
      <div
        className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all duration-200 ${
          hasActiveChild ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2.5">
          {IconComponent && (
            <div
              onClick={() => setIsOpen(false)}
              className={`${
                hasActiveChild ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <IconComponent size={16} />
            </div>
          )}
          <span
            className={`text-sm font-medium ${
              hasActiveChild ? "text-blue-600" : "text-gray-700"
            }`}
          >
            {item.title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`${hasActiveChild ? "text-blue-600" : "text-gray-500"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pr-2 mr-2 mt-1 border-r border-gray-100">
              {item.children.map((child: MenuItemChild) => {
                const isActive = child.id === activeChild;
                return (
                  <div
                    key={child.id}
                    className={`py-2 px-3 my-1 text-xs rounded-md cursor-pointer transition-all duration-150 ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                    onClick={() => {
                      handleChildClick(child.id);
                      setIsOpen(false);
                    }}
                  >
                    {child.title}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  return <ProductionLine setActiveChild={setActiveChild} />;
      case "configure":
        return <CreateProductionLine />;
      case "layer":
        return <LayerDetailsPage />;
      case "optimizer":
        return <OptimizerPage />;
      case "WorkerPage":
        return <WorkerPage />;
      case "ProductionStepsView":
        return <ProductionStepsView />;
      case "AddProductionStep":
        return <AddProductionStep />;
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

  // Close sidebar when clicking outside
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
    <div className="flex h-full overflow-auto" dir="rtl">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white p-2 rounded-md shadow-md hover:shadow-lg transition-shadow focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && !isPinned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 right-0 h-full z-40 bg-white shadow-lg overflow-hidden"
          >
            <div className="h-full flex flex-col p-4">
              <div className="mr-auto w-full gap-3 py-4 border-b border-gray-100">
                <h1 className="text-lg font-semibold mr-28 -mt-2 text-gray-800">
                  آبنوس پلتفورم
                </h1>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto py-2">
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

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>نسخه ۱.۰.۰</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600"
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
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
        <main className="w-full">
          {renderChildComponent(
            activeChild,
            setActiveChild,
            setIsOpen,
            isPinned
          )}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
