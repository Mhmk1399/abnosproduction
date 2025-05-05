import { NextResponse, NextRequest } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "@/models/productLayer";
import customer from "@/models/customer";
import steps from "@/models/steps";
import productionLine from "@/models/productionLine";
import productionInventory from "@/models/productionInventory";
import glass from "@/models/glass";
import invoice from "@/models/invoice";
export const getProductLayers = async () => {
  await connect();
  try {
    const productLayers = await ProductLayer.find().populate({
      path:"customer",
      model: customer
    }).populate({
      path:"currentStep",
      model: steps
    }).populate({
      path:"currentline",
      model: productionLine
    }).populate({
      path:"currentInventory",
      model: productionInventory
    }).populate({
      path: "glass",
      model:glass
    }).populate({
      path:"invoice",
      model:invoice
    });
   
    return NextResponse.json({ productLayers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product layers" },
      { status: 500 }
    );
  }
};

export const updateProductLayer = async (req: NextRequest) => {
  await connect();
  try {
    const {
      _id,
      customer,
      code,
      glass,
      treatments,
      width,
      height,
      product,
      invoice,
      productionCode,
      productionLine,
      productionDate,
      currentStep,
      currentline,
      currentInventory,
      productionNotes,
      designNumber,
    } = await req.json();

    const updatedProductLayer = await ProductLayer.findByIdAndUpdate(
      _id,
      {
        customer,
        code,
        glass,
        treatments,
        width,
        height,
        product,
        invoice,
        productionCode,
        productionLine,
        productionDate,
        currentStep,
        currentline,
        currentInventory,
        productionNotes,
        designNumber,
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Product layer updated successfully", updatedProductLayer },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product layer", details: error },
      { status: 500 }
    );
  }
};


export const deleteProductLayer = async (req: NextRequest) => {
  try {
    const { id } = await req.json();
    await ProductLayer.findByIdAndDelete(id)
    
  
    return NextResponse.json(
      { message: "Product layer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product layer", details: error },
      { status: 500 }
    );
  }
};

export const getProductLayerById = async (id: string) => {
  try {
    if (!id) {
      return NextResponse.json(
        { error: "Product layer ID is required" },
        { status: 400 }
      );
    }
    
    const productLayer = await ProductLayer.findById(id)
      .populate({
        path: "customer",
        model: customer
      })
      .populate({
        path: "currentStep",
        model: steps
      })
      .populate({
        path: "currentline",
        model: productionLine
      })
      .populate({
        path: "currentInventory",
        model: productionInventory
      })
      .populate({
        path: "glass",
        model: glass
      }).populate({
        path: "invoice",
      model:invoice
      });
      
    if (!productLayer) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ productLayer }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product layer", details: error },
      { status: 500 }
    );
  }
};export const createProductLayer = async (req: NextRequest) => {
  await connect();
  try {
    const data = await req.json();
    
    const newProductLayer = new ProductLayer(data);
    await newProductLayer.save();
    
    return NextResponse.json(
      { message: "Product layer created successfully", productLayer: newProductLayer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product layer", details: error },
      { status: 500 }
    );
  }
};