const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    // Delay for 5 seconds (adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await mongoose.connect("mongodb://mongo_db:27017/stuff");
    console.log("db connected successfully.");
  } catch (error) {
    console.log("DATABASE err " + error);
    process.exit(1);
  }
};

dbConnect();
