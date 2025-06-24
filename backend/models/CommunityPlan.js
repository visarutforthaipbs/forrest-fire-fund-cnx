import mongoose from "mongoose";

// Budget item schema for activities
const budgetItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
});

// Fire management activity schema
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  period: {
    type: String,
  },
  budget: {
    type: Number,
    default: 0,
  },
  budget_items: [budgetItemSchema],
  timing: {
    type: String,
    enum: ["pre_incident", "during_incident", "post_incident"],
    required: true,
  },
});

// Equipment schema
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  available: {
    type: Number,
    default: 0,
  },
  needed: {
    type: Number,
    default: 0,
  },
});

// Budget source schema
const budgetSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

// Main community plan schema
const communityPlanSchema = new mongoose.Schema(
  {
    // Village information
    village_info: {
      name: {
        type: String,
        required: true,
      },
      moo: {
        type: String,
        required: true,
      },
      subdistrict: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        default: "เชียงใหม่",
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
      population: Number,
      households: Number,
      area: {
        forest_managed_rai: Number,
      },
      forest_types: [String],
      problems: {
        causes: String,
        risk_area: String,
        limitations: String,
      },
      main_occupations: [String],
    },

    // Fire management activities
    fire_management: {
      pre_incident: [activitySchema],
      during_incident: [activitySchema],
      post_incident: [activitySchema],
    },

    // Equipment and tools
    equipment: [equipmentSchema],

    // Budget information
    budget: {
      allocated: {
        type: Number,
        default: 0,
      },
      shortage: {
        type: Number,
        default: 0,
      },
      sources: [budgetSourceSchema],
    },

    // Metadata
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending",
    },
    reviewed_by: String,
    reviewed_at: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
communityPlanSchema.index({ "village_info.name": 1 });
communityPlanSchema.index({ "village_info.district": 1 });
communityPlanSchema.index({ "village_info.subdistrict": 1 });
communityPlanSchema.index({ status: 1 });
communityPlanSchema.index({ submitted_at: -1 });

// Virtual for total budget calculation
communityPlanSchema.virtual("total_budget").get(function () {
  let total = 0;

  // Sum all activity budgets
  if (this.fire_management) {
    ["pre_incident", "during_incident", "post_incident"].forEach((timing) => {
      if (this.fire_management[timing]) {
        this.fire_management[timing].forEach((activity) => {
          total += activity.budget || 0;
        });
      }
    });
  }

  return total;
});

// Virtual for equipment shortage
communityPlanSchema.virtual("equipment_shortage").get(function () {
  if (!this.equipment) return [];

  return this.equipment
    .filter((item) => item.needed > item.available)
    .map((item) => ({
      name: item.name,
      shortage: item.needed - item.available,
    }));
});

// Method to get plan summary
communityPlanSchema.methods.getSummary = function () {
  return {
    village_name: this.village_info.name,
    location: `${this.village_info.subdistrict}, ${this.village_info.district}, ${this.village_info.province}`,
    total_activities:
      (this.fire_management.pre_incident?.length || 0) +
      (this.fire_management.during_incident?.length || 0) +
      (this.fire_management.post_incident?.length || 0),
    total_budget: this.total_budget,
    equipment_items: this.equipment?.length || 0,
    status: this.status,
    submitted_at: this.submitted_at,
  };
};

// Static method to get statistics
communityPlanSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total_plans: { $sum: 1 },
        pending_plans: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        approved_plans: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        total_budget_requested: {
          $sum: { $add: ["$budget.allocated", "$budget.shortage"] },
        },
        total_budget_allocated: { $sum: "$budget.allocated" },
        total_budget_shortage: { $sum: "$budget.shortage" },
      },
    },
  ]);

  return (
    stats[0] || {
      total_plans: 0,
      pending_plans: 0,
      approved_plans: 0,
      total_budget_requested: 0,
      total_budget_allocated: 0,
      total_budget_shortage: 0,
    }
  );
};

export default mongoose.model("CommunityPlan", communityPlanSchema);
