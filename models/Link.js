const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Link schema
const linkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: ["GitHub", "LinkedIn", "Facebook", "YouTube", "GitLab"],
      required: true,
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/[^\s]+$/.test(v); // Simple URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the Link model
const Link = mongoose.model("Link", linkSchema);
module.exports = Link;
