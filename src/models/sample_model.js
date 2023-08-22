const mongoose = require("mongoose");

const sample = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    description: { type: String, trim: true },
    option: [{ type: String, trim: true }],
    type: [
      {
        name: String,
        value: String,
      },
    ],
    image: { type: String },
    imagearray: [
      {
        image_path: { type: String },
      },
    ],
    status: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model("sample", sample);