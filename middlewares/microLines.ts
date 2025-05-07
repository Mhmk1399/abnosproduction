import microLine from "@/models/microLine";
import steps from "@/models/steps";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";
import productionInventory from "@/models/productionInventory";

export const getAllMicroLines = async () => {
  try {
    // Fetch all micro lines
    const lines = await microLine
      .find({})
      .populate({
        path: "steps.step",
        model: steps,
      })
      .populate({
        path: "inventory",
        model: productionInventory,
      });
    return NextResponse.json(lines, { status: 200 });
  } catch (error) {
    console.error("Error fetching micro lines:", error);
    return NextResponse.json(
      { error: "Failed to fetch micro lines" },
      { status: 500 }
    );
  }
};

export const createMicroLine = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, inventory } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Micro line name is required" },
        { status: 400 }
      );
    }

    // Generate a unique code if not provided
    const code = await generateSequentialCode("MicroLine", "");

    // Create the new micro line
    const newLine = new microLine({
      name,
      code: code,
      description: description,
      steps: body.steps,
      inventory,
    });
    await newLine.save();
    // Update the production line to include the new micro line

    return NextResponse.json(newLine, { status: 201 });
  } catch (error) {
    console.error("Error creating micro line:", error);
    return NextResponse.json(
      { error: "Failed to create micro line" },
      { status: 500 }
    );
  }
};

export const updateMicroLine = async (
  request: {
    name: string;
    description: string;
    steps: string;
    inventory: string;
  },
  _id: string
) => {
  try {
    const { name, description, steps, inventory } = request;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Micro line name is required" },
        { status: 400 }
      );
    }

    // Update the micro line
    const updatedLine = await microLine.findByIdAndUpdate(
      _id,
      {
        name,
        description,
        steps,
        inventory,
      },
      { new: true, runValidators: true }
    );

    if (!updatedLine) {
      return NextResponse.json(
        { error: "Micro line not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedLine, { status: 200 });
  } catch (error) {
    console.error("Error updating micro line:", error);
    return NextResponse.json(
      { error: "Failed to update micro line" },
      { status: 500 }
    );
  }
};

export const deleteMicroLine = async (_id: string) => {
  try {
    // Delete the micro line
    const deletedLine = await microLine.findByIdAndDelete(_id);
    if (!deletedLine) {
      return NextResponse.json(
        { error: "Micro line not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting micro line:", error);
    return NextResponse.json(
      { error: "Failed to delete micro line" },
      { status: 500 }
    );
  }
};
