
import { NextResponse, NextRequest } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "@/models/productLayer";
import customer from "@/models/customer";
import steps from "@/models/steps";
import productionLine from "@/models/productionLine";
import productionInventory from "@/models/productionInventory";
import glass from "@/models/glass";
import invoice from "@/models/invoice";
import microLine from "@/models/microLine"; // Add this if it exists

export const getProductLayers = async () => {
  await connect();
  try {
    const productLayers = await ProductLayer.find()
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
      })
      .populate({
        path: "invoice",
        model: invoice
      })
      // Populate productionLine
      .populate({
        path: "productionLine",
        model: productionLine
      });

    // Now we need to populate the microLines for each productionLine
    // This is a more complex population that requires a second step
    for (const layer of productLayers) {
      if (layer.productionLine && layer.productionLine.microLines) {
        // Populate each microLine reference
        await Promise.all(layer.productionLine.microLines.map(async (microLineRef) => {
          if (microLineRef.microLine) {
            // Populate the microLine with its steps
            const populatedMicroLine = await microLine.findById(microLineRef.microLine)
              .populate({
                path: "steps",
                model: steps
              });

            // Replace the ID reference with the populated object
            microLineRef.microLine = populatedMicroLine;
          }
        }));
      }
    }

    return NextResponse.json({ productLayers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch product layers" },
      { status: 500 }
    );
  }
};

// Similarly update getProductLayerById
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
      })
      .populate({
        path: "invoice",
        model: invoice
      })
      .populate({
        path: "productionLine",
        model: productionLine
      });

    if (!productLayer) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }

    // Populate microLines
    if (productLayer.productionLine && productLayer.productionLine.microLines) {
      await Promise.all(productLayer.productionLine.microLines.map(async (microLineRef) => {
        if (microLineRef.microLine) {
          const populatedMicroLine = await microLine.findById(microLineRef.microLine)
            .populate({
              path: "steps",
              model: steps
            });

          microLineRef.microLine = populatedMicroLine;
        }
      }));
    }

    return NextResponse.json({ productLayer }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product layer by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch product layer", details: error },
      { status: 500 }
    );
  }
};

// Keep the rest of the file unchanged

// Keep the rest of the file unchanged
export const updateProductLayer = async (req: NextRequest) => {
  await connect();
  try {
    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "Product layer ID is required" },
        { status: 400 }
      );
    }

    console.log(`Updating product layer ${_id} with data:`, updateData);

    const updatedProductLayer = await ProductLayer.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    )
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
      })
      .populate({
        path: "invoice",
        model: invoice
      });

    if (!updatedProductLayer) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product layer updated successfully", productLayer: updatedProductLayer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product layer:", error);
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

export const createProductLayer = async (req: NextRequest) => {
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
