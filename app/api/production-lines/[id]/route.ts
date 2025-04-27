import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import productionLine from "@/models/productionLine";

// GET a specific production line
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const id = await params.id;
    const line = await productionLine.findById(id)
      .populate({
        path: 'steps.stepId',
        model: 'steps'
      })
      .populate({
        path: 'inventories.inventoryId',
        model: 'productionInventory'
      });
    
    if (!line) {
      return NextResponse.json(
        { error: 'Production line not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(line, { status: 200 });
  } catch (error) {
    console.error('Error fetching production line:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production line' },
      { status: 500 }
    );
  }
}

// UPDATE a production line
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const body = await request.json();
    const id = await params.id;
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Production line name is required' },
        { status: 400 }
      );
    }
    
    const updatedLine = await productionLine.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        steps: body.steps,
        inventories: body.inventories,
        flowOrder: body.flowOrder,
        active: body.active
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedLine) {
      return NextResponse.json(
        { error: 'Production line not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedLine, { status: 200 });
  } catch (error) {
    console.error('Error updating production line:', error);
    return NextResponse.json(
      { error: 'Failed to update production line' },
      { status: 500 }
    );
  }
}

// DELETE a production line
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const id = await params.id;
    const deletedLine = await productionLine.findByIdAndDelete(id);
    
    if (!deletedLine) {
      return NextResponse.json(
        { error: 'Production line not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting production line:', error);
    return NextResponse.json(
      { error: 'Failed to delete production line' },
      { status: 500 }
    );
  }
}
