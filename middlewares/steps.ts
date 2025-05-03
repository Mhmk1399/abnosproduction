import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connect from "@/lib/data";
import Steps from "@/models/steps";
import { v4 as uuidv4 } from "uuid";

export const getAllSteps = async () => {
  try {
    await connect();

    const steps = await Steps.find({}).sort({ createdAt: -1 });

    return NextResponse.json(steps, { status: 200 });
  } catch (error) {
    console.error("Error fetching steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
};

export const createStep = async (request: NextRequest) => {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Step name is required" },
        { status: 400 }
      );
    }

    // Generate a unique code if not provided
    if (!body.code) {
      body.code = `STEP-${uuidv4().substring(0, 8)}`;
    }

    // Create the new step
    const newStep = new Steps({
      name: body.name,
      code: body.code,
      description: body.description || "",
    });

    await newStep.save();

    return NextResponse.json(newStep, { status: 201 });
  } catch (error) {
    console.error("Error creating step:", error);

    // Handle validation error
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: "Step code must be unique" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create step" },
      { status: 500 }
    );
  }
};
