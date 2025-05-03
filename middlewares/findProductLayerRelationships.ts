import mongoose from 'mongoose';
import connect from '@/lib/data';
import ProductLayer from '@/models/productLayer';
import Product from '@/models/product';
import ProductionLine from '@/models/productionLine';
import Steps from '@/models/steps';

export async function findProductLayerRelationships(productLayerId: string) {
  await connect();
  
  // Find the product layer
  const productLayer = await ProductLayer.findById(productLayerId)
   
  
  if (!productLayer) {
    throw new Error('Product layer not found');
  }
  
  // Determine the production line
  let productionLine;
  
  if (productLayer.productionLine) {
    // If the production line is directly specified in the layer
    productionLine = productLayer.productionLine;
  } else if (productLayer.product && productLayer.product.productLine) {
    // If the production line is specified in the product
    productionLine = await ProductionLine.findById(productLayer.product.productLine);
  } else {
    console.log('No production line found for this layer');
  }
  
  // Get all steps for this production line
  let allSteps = [];
  if (productionLine) {
    // Get the full production line with populated steps
    const fullProductionLine = await ProductionLine.findById(productionLine._id)
      .populate({
        path: 'steps.stepId',
        model: 'steps'
      });
    
    if (fullProductionLine) {
      // Extract steps in order
      allSteps = fullProductionLine.steps.sort((a, b) => a.order - b.order)
        .map(step => step.stepId);
    }
  }
  
  // Get current step information
  const currentStep = productLayer.currentStep;
  
  return {
    productLayer,
    productionLine,
    currentStep,
    allSteps
  };
}

// Usage example
async function main() {
  try {
    const result = await findProductLayerRelationships('68115ad51811de099143d92a');
    console.log('Product Layer:', result.productLayer.code);
    console.log('Production Line:', result.productionLine ? result.productionLine.name : 'None');
    console.log('Current Step:', result.currentStep ? result.currentStep.name : 'None');
    console.log('All Steps in Production Line:');
    result.allSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name} (${step.code})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

main();
