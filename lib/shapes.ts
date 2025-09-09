import React from "react";
import {
  FaSquare,
  FaCircle,
  FaStar,
  FaHeart,
  FaCross,
  FaShapes,
} from "react-icons/fa";
import {
  IconRectangle,
  IconOval,
  IconTriangle,
  IconHexagon,
  IconOctagon,
  IconDiamond,
  IconCircleHalf,
 
  IconPentagon,
} from "@tabler/icons-react";

export interface Shape {
  code: string;
  name: string;
  icon: React.ComponentType<any>;
}

export const SHAPES: Shape[] = [
  { code: "10", name: "مربع", icon: FaSquare },
  { code: "11", name: "مستطیل", icon: IconRectangle },
  { code: "12", name: "دایره", icon: FaCircle },
  { code: "13", name: "بیضی", icon: IconOval },
  { code: "14", name: "مثلث", icon: IconTriangle },
  { code: "15", name: "شش ضلعی", icon: IconHexagon },
  { code: "16", name: "هشت ضلعی", icon: IconOctagon },
  { code: "17", name: "ذوزنقه", icon: FaShapes },
  { code: "18", name: "لوزی", icon: IconDiamond },
  { code: "19", name: "نیم دایره", icon: IconCircleHalf },
  
  { code: "22", name: "ستاره", icon: FaStar },
  { code: "23", name: "قلب", icon: FaHeart },
  { code: "24", name: "صلیب", icon: FaCross },
  { code: "25", name: "پنج ضلعی", icon: IconPentagon },
  { code: "26", name: "هفت ضلعی", icon: FaShapes },
  { code: "27", name: "نه ضلعی", icon: FaShapes },
  { code: "28", name: "ده ضلعی", icon: FaShapes },
  { code: "29", name: "شکل آزاد", icon: FaShapes },
  { code: "30", name: "سایر", icon: FaShapes },
];

export const getShapeByCode = (code: string): Shape | null => {
  return SHAPES.find(s => s.code === code) || null;
};
console.log(getShapeByCode)

export const getShapeNameByCode = (code: string): string => {
  const shape = getShapeByCode(code);
  return shape ? shape.name : "نامشخص";
};

export const getShapeIconByCode = (code: string): React.ComponentType<any> => {
  const shape = getShapeByCode(code);
  return shape ? shape.icon : FaShapes;
};