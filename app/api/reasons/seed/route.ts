import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reason from "@/models/reason";

export async function POST() {
  try {
    await dbConnect();
    
    const sampleReasons = [
      { reason: "شکستگی شیشه", textId: "GB001" },
      { reason: "ابعاد اشتباه", textId: "WD002" },
      { reason: "نقص کیفیت", textId: "QD003" },
      { reason: "خرابی دستگاه", textId: "ME004" }
    ];

    await Reason.deleteMany({}); // Clear existing
    await Reason.insertMany(sampleReasons);
    
    return NextResponse.json({ message: "نمونه دلایل با موفقیت اضافه شد" });
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در اضافه کردن نمونه دلایل" },
      { status: 500 }
    );
  }
}