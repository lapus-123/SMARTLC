const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Criteria used to invite
    section: { type: String, required: true },
    college: { type: String, default: null },
    department: { type: String, default: null },
    schoolYear: { type: String, default: null },

    // Students who were invited (array of User ObjectIds)
    invitedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Materials shared with this invitation
    materials: [
      {
        title: { type: String, required: true },
        type: {
          type: String,
          enum: ["video", "module", "document"],
          default: "document",
        },
        url: { type: String, default: null },
        description: { type: String, default: null },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invitation", invitationSchema);
