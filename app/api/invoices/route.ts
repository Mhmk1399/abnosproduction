import { NextRequest, NextResponse } from "next/server";
import ProductLayer from "../../../models/productLayer";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);

    // Build match stage for aggregation
    const matchStage: any = {};

    // Production code filter (main filter)
    const code = searchParams.get("code");
    if (code) {
      matchStage.productionCode = { $regex: code, $options: "i" };
    }

    // Date range filters
    const createdAtRange = searchParams.get("createdAt");
    if (createdAtRange) {
      const [startDate, endDate] = createdAtRange.split(",");
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "invoices",
          localField: "invoice",
          foreignField: "_id",
          as: "invoice",
        },
      },
      { $unwind: { path: "$invoice", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "customers",
          localField: "invoice.customer",
          foreignField: "_id",
          as: "invoiceCustomer",
        },
      },
      {
        $unwind: { path: "$invoiceCustomer", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "priorities",
          localField: "invoice.priority",
          foreignField: "_id",
          as: "invoicePriority",
        },
      },
      {
        $unwind: { path: "$invoicePriority", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "glasses",
          localField: "glass",
          foreignField: "_id",
          as: "glass",
        },
      },
      { $unwind: { path: "$glass", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "glasstreatments",
          localField: "treatments.treatment",
          foreignField: "_id",
          as: "treatmentDetails",
        },
      },
      {
        $lookup: {
          from: "steps",
          localField: "currentStep",
          foreignField: "_id",
          as: "currentStep",
        },
      },
      { $unwind: { path: "$currentStep", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "designs",
          localField: "designNumber",
          foreignField: "_id",
          as: "designNumber",
        },
      },
      { $unwind: { path: "$designNumber", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "invoice.customer": "$invoiceCustomer",
          "invoice.priority": "$invoicePriority",
          treatments: {
            $map: {
              input: "$treatments",
              as: "treatment",
              in: {
                treatment: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$treatmentDetails",
                        cond: { $eq: ["$$this._id", "$$treatment.treatment"] },
                      },
                    },
                    0,
                  ],
                },
                count: "$$treatment.count",
                measurement: "$$treatment.measurement",
              },
            },
          },
        },
      },
      {
        $project: {
          treatmentDetails: 0,
          invoiceCustomer: 0,
          invoicePriority: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    // Apply additional filters
    const additionalMatch: any = {};

    const status = searchParams.get("status");
    if (status) {
      additionalMatch["invoice.status"] = status;
    }

    const priority = searchParams.get("priority");
    if (priority) {
      additionalMatch["invoice.priority.name"] = {
        $regex: priority,
        $options: "i",
      };
    }

    const customer = searchParams.get("customer");
    if (customer) {
      additionalMatch["invoice.customer.name"] = {
        $regex: customer,
        $options: "i",
      };
    }

    const designNumber = searchParams.get("designNumber");
    if (designNumber) {
      additionalMatch["designNumber.name"] = {
        $regex: designNumber,
        $options: "i",
      };
    }

    const deliveryDateRange = searchParams.get("deliveryDate");
    if (deliveryDateRange) {
      const [startDate, endDate] = deliveryDateRange.split(",");
      if (startDate && endDate) {
        additionalMatch["invoice.deliveryDate"] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    if (Object.keys(additionalMatch).length > 0) {
      pipeline.splice(-1, 0, { $match: additionalMatch });
    }

    const productLayers = await ProductLayer.aggregate(pipeline);

    return NextResponse.json(productLayers);
  } catch (error) {
    console.error("Error fetching product layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch product layers" },
      { status: 500 }
    );
  }
}
