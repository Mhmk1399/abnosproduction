import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiPackage,
  FiLayers,
  FiList,
  FiBarChart2,
  FiUsers,
  FiTruck,
  FiCpu,
  FiActivity,
  FiAward,
} from "react-icons/fi";

interface WelcomeScreenProps {
  setActiveChild?: (childId: string) => void;
  setIsOpen?: (isOpen: boolean) => void;
  isPinned?: boolean;
  activeChild?: string | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  setActiveChild,
  setIsOpen,
  isPinned = false,
  activeChild = null,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // Update time and greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("صبح بخیر");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("ظهر بخیر");
    } else {
      setGreeting("عصر بخیر");
    }

    return () => clearInterval(timer);
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Function to handle quick access button clicks
  const handleQuickAccessClick = (childId: string) => {
    if (setActiveChild) {
      setActiveChild(childId);

      // Close sidebar on mobile if not pinned
      if (setIsOpen && window.innerWidth <= 768 && !isPinned) {
        setIsOpen(false);
      }
    }
  };

  // Quick access items with React icons
  const quickAccessItems = [
    {
      id: "addInventory",
      icon: <FiPackage size={24} />,
      label: "انبار",
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "ProductionLinesPage",
      icon: <FiLayers size={24} />,
      label: "تولید",
      color: "from-indigo-500 to-purple-400",
    },
    {
      id: "InventoryList",
      icon: <FiList size={24} />,
      label: "لیست",
      color: "from-green-500 to-emerald-400",
    },
  ];

  // Dashboard stats for visual appeal
  const dashboardStats = [
    {
      label: "تولید امروز",
      value: "۱۲۳",
      icon: <FiBarChart2 size={20} />,
      color: "bg-blue-500",
    },
    {
      label: "مشتریان فعال",
      value: "۴۵",
      icon: <FiUsers size={20} />,
      color: "bg-purple-500",
    },
    {
      label: "سفارشات",
      value: "۶۷",
      icon: <FiTruck size={20} />,
      color: "bg-green-500",
    },
    {
      label: "کارایی",
      value: "۸۹٪",
      icon: <FiActivity size={20} />,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="p-4 md:p-8 text-gray-700 mt-20">
      {/* Time and Greeting Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {greeting}
            </motion.h1>
            <motion.p
              className="text-gray-500 mt-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              به سیستم مدیریت آبنوس خوش آمدید
            </motion.p>
          </div>

          <motion.div
            className="mt-4 md:mt-0 bg-white p-3 rounded-xl shadow-md flex items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-indigo-100 ml-2 text-indigo-700 p-2 rounded-lg mr-3">
              <FiCpu size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">امروز</p>
              <p className="font-medium">
                {currentTime.toLocaleDateString("fa-IR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Access */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">دسترسی سریع</h2>
              {setActiveChild && (
                <motion.span
                  className="text-sm font-medium text-indigo-600 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    y: [0, -3, 0],
                    transition: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 1.5,
                    },
                  }}
                >
                  <FiAward className="mr-1" /> برای شروع انتخاب کنید
                </motion.span>
              )}
            </div>

            {setActiveChild && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {quickAccessItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`bg-gradient-to-br ${item.color} rounded-xl overflow-hidden cursor-pointer`}
                    onClick={() => handleQuickAccessClick(item.id)}
                  >
                    <div
                      className={`h-full w-full p-6 flex flex-col items-center justify-center text-white ${
                        activeChild === item.id
                          ? "bg-black bg-opacity-20"
                          : "hover:bg-black hover:bg-opacity-10"
                      }`}
                    >
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                          transition: {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2,
                          },
                        }}
                        className="mb-3"
                      >
                        {item.icon}
                      </motion.div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center"
              >
                <div
                  className={`${stat.color} text-white p-3 rounded-full mb-3`}
                >
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6 h-fit"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">وضعیت سیستم</h2>

          {/* System Status Cards */}
          <div className="space-y-4">
            <motion.div
              className="p-4 bg-green-50 border border-green-100 rounded-lg"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 animate-ping opacity-75"></div>
                </div>
                <span className="mr-2 font-medium text-green-700">
                  سیستم فعال است
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1 mr-5">
                همه سرویس‌ها در حال اجرا هستند
              </p>
            </motion.div>

            <motion.div
              className="p-4 bg-blue-50 border border-blue-100 rounded-lg"
              whileHover={{ x: 5 }}
            >
              <div className="flex justify-between">
                <span className="font-medium text-blue-700">
                  آخرین به‌روزرسانی
                </span>
                <span className="text-sm text-blue-600">امروز ۱۰:۳۰</span>
              </div>
              <div className="mt-2 bg-blue-100 rounded-full h-1.5">
                <motion.div
                  className="bg-blue-600 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                ></motion.div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 bg-purple-50 border border-purple-100 rounded-lg"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-purple-700">
                  فضای ذخیره‌سازی
                </span>
                <span className="text-sm text-purple-600">۶۵٪</span>
              </div>
              <div className="mt-2 bg-purple-100 rounded-full h-1.5">
                <motion.div
                  className="bg-purple-600 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1.5, delay: 1.2 }}
                ></motion.div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-4">
              فعالیت‌های اخیر
            </h3>
            <div className="space-y-3">
              {[
                { text: "سفارش جدید ثبت شد", time: "۱۵ دقیقه پیش" },
                { text: "تولید محصول A-123 تکمیل شد", time: "۲ ساعت پیش" },
                { text: "گزارش هفتگی آماده است", time: "دیروز" },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + index * 0.2 }}
                  className="flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <span className="text-sm">{activity.text}</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
