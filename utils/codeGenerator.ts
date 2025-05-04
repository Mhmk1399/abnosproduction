import mongoose from "mongoose";

/**
 * Generates a unique sequential code for a given model
 * @param modelName The name of the model (e.g., "Customer", "Glass")
 * @param prefix Optional prefix for the code (e.g., "CUST", "GL")
 * @returns Promise with the next sequential code
 */
interface DocumentWithCode {
  code: string;
  _id: unknown;
  __v: number;
}

export async function generateSequentialCode(
  modelName: string,
  prefix: string = ""
): Promise<string> {
  try {
    // Get the model
    const Model = mongoose.model(modelName);
    
    // Find the document with the highest code
    const lastDocument = await Model.findOne({})
      .sort({ code: -1 }) // Sort by code in descending order
      .limit(1)
      .lean() as DocumentWithCode | null;
    
    let nextNumber = 1;
    
    if (lastDocument) {
      // Extract the numeric part from the last code
      const lastCode = lastDocument.code;
      const numericPart = prefix 
        ? parseInt(lastCode.replace(prefix, ""), 10)
        : parseInt(lastCode, 10);
      
      // Increment the number
      nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;
    }
    
    // Format the code with leading zeros (e.g., "001", "002")
    const formattedNumber = nextNumber.toString().padStart(4, "0");
    const newCode = prefix ? `${prefix}${formattedNumber}` : formattedNumber;
    
    return newCode;
  } catch (error) {
    console.error(`Error generating code for ${modelName}:`, error);
    throw new Error(`Failed to generate sequential code for ${modelName}`);
  }
}