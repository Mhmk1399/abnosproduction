import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Layer from '../../../../models/layers';

// GET a specific layer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const layerId = params.id;
    
    // Try to find by ID first
    let layer = await Layer.findById(layerId)
      .populate('currentStep.stepId')
      .populate('productionLineId')
      .populate('processHistory.stepId');
    
    // If not found by ID, try to find by code
    if (!layer) {
      layer = await Layer.findOne({ code: layerId })
        .populate('currentStep.stepId')
        .populate('productionLineId')
        .populate('processHistory.stepId');
    }
    
    if (!layer) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(layer, { status: 200 });
  } catch (error) {
    console.error('Error fetching layer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layer' },
      { status: 500 }
    );
  }
}

// UPDATE a layer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const layerId = params.id;
    const body = await request.json();
    
    // Find the layer
    const layer = await Layer.findById(layerId);
    
    if (!layer) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (body.batchId) layer.batchId = body.batchId;
    if (body.dimensions) layer.dimensions = body.dimensions;
    if (body.status) layer.status = body.status;
    if (body.productionLineId) layer.productionLineId = body.productionLineId;
    if (body.metadata) layer.metadata = { ...layer.metadata, ...body.metadata };
    
    await layer.save();
    
    return NextResponse.json(layer, { status: 200 });
  } catch (error) {
    console.error('Error updating layer:', error);
    return NextResponse.json(
      { error: 'Failed to update layer' },
      { status: 500 }
    );
  }
}

// DELETE a layer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const layerId = params.id;
    
    const result = await Layer.findByIdAndDelete(layerId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting layer:', error);
    return NextResponse.json(
      { error: 'Failed to delete layer' },
      { status: 500 }
    );
  }
}
