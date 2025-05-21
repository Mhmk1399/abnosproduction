"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navMenuItems } from "../../lib/sideBar";
import WelcomeScreen from "./welcome";
import AddInventoryForm from "../inventory/addInventory";
import InventoryList from "../inventory/inventoryList";
import WorkerPage from "../workers-layers/workers";
import OptimizerPage from "../workers-layers/optimaizer";
import AddProductionStep from "../steps/AddProductionStep";
import ProductionStepsView from "../steps/ProductionStepsView";
import { NavMenuItem, MenuItemChild } from "../../types/types";
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
  FaTimes,
  FaBars,
  FaChevronLeft,
  FaSearch,
  FaThumbtack,
} from "react-icons/fa";
import CreateProductionLine from "../ProductionLine/CreateProductionLine";
import ProductionLine from "../ProductionLine/ProductionLine";
import LayerList from "../workers-layers/LayerList";

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

// Enhanced animation variants
const sidebarVariants = {
  open: {
    width: "280px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  closed: {
    width: "0px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const NavItem = ({
  item,
  setActiveChild,
  setIsOpen,
  activeChild,
  isPinned,
}: {
  item: NavMenuItem;
  setActiveChild: (childId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  activeChild: string | null;
  isPinned: boolean;
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
    if (window.innerWidth < 768 && !isPinned) {
      setIsOpen(false);
    }
  };

  const hasActiveChild =
    activeChild && item.children.some((child) => child.id === activeChild);

  return (
    <motion.div className="mb-2" variants={itemVariants}>
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          hasActiveChild
            ? "bg-blue-50 text-blue-600"
            : "hover:bg-gray-50 text-gray-700"
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div
              className={`${
                hasActiveChild ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <IconComponent size={18} />
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
          animate={{ rotate: isDropdownOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={`${hasActiveChild ? "text-blue-600" : "text-gray-500"}`}
        >
          <FaChevronLeft size={14} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pr-2 mr-3 mt-1 border-r border-gray-100">
              {item.children.map((child: MenuItemChild) => {
                const isActive = child.id === activeChild;
                return (
                  <motion.div
                    key={child.id}
                    whileHover={{ x: 4 }}
                    className={`py-2.5 px-4 my-1 text-sm rounded-lg cursor-pointer transition-all duration-150 ${
                      isActive
                        ? "bg-blue-500 text-white shadow-sm"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                    onClick={() => {
                      handleChildClick(child.id);
                      setIsOpen(false);
                    }}
                  >
                    {child.title}
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
      case "welcome":
      case null:
        return (
          <WelcomeScreen
            setActiveChild={setActiveChild}
            setIsOpen={setIsOpen}
            isPinned={isPinned}
            activeChild={childId}
          />
        );
      case "addInventory":
        return <AddInventoryForm />;
      case "InventoryList":
        return <InventoryList />;
      case "ProductionLinesPage":
        return <ProductionLine setActiveChild={setActiveChild} />;
      case "configure":
        return <CreateProductionLine />;
      case "layer":
        return <LayerList />;
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
      <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-lg font-bold mb-2">خطا در بارگذاری</h2>
        <p>لطفاً دوباره تلاش کنید.</p>
      </div>
    );
  }
};

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Filter menu items based on search term
  const filteredMenuItems = searchTerm
    ? navMenuItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.children.some((child) =>
            child.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : navMenuItems;

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

  // Toggle pin state
  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="flex h-full overflow-auto" dir="rtl">
      {/* Menu Button with Animation */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <FaTimes className="text-blue-600" size={18} />
        ) : (
          <FaBars className="text-blue-600" size={18} />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && !isPinned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-md z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || isPinned) && (
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className={`fixed top-0 right-0 h-full z-40 bg-white shadow-xl overflow-hidden ${
              isPinned ? "border-l border-gray-200" : ""
            }`}
          >
            <div className="h-full flex flex-col mt-10 p-4">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between py-4 border-b border-gray-100 mb-4"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white p-2 rounded-lg">
                    <FaCogs size={18} />
                  </div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    آبنوس پلتفورم
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={togglePin}
                    className={`p-2 rounded-md transition-colors ${
                      isPinned
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={isPinned ? "آزاد کردن منو" : "پین کردن منو"}
                  >
                    {isPinned ? (
                      <FaThumbtack size={14} />
                    ) : (
                      <FaThumbtack size={14} />
                    )}
                  </motion.button>
                  {!isPinned && (
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTimes size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Search */}
              <motion.div className="relative mb-4" variants={itemVariants}>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaSearch className="text-gray-400" size={14} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو در منو..."
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </motion.div>

              {/* Navigation Menu with Scroll */}
              <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {filteredMenuItems.length === 0 ? (
                  <motion.div
                    className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg"
                    variants={itemVariants}
                  >
                    <p>نتیجه‌ای یافت نشد</p>
                    <p className="text-sm mt-1">
                      لطفاً عبارت دیگری را جستجو کنید
                    </p>
                  </motion.div>
                ) : (
                  filteredMenuItems.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      setActiveChild={setActiveChild}
                      setIsOpen={setIsOpen}
                      activeChild={activeChild}
                      isPinned={isPinned}
                    />
                  ))
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <motion.div
                className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500"
                variants={itemVariants}
              >
                <p className="font-medium mb-2">میانبرهای کیبورد:</p>
                <div className="flex justify-between items-center mb-1">
                  <span>باز/بستن منو</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">
                    Ctrl + B
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>بستن منو</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">
                    Esc
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isPinned ? "mr-[280px]" : ""
        }`}
      >
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

// Add custom scrollbar styles to global CSS
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

const SideBarWithStyles = () => {
  return (
    <>
      <GlobalStyles />
      <SideBar />
    </>
  );
};

export default SideBarWithStyles;
