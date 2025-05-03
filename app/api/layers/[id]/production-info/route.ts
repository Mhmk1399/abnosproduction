import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import ProductLayer from '@/models/productLayer';
import Product from '@/models/product';
import ProductionLine from '@/models/productionLine';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    
    const productLayerId = params.id;
    
    // Find the product layer
    const productLayer = await ProductLayer.findById(productLayerId)
      .populate('product')
      .populate('currentStep');
    
    if (!productLayer) {
      return NextResponse.json(
        { error: 'Product layer not found' },
        { status: 404 }
      );
    }
    
    // Determine the production line
    let productionLine = null;
    let allSteps = [];
    
    if (productLayer.productionLine) {
      // If the production line is directly specified in the layer
      productionLine = await ProductionLine.findById(productLayer.productionLine)
        .populate({
          path: 'steps.stepId',
          model: 'steps'
        });
    } else if (productLayer.product && productLayer.product.productLine) {
      // If the production line is specified in the product
      productionLine = await ProductionLine.findById(productLayer.product.productLine)
        .populate({
          path: 'steps.stepId',
          model: 'steps'
        });
    }
    
    // Extract steps in order
    if (productionLine) {
      allSteps = productionLine.steps
        .sort((a, b) => a.order - b.order)
        .map(step => step.stepId);
    }
    
    return NextResponse.json({
      productionLine,
      allSteps
    });
  } catch (error) {
    console.error('Error fetching production info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production information' },
      { status: 500 }
    );
  }
}