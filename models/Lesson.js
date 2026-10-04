const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    section: {
      type: String,
      trim: true,
      default: "Course content"
    },

    videoUrl: {
      type: String,
      default: ""
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);