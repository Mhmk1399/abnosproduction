import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connect from "@/lib/data";
import Steps from "@/models/steps";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

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
    const password = bcrypt.hashSync(body.password, 10);
    // Create the new step
    const newStep = new Steps({
      name: body.name,
      code: body.code,
      description: body.description || "",
      password: password || "",
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

export const deleteStep = async (id: string) => {
  try {
    await connect();

    const result = await Steps.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Step not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Step deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting step:", error);
    return NextResponse.json(
      { error: "Failed to delete step" },
      { status: 500 }
    );
  }
};

export const updateStep = async (request: NextRequest, id: string) => {
  try {
    await connect();
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Step name is required" },
        { status: 400 }
      );
    }

    const password = bcrypt.hashSync(body.password, 10);
    const updatedStep = await Steps.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        password: password,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStep) {
      return NextResponse.json(
        { error: "Step not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStep, { status: 200 });
  }catch (error) {
    console.error("Error updating step:", error);
    return NextResponse.json(
      { error: "Failed to update step" },
      { status: 500 }
    );
  }
};

export const getStepById = async (id: string) => {
  try {
    await connect();  
    const step = await Steps.findById(id);
    if (!step) {
      return NextResponse.json(
        { error: "Step not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(step, { status: 200 });
  } catch (error) {
    console.error("Error fetching step:", error);
    return NextResponse.json(
      { error: "Failed to fetch step" },
      { status: 500 }
    );
  }
};