require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const Lesson = require("./models/Lesson");

const seedData = async () => {
  try {
    const instructorName = process.env.INSTRUCTOR_NAME?.trim();
    const instructorEmail = process.env.INSTRUCTOR_EMAIL?.trim().toLowerCase();
    const instructorPassword = process.env.INSTRUCTOR_PASSWORD;
    const legacyInstructorEmail = process.env.LEGACY_INSTRUCTOR_EMAIL
      ?.trim()
      .toLowerCase();
    const missingInstructorConfig = [
      ["INSTRUCTOR_NAME", instructorName],
      ["INSTRUCTOR_EMAIL", instructorEmail],
      ["INSTRUCTOR_PASSWORD", instructorPassword?.trim()]
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missingInstructorConfig.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingInstructorConfig.join(", ")}. Set them in backend/.env before seeding.`
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@learnhub.com")
      .trim()
      .toLowerCase();

    if (instructorEmail === adminEmail) {
      throw new Error("INSTRUCTOR_EMAIL must be different from ADMIN_EMAIL.");
    }

    await connectDB();

    let instructor = await User.findOne({ email: instructorEmail });

    if (legacyInstructorEmail && instructorEmail !== legacyInstructorEmail) {
      const legacyInstructor = await User.findOne({
        email: legacyInstructorEmail
      });

      if (
        instructor &&
        legacyInstructor &&
        !instructor._id.equals(legacyInstructor._id)
      ) {
        throw new Error(
          "Both the configured instructor and legacy demo account exist. Resolve the duplicate instructor accounts before seeding."
        );
      }

      instructor = instructor || legacyInstructor;
    }

    if (!instructor) {
      const hashedPassword = await bcrypt.hash(instructorPassword, 10);

      instructor = await User.create({
        name: instructorName,
        email: instructorEmail,
        password: hashedPassword,
        role: "Instructor"
      });

      console.log("Instructor account created.");
    } else {
      let instructorChanged = false;

      if (instructor.name !== instructorName) {
        instructor.name = instructorName;
        instructorChanged = true;
      }

      if (instructor.email !== instructorEmail) {
        instructor.email = instructorEmail;
        instructorChanged = true;
      }

      if (instructor.role !== "Instructor") {
        instructor.role = "Instructor";
        instructorChanged = true;
      }

      const passwordMatches = await bcrypt.compare(
        instructorPassword,
        instructor.password
      );

      if (!passwordMatches) {
        instructor.password = await bcrypt.hash(instructorPassword, 10);
        instructorChanged = true;
      }

      if (instructorChanged) {
        await instructor.save();
      }

      console.log("Instructor account ready.");
    }

    const sampleCourses = [
      {
        title: "Full-Stack Web Development",
        description: "Build modern web applications using React, Node.js, Express, and MongoDB.",
        category: "Web Development",
        price: 14999,
        lessons: [
          {
            title: "Plan the Application and Its Data",
            section: "Foundations",
            content: "Start with a small application brief: identify the user, the main task, and the information the application must store. Turn that information into a simple data model, then sketch the screens and API operations the user flow needs. Keep the first version focused on one complete workflow rather than a long feature list."
          },
          {
            title: "Build an Express API with MongoDB",
            section: "Build the Application",
            content: "Create an Express server with JSON parsing, route modules, and centralized error responses. Connect Mongoose to MongoDB, define a schema with validation, and implement list, detail, create, update, and delete operations. Test each endpoint with valid input, missing fields, and an unknown record so failures are predictable."
          },
          {
            title: "Connect a React Interface to the API",
            section: "Build the Application",
            content: "Build reusable React components for the list, detail view, and form. Load data from the API when a screen opens, and represent loading, empty, success, and error states separately. Submit changes through the API, validate user input, and verify the full workflow in the browser from creating a record to seeing it in the list."
          }
        ]
      },
      {
        title: "JavaScript for Beginners",
        description: "Learn the fundamentals of JavaScript, DOM manipulation, and working with APIs.",
        category: "Programming",
        price: 4999,
        lessons: [
          {
            title: "Values, Variables, and Functions",
            section: "JavaScript Foundations",
            content: "Practice with strings, numbers, booleans, arrays, and objects. Use const by default and let when a binding must change. Write small functions with clear inputs and return values, then combine conditions and loops to transform a list of data."
          },
          {
            title: "Work with Arrays and Objects",
            section: "JavaScript Foundations",
            content: "Represent related information with objects and collections with arrays. Use map to transform items, filter to select matching items, and find to locate one item. Build a small summary from a list of records and handle the case where a requested item does not exist."
          },
          {
            title: "Events and Asynchronous Data",
            section: "Browser and APIs",
            content: "Respond to browser events with event listeners and update the page from application state. Use fetch with async and await to request JSON from an API. Check the response status, handle network errors, and display a useful loading or error message instead of leaving the page blank."
          }
        ]
      },
      {
        title: "UI/UX Design Essentials",
        description: "Design user-friendly interfaces, prototypes, and improve product experience.",
        category: "Design",
        price: 9999,
        lessons: [
          {
            title: "Understand the User and Their Task",
            section: "Design Foundations",
            content: "Choose a specific audience and describe the task they are trying to complete. Map the steps, decisions, and points of friction in that task. Use the map to define what the interface must make clear, and avoid adding controls that do not help the user reach the goal."
          },
          {
            title: "Create a Clear Layout and Visual Hierarchy",
            section: "Design Foundations",
            content: "Organize content by importance and group related controls together. Use consistent spacing, readable type sizes, and contrast to make the next action easy to find. Sketch a low-fidelity layout first, then check it at narrow and wide viewport sizes to catch overflow and competing priorities."
          },
          {
            title: "Prototype, Test, and Refine",
            section: "Testing and Refinement",
            content: "Create a clickable prototype for the key user flow and ask someone to complete a realistic task without coaching. Observe where they pause, misread a control, or take an unexpected path. Fix the underlying wording or structure, then repeat the task to confirm the change improved clarity."
          }
        ]
      }
    ];

    for (const sampleCourse of sampleCourses) {
      let course = await Course.findOne({ title: sampleCourse.title });

      if (!course) {
        course = await Course.create({
          title: sampleCourse.title,
          description: sampleCourse.description,
          category: sampleCourse.category,
          price: sampleCourse.price,
          instructor: instructor._id
        });
      } else if (course.price !== sampleCourse.price) {
        course.price = sampleCourse.price;
        await course.save();
      }

      for (const lessonData of sampleCourse.lessons) {
        const existingLesson = await Lesson.findOne({
          course: course._id,
          title: lessonData.title
        });

        if (!existingLesson) {
          await Lesson.create({
            ...lessonData,
            course: course._id,
            instructor: course.instructor
          });
        } else if (existingLesson.section !== lessonData.section) {
          existingLesson.section = lessonData.section;
          await existingLesson.save();
        }
      }
    }

    console.log("Sample courses and lessons are ready.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedData();
