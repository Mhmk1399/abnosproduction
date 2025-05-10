import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import productionLine from "@/models/productionLine";
import "@/models/productionInventory";
import "@/models/microLine";
import { generateSequentialCode } from "@/utils/codeGenerator";
import MicroLine from "@/models/microLine";
import steps from "@/models/steps";
import ProductionInventory from "@/models/productionInventory";
export const createProductionLine = async (request: NextRequest) => {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Production line name is required" },
        { status: 400 }
      );
    }

    // Check if a production line with the same name already exists
    const existingLine = await productionLine.findOne({ name: body.name });
    if (existingLine) {
      return NextResponse.json(
        { error: "A production line with this name already exists" },
        { status: 400 }
      );
    }

    // Generate a unique code if not provided
    const code = await generateSequentialCode("productionLine", "");

    // Create the new production line
    const newLine = new productionLine({
      name: body.name,
      code,
      description: body.description || "",
      microLines: body.microLines || [],
      inventory: body.inventory || null,
      active: body.active !== undefined ? body.active : true,
    });

    await newLine.save();

    return NextResponse.json(newLine, { status: 201 });
  } catch (error: any) {
    console.error("Error creating production line:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      // Check which field caused the duplicate key error
      const keyValue = error.keyValue || {};
      if (keyValue.name) {
        return NextResponse.json(
          { error: "A production line with this name already exists" },
          { status: 400 }
        );
      } else if (keyValue.code) {
        return NextResponse.json(
          { error: "A production line with this code already exists" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "A duplicate entry already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create production line" },
      { status: 500 }
    );
  }
};

export const getAllProductionLines = async () => {
  try {
    await connect();

    // Fetch production lines with populated microLines and inventory
    const lines = await productionLine
      .find({})
      .populate({
        path: "microLines.microLine",
        model: MicroLine,
      })
      .populate({
        path: "inventory",
        model: ProductionInventory,
      })
      .sort({ createdAt: -1 });

      

    return NextResponse.json(lines, { status: 200 });
  } catch (error) {
    console.error("Error fetching production lines:", error);
    return NextResponse.json(
      { error: "Failed to fetch production lines" },
      { status: 500 }
    );
  }
};

export const getProductionLineById = async (id: string) => {
  try {
    await connect();
    console.log("Fetching production line with ID:", id);
    const line = await productionLine
      .findById(id)
      .populate({
        path: "microLines.microLine",
        model: MicroLine,
        populate: [
          {
            path: "steps.step",
            model: steps,
          },
          {
            path: "inventory",
            model: ProductionInventory,
          },
        ],
      })
      .populate({
        path: "inventory",
        model: ProductionInventory,
      });

    if (!line) {
      return NextResponse.json(
        { error: "Production line not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(line, { status: 200 });
  } catch (error) {
    console.error("Error fetching production line:", error);
    return NextResponse.json(
      { error: "Failed to fetch production line" },
      { status: 500 }
    );
  }
};

export const updateProductionLine = async (
  request: NextRequest,
  _id: string
) => {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Production line name is required" },
        { status: 400 }
      );
    }

    const updatedLine = await productionLine.findByIdAndUpdate(
      _id,
      {
        name: body.name,
        description: body.description,
        microLines: body.microLines,
        inventory: body.inventory,
        active: body.active,
      },
      { new: true, runValidators: true }
    );

    if (!updatedLine) {
      return NextResponse.json(
        { error: "Production line not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLine, { status: 200 });
  } catch (error) {
    console.error("Error updating production line:", error);
    return NextResponse.json(
      { error: "Failed to update production line" },
      { status: 500 }
    );
  }
};

export const deleteProductionLine = async (id: string) => {
  try {
    await connect();

    const deletedLine = await productionLine.findByIdAndDelete(id);

    if (!deletedLine) {
      return NextResponse.json(
        { error: "Production line not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting production line:", error);
    return NextResponse.json(
      { error: "Failed to delete production line" },
      { status: 500 }
    );
  }
};
