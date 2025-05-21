// We'll import icons from react-icons library
export const navMenuItems = [
  {
    id: "inventories",
    title: "مدیریت انبار های تولید",
    icon: "FaBoxOpen", // Font Awesome Box Open icon
    children: [
      { id: "addInventory", title: " افزودن انبار تولید " },
      { id: "InventoryList", title: " لیست انبار ها" },
    ],
  },
  {
    id: "steps",
    title: "ایستگاه های تولید",
    icon: "FaListOl", // Font Awesome List Ordered icon
    children: [
      { id: "ProductionStepsView", title: "لیست ایستگاه های تولید" },
      { id: "AddProductionStep", title: "ساخت ایستگاه تولید" },
    ],
  },
  {
    id: "ProductionLinesPages",
    title: "مدیریت خطوط تولید",
    icon: "FaIndustry", // Font Awesome Industry icon
    children: [
      { id: "ProductionLinesPage", title: "لیست خطوط ساخته شده" },
      { id: "configure", title: "ساخت خط تولید" },
    ],
  },

  // {
  //   id: "configureMicroLines",
  //   title: "ساخت میکرو لاین ",
  //   icon: "FaMicrochip", // Font Awesome Microchip icon
  //   children: [
  //     { id: "AddconfigureMicroLine", title: "افزودن میکرولاین" },
  //     { id: "configureMicroLineList", title: "لیست میکرولاین" },
  //   ],
  // },
  {
    id: "layers",
    title: "مدیریت لایه ها ",
    icon: "FaLayerGroup", // Font Awesome Layer Group icon
    children: [{ id: "layer", title: "لیست لایه ها " }],
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
];
