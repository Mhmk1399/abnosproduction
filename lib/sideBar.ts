// We'll import icons from react-icons library
export const navMenuItems = [
  {
    id: "inventories",
    title: "مدیریت موجودی",
    icon: "FaBoxOpen", // Font Awesome Box Open icon
    children: [
      { id: "addInventory", title: " افزودن موجودی " },
      { id: "InventoryList", title: " لیست موجودی" },
    ],
  },
  {
    id: "ProductionLinesPages",
    title: "افزودن خط تولید",
    icon: "FaIndustry", // Font Awesome Industry icon
    children: [{ id: "ProductionLinesPage", title: "افزودن خط" }],
  },
  {
    id: "configures",
    title: "تنظیمات پیکربندی",
    icon: "FaCogs", // Font Awesome Cogs icon
    children: [{ id: "configure", title: "پیکربندی" }],
  },
  {
    id: "configureMicroLines",
    title: "تنظیمات پیکربندی میکرو لاین",
    icon: "FaMicrochip", // Font Awesome Microchip icon
    children: [
      { id: "AddconfigureMicroLine", title: "افزودن میکرولاین" },
      { id: "configureMicroLineList", title: "لیست میکرولاین" },
    ],
  },
  {
    id: "layers",
    title: "مدیریت لایه ها ",
    icon: "FaLayerGroup", // Font Awesome Layer Group icon
    children: [{ id: "layer", title: "لیست لایه ها " }],
  },
  {
    id: "microLines",
    title: "میکرو لاین ها",
    icon: "FaStream", // Font Awesome Stream icon
    children: [{ id: "microLine", title: "میکرو لاین" }],
  },
  {
    id: "Workers",
    title: "نیرو ها",
    icon: "FaUsers", // Font Awesome Stream icon
    children: [{ id: "WorkerPage", title: "نیرو ها" }],
  },
  {
    id: "optimizers",
    title: "بهینه ساز",
    icon: "FaChartLine", // Font Awesome Chart Line icon
    children: [{ id: "optimizer", title: "بهینه ساز" }],
  },
  {
    id: "steps",
    title: "مراحل",
    icon: "FaListOl", // Font Awesome List Ordered icon
    children: [{ id: "step", title: "ساخت مرحله" }],
  },
  {
    id: "setting",
    title: "تنظیمات",
    icon: "FaCog", // Font Awesome Cog icon
    children: [{ id: "setting1", title: "تنظیمات دسترسی" }],
  },
];
