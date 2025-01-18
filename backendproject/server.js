const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload"); // Import express-fileupload
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const port = 5001;
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

app.use(cookieParser());
app.use(fileUpload());

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// MySQL Database Connection
// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "capstone2"
// });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database");
});

// Notify clients when a new notification is added
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Route to add a notification and emit it via Socket.IO
app.post("/add-notification", (req, res) => {
  const { message } = req.body;
  const sql = "INSERT INTO notifications (message) VALUES (?)";

  db.query(sql, [message], (err, result) => {
    if (err) {
      console.error("Error adding notification:", err);
      res.status(500).json({ error: "Failed to add notification" });
    } else {
      io.emit("new-notification", { message }); // Emit new notification event
      res.status(200).json({ message: "Notification added successfully" });
    }
  });
});

// Route to get all notifications
app.get("/get-notifications", (req, res) => {
  const sql = "SELECT * FROM notifications ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    } else {
      res.status(200).json({ notifications: results });
    }
  });
});

// Route to mark a notification as read
app.put("/mark-notification-read/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: "Failed to mark notification as read" });
    } else {
      // After marking as read, return the updated count of unread notifications
      const countSql =
        "SELECT COUNT(*) AS unreadCount FROM notifications WHERE is_read = FALSE";
      db.query(countSql, (err, result) => {
        if (err) {
          console.error("Error fetching unread count:", err);
          res
            .status(500)
            .json({ error: "Failed to fetch unread notification count" });
        } else {
          res.status(200).json({
            message: "Notification marked as read",
            unreadCount: result[0].unreadCount,
          });
        }
      });
    }
  });
});

app.get("/unread-notification-count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS unreadCount FROM notifications WHERE is_read = FALSE";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching unread count:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch unread notification count" });
    } else {
      res.status(200).json({
        unreadCount: result[0].unreadCount,
      });
    }
  });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp
  },
});
const upload = multer({ storage });

// File upload endpoint
app.post("/upload", (req, res) => {
  // Check if files are present
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.files.file;
  const uploadPath = `uploads/${file.name}`;

  // Move the file to the desired directory
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    // Extract title, author, and year from the request body
    const { title, author, year } = req.body;

    // Save file details and other information to the database
    const sql =
      "INSERT INTO research (title, author, year, file_research) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, author, year, file.name], (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res
        .status(200)
        .json({ message: "File uploaded successfully", file_name: file.name });
    });
  });
});

// Endpoint to fetch specific research details by ID
app.get("/viewFile/:id", (req, res) => {
  const fileId = req.params.id;

  const sql =
    "SELECT title, author, year, file_research FROM research WHERE id = ?";
  db.query(sql, [fileId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error fetching file details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json(results[0]); // Return the first result
  });
});

// Fetch files endpoint
app.get("/files", (req, res) => {
  const sql = "SELECT * FROM research"; // Query to get all files

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json(results); // Send the retrieved files as JSON
  });
});

// Endpoint for updating research
app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, year } = req.body;

  const query = "UPDATE research SET title=?, author=?, year=? WHERE id=?";
  db.query(query, [title, author, year, id], (error, results) => {
    if (error) {
      console.error("Error updating research:", error);
      return res.status(500).json({ message: "Error updating research" });
    }
    return res.json({ message: "Research updated successfully!" });
  });
});

// Endpoint for file download
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "uploads", filename);
  res.download(filepath, filename, (err) => {
    if (err) {
      res.status(404).send({ message: "File not found" });
    }
  });
});

// Delete endpoint
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  // First, retrieve the file name from the database
  db.query(
    "SELECT file_research FROM research WHERE id = ?",
    [id],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error fetching file", error: err });

      // If no file found, send a 404 response
      if (results.length === 0) {
        return res.status(404).json({ message: "File not found" });
      }

      const fileName = results[0].file_research;

      // Delete the file from the file system
      const filePath = path.join(__dirname, "uploads", fileName);
      fs.unlink(filePath, (err) => {
        if (err)
          return res.status(500).json({
            message: "Error deleting file from filesystem",
            error: err,
          });

        // Then delete the record from the database
        db.query("DELETE FROM research WHERE id = ?", [id], (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Error deleting file record", error: err });
          res.status(200).json({ message: "File deleted successfully" });
        });
      });
    }
  );
});

// JWT verification middleware
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "We need a token, please provide it." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "new-secret-key",
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      // Set the decoded values on req object
      req.userId = decoded.id; // Changed from req.user.id to req.userId
      req.firstname = decoded.firstname;
      req.lastname = decoded.lastname;
      req.email = decoded.email;
      req.gender = decoded.gender;
      req.birthdate = decoded.birthdate;
      next();
    }
  );
};

// Protected route for fetching user profile
app.get("/", verifyUser, (req, res) => {
  return res.json({
    message: "Profile retrieved successfully",
    user: {
      id: req.userId,
      firstname: req.firstname,
      lastname: req.lastname,
      email: req.email,
      gender: req.gender,
      birthdate: req.birthdate,
    },
  });
});

// Update user profile
app.put("/updateprofile", verifyUser, (req, res) => {
  const userId = req.userId; // Correcting to use req.userId from verified token
  const { firstname, lastname, email, birthdate, gender } = req.body;

  // Check if required fields are present
  if (!firstname || !lastname || !email || !birthdate || !gender) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.query(
    "UPDATE user SET firstname = ?, lastname = ?, email = ?, birthdate = ?, gender = ? WHERE id = ?",
    [firstname, lastname, email, birthdate, gender, userId],
    (error, results) => {
      if (error) {
        console.error("Database error: ", error); // Log error
        return res.status(500).json({ message: "Database error", error });
      }
      res.status(200).json({ message: "Profile updated successfully" });
    }
  );
});

app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the JWT token stored in cookies
  res.status(200).json({ message: "Logout successful" });
});

// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM user WHERE email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ Message: "Server Side Error" });
    }
    if (data.length > 0) {
      const user = data[0];
      const hashedPassword = user.password;

      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err) {
          console.error("Password comparison error:", err);
          return res.status(500).json({ Message: "Error comparing passwords" });
        }
        if (isMatch) {
          const token = jwt.sign(
            {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              gender: user.gender,
              birthdate: user.birthdate,
            },
            "new-secret-key",
            { expiresIn: "30d" } // Fix the option here
          );

          res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          });
          return res.json({
            status: "success",
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            gender: user.gender,
            birthdate: user.birthdate,
          });
        } else {
          return res.status(401).json({ Message: "Incorrect Password" });
        }
      });
    } else {
      return res.status(404).json({ Message: "No Records Existed" });
    }
  });
});

// Registration Endpoint
app.post("/register", async (req, res) => {
  const { firstname, lastname, email, role, birthdate, gender, password } =
    req.body;

  // Validate input fields
  if (
    !firstname ||
    !lastname ||
    !email ||
    !role ||
    !birthdate ||
    !gender ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    firstname,
    lastname,
    email,
    role,
    birthdate,
    gender,
    password: hashedPassword,
  };

  db.query("INSERT INTO user SET ?", user, async (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "Error registering user" });
    }

    // Prepare email details for the user
    const adminMailOptions = {
      from: "earlsonnieandrew.plecerda1@gmail.com",
      to: email, // Send the notification to the user's email
      subject: "New User Registration",
      text: `Hello ${firstname} ${lastname},\n\nYou have been successfully registered as a ${role}.\n\nYour password is: ${password}\n`, // Include plain text password
    };

    // Send email to user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "earlsonnieandrew.plecerda1@gmail.com", // Your email address
        pass: "cixe fhgl wxcv qihq", // Your email password or app password
      },
    });

    try {
      await transporter.sendMail(adminMailOptions);
      console.log("Email sent to user successfully.");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({
        message:
          "User registered successfully, but failed to send email to user.",
      });
    }

    res.status(201).json({ message: "User registered successfully!" });
  });
});

// In-memory storage for OTPs
const otpStore = {};

// Function to send Email using Nodemailer
const sendOTPEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "earlsonnieandrew.plecerda1@gmail.com",
      pass: "cixe fhgl wxcv qihq", // Use environment variables for security in production
    },
  });

  const mailOptions = {
    from: "earlsonnieandrew.plecerda1@gmail.com",
    to: email,
    subject: "Your OTP code",
    text: `Your OTP code is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

// Generate a 6 digit OTP code
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Endpoint to handle OTP email sending
app.post("/send-otp", (req, res) => {
  const { email } = req.body; // Extracting email from request body

  if (!email) {
    return res.status(400).send("Email is required");
  }

  const otp = generateOTP();
  otpStore[email] = otp; // Storing OTP for the email

  sendOTPEmail(email, otp)
    .then(() => {
      res.status(200).send("OTP sent to your email");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    });
});

app.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists for the given email
    if (!otpStore[email]) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email." });
    }

    // Check if the provided OTP matches the stored OTP
    if (otpStore[email] === otp) {
      // Remove the OTP from the store after successful verification
      delete otpStore[email];
      return res.json({ success: true, message: "OTP verified successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    // Handle any unexpected errors and return a generic response
    return res
      .status(500)
      .json({ success: false, message: "An error occurred." });
  }
});

app.post("/reset-password", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
    if (err) {
      return res.status(500).send("Server error");
    }

    if (result.length > 0) {
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          return res.status(500).send("Error hashing password");
        }
        db.query(
          "UPDATE user SET password = ? WHERE email = ?",
          [hashedPassword, email],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).send("Error updating password");
            }
            res.json({ success: true, message: "Password reset successfully" });
          }
        );
      });
    } else {
      res.status(404).json({ success: false, message: "Email not registered" });
    }
  });
});

// API endpoint para sa pag-create ng group
app.post("/create-group", async (req, res) => {
  try {
    // Kumuha ng data mula sa request body
    const {
      group_name,
      name,
      research_title,
      adviser,
      adviser_email,
      student_emails,
      panel_head,
      panel_members,
      panelhead_email,
      panelmembers_email,
      grade,
      recommendation,
      revision_type,
    } = req.body;

    // I-print ang data upang masigurado na ito ay tama
    console.log("Received data:", req.body);

    // SQL query para mag-insert ng data sa 'asign' table
    const query = `INSERT INTO asign (
      group_name, name, research_title, adviser, adviser_email, 
      student_emails, panel_head, panel_members, 
      panelhead_email, panelmembers_email, grade, recommendation, revision_type 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // I-execute ang query sa database
    await db
      .promise()
      .query(query, [
        group_name,
        name,
        research_title,
        adviser,
        adviser_email,
        JSON.stringify(student_emails),
        panel_head,
        JSON.stringify(panel_members),
        panelhead_email,
        JSON.stringify(panelmembers_email),
        grade,
        recommendation,
        revision_type,
      ]);

    // Return success response
    res.status(201).json({ message: "Group created successfully!" });
  } catch (error) {
    // I-log ang error upang matulungan kang mag-debug
    console.error("Error creating group:", error);

    // Return a 500 error if something goes wrong
    res.status(500).json({ error: error.message || "Failed to create group" });
  }
});

// Get all students
app.get("/student-list", (req, res) => {
  db.query("SELECT * FROM student_list", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching students", error: err });
    }
    res.json(results);
  });
});

// Add a new student
app.post("/student-create", (req, res) => {
  const { student_id, fname, lname, gender, year_level, email, status } =
    req.body;

  if (
    !student_id ||
    !fname ||
    !lname ||
    !gender ||
    !year_level ||
    !email ||
    !status
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query =
    "INSERT INTO student_list (student_id, fname, lname, gender, year_level, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [student_id, fname, lname, gender, year_level, email, status],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error adding student", error: err });
      }
      res.status(201).json({
        message: "Student added successfully",
        studentId: result.insertId,
      });
    }
  );
});

// Update a student
app.put("/student-update/:id", (req, res) => {
  const { id } = req.params;
  const { student_id, fname, lname, gender, year_level, email, status } =
    req.body;

  const query = `
      UPDATE student_list SET
      student_id = ?, fname = ?, lname = ?, gender = ?, year_level = ?, email = ?, status = ?
      WHERE id = ?
    `;

  db.query(
    query,
    [student_id, fname, lname, gender, year_level, email, status, id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error updating student", error: err });
      }
      res.json({ message: "Student updated successfully" });
    }
  );
});

// Delete a student
app.delete("/student-delete/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM student_list WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting student", error: err });
    }
    res.json({ message: "Student deleted successfully" });
  });
});

// Endpoint to get all teacher
app.get("/teacher", (req, res) => {
  const query =
    "SELECT id, fname, lname,teacher_id,gender,email,expertise,status FROM teacher_list";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/teacher-create", (req, res) => {
  const { fname, lname, teacher_id, gender, email, status, expertise } =
    req.body;

  if (
    !fname ||
    !lname ||
    !teacher_id ||
    !gender ||
    !email ||
    !status ||
    !expertise
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // If expertise is an array, join the items into a comma-separated string
  const expertiseString = Array.isArray(expertise)
    ? expertise.join(", ")
    : expertise;

  const sql = `INSERT INTO teacher_list (fname, lname, teacher_id, gender, email, status, expertise) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    fname,
    lname,
    teacher_id,
    gender,
    email,
    status,
    expertiseString,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Teacher added successfully", result });
  });
});

// Endpoint to update a teacher
app.put("/teacher-update/:id", (req, res) => {
  const teacherId = req.params.id;
  const { fname, lname, teacher_id, gender, email, status, expertise } =
    req.body; // Include expertise

  if (
    !fname ||
    !lname ||
    !teacher_id ||
    !gender ||
    !email ||
    !status ||
    !expertise
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Ensure expertise is an array and convert it to a string (either JSON or comma-separated)
  const expertiseString = Array.isArray(expertise)
    ? expertise.join(", ")
    : expertise;

  const sql = `UPDATE teacher_list SET fname = ?, lname = ?, teacher_id = ?, gender = ?, email = ?, status = ?, expertise = ? WHERE id = ?`; // Add expertise to SQL
  const values = [
    fname,
    lname,
    teacher_id,
    gender,
    email,
    status,
    expertiseString,
    teacherId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Teacher updated successfully" });
  });
});

// Endpoint to delete a teacher
app.delete("/teacher-delete/:id", (req, res) => {
  const teacherId = req.params.id;

  const sql = "DELETE FROM teacher_list WHERE id = ?";

  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Teacher deleted successfully" });
  });
});

app.get("/assign", (req, res) => {
  const sql = "SELECT * FROM asign";
  db.query(sql, (err, data) => {
    if (err) return res.json({ Message: "Error retrieving data" });
    return res.json(data);
  });
});

app.delete("/delete-assign/:id", (req, res) => {
  const deleteAssignQuery = "DELETE FROM asign WHERE id = ?";

  db.query(deleteAssignQuery, [req.params.id], (err) => {
    if (err) {
      console.error("Error deleting assignment:", err);
      return res.status(500).json({ error: "Error deleting assignment" });
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  });
});

app.put("/update-group/:id", (req, res) => {
  const { id } = req.params;
  const {
    group_name,
    name,
    research_title,
    adviser,
    panel_head,
    panel_members,
    grade,
    adviser_email, // Accept adviser email from request body
    panelhead_email,
    panelmembers_email,
    recommendation,
    revision_type,
  } = req.body;

  // Ensure panel_members is a string (if it's an array, join them with commas)
  const panel_members_string = Array.isArray(panel_members)
    ? panel_members.join(", ")
    : panel_members;

  // Ensure panel_members_email is a string (if it's an array, join them with commas)
  const panel_members_email_string = Array.isArray(panelmembers_email)
    ? panelmembers_email.join(", ")
    : panelmembers_email;

  // Corrected SQL query without invalid comment syntax
  const query = `
      UPDATE \`asign\`
      SET
        group_name = ?,
        name = ?,
        research_title = ?,
        adviser = ?,
        panel_head = ?,
        panel_members = ?,
        grade = ?,
        adviser_email = ?,
        panelhead_email = ?,
        panelmembers_email = ?, 
        recommendation = ?,
        revision_type = ?
      WHERE id = ?
    `;

  // Values to be inserted into the placeholders
  const values = [
    group_name,
    name,
    research_title,
    adviser,
    panel_head,
    panel_members_string,
    grade,
    adviser_email,
    panelhead_email,
    panel_members_email_string,
    recommendation,
    revision_type,
    id,
  ];

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating group:", err);
      return res.status(500).send(`Error updating group: ${err.message}`);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Group not found");
    }
    res.send(result);
  });
});

// Setup the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "earlsonnieandrew.plecerda1@gmail.com",
    pass: "cixe fhgl wxcv qihq", // Use environment variables for security in production
  },
});

// Endpoint to create scheduler
app.post("/create-scheduler", (req, res) => {
  const { groups, startDate, startTime, endTime } = req.body;

  if (!groups || !startDate || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const getEmailQuery =
    "SELECT adviser_email, student_emails, panelhead_email, panelmembers_email FROM asign WHERE group_name = ?";
  const sql = `
        INSERT INTO scheduler (
            group_name, name, research_title, adviser, panel_head, panel_members, adviser_email, student_emails, panelhead_email, panelmembers_email, start_date, start_time, end_time, room
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const promises = groups.map((group) => {
    return new Promise((resolve, reject) => {
      db.query(getEmailQuery, [group.group_name], (err, results) => {
        if (err) {
          return reject(err);
        }

        const adviserEmail = results[0] ? results[0].adviser_email : null;
        const studentEmails = results[0]?.student_emails
          ? results[0].student_emails.split(",")
          : [];
        const panelHeadEmail = results[0] ? results[0].panelhead_email : null;
        const panelMembersEmails = results[0]?.panelmembers_email
          ? results[0].panelmembers_email.split(",")
          : [];

        db.query(
          sql,
          [
            group.group_name,
            group.name,
            group.research_title,
            group.adviser,
            group.panel_head,
            group.panel_members,
            adviserEmail,
            studentEmails.join(","),
            panelHeadEmail,
            panelMembersEmails.join(","),
            startDate,
            group.start_time,
            group.end_time,
            group.room, // Include room in the query
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              return reject(err);
            }

            const emailText = `\nResearch Title: ${group.research_title}\nGroup name: ${group.group_name}\nName: ${group.name}\nAdviser: ${group.adviser}\nPanel Head: ${group.panel_head}\nPanel Members: ${group.panel_members}\nRoom: ${group.room}\nSchedule Date: ${startDate}\nTime: ${group.start_time} - ${group.end_time}\n\nBest regards,\nScheduler Team`;

            // Send email to adviser
            if (adviserEmail) {
              const mailOptionsAdviser = {
                from: "earlsonnieandrew.plecerda1@gmail.com",
                to: adviserEmail,
                subject: "Schedule Notification",
                text: `Hello Sir/Ma'am ${group.adviser},\n\nThe schedule for your Advisory group ${group.group_name} has been Scheduled.\n\n${emailText}`,
              };

              transporter.sendMail(mailOptionsAdviser, (error, info) => {
                if (error) {
                  console.error("Error sending email to adviser:", error);
                } else {
                  console.log("Email sent to adviser:", info.response);
                }
              });
            }

            // Send email to panel head
            if (panelHeadEmail) {
              const mailOptionsPanelHead = {
                from: "earlsonnieandrew.plecerda1@gmail.com",
                to: panelHeadEmail,
                subject: "Schedule Notification",
                text: `Dear Sir/Ma'am ${group.panel_head},\n\nWe are pleased to inform you that you have been assigned as the Panel Chair of this group: ${group.group_name}\n\n${emailText}`,
              };

              transporter.sendMail(mailOptionsPanelHead, (error, info) => {
                if (error) {
                  console.error("Error sending email to panel head:", error);
                } else {
                  console.log("Email sent to panel head:", info.response);
                }
              });
            }

            // Send email to panel members
            panelMembersEmails.forEach((panelMemberEmail) => {
              if (panelMemberEmail) {
                const mailOptionsPanelMember = {
                  from: "earlsonnieandrew.plecerda1@gmail.com",
                  to: panelMemberEmail,
                  subject: "Schedule Notification",
                  text: `Dear Sir/Ma'am ${group.panel_members},\n\nWe are pleased to inform you that you have been assigned as the Panel Member of this group: ${group.group_name}\n\n${emailText}`,
                };

                transporter.sendMail(mailOptionsPanelMember, (error, info) => {
                  if (error) {
                    console.error(
                      "Error sending email to panel member:",
                      error
                    );
                  } else {
                    console.log("Email sent to panel member:", info.response);
                  }
                });
              }
            });

            // Send email to students
            studentEmails.forEach((studentEmail) => {
              if (studentEmail) {
                const mailOptionsStudent = {
                  from: "earlsonnieandrew.plecerda1@gmail.com",
                  to: studentEmail,
                  subject: "Schedule Notification",
                  text: `Dear Sir/Ma'am ${group.name}, \n\nWe are pleased to inform you that the panel for your Research Title ${group.research_title}. has been finalized. Please see the details of your panel and schedule below: \n\n${emailText}`,
                };

                transporter.sendMail(mailOptionsStudent, (error, info) => {
                  if (error) {
                    console.error("Error sending email to student:", error);
                  } else {
                    console.log("Email sent to student:", info.response);
                  }
                });
              }
            });

            resolve(result);
          }
        );
      });
    });
  });

  Promise.all(promises)
    .then(() =>
      res.status(201).json({ message: "Schedule created successfully" })
    )
    .catch((error) =>
      res.status(500).json({ message: "Error creating schedule", error })
    );
});

// API Endpoint to update schedule and send notification
app.put("/api/data/:id", (req, res) => {
  const { id } = req.params;
  const { name, start_date, start_time, end_time } = req.body;

  const updateQuery =
    "UPDATE scheduler SET name = ?, start_date = ?, start_time = ?, end_time = ? WHERE id = ?";
  const getDetailsQuery = `
        SELECT adviser_email, panelhead_email, panelmembers_email, student_emails,
               research_title, group_name, name, adviser, panel_head, panel_members
        FROM scheduler
        WHERE id = ?`;

  // Function to format time with AM/PM
  function formatTime(time) {
    const [hour, minute] = time.split(":");
    return new Date(0, 0, 0, hour, minute).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  const formattedStartTime = formatTime(start_time);
  const formattedEndTime = formatTime(end_time);

  // Perform the update query
  db.query(
    updateQuery,
    [name, start_date, start_time, end_time, id],
    (err, results) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).send("Server error");
      }

      if (results.affectedRows === 0) {
        return res.status(404).send("Item not found");
      }

      // If update is successful, fetch group details and emails for notification
      db.query(getDetailsQuery, [id], (err, detailsResults) => {
        if (err) {
          console.error("Error fetching details:", err);
          return res.status(500).send("Server error");
        }

        const {
          adviser_email,
          panelhead_email,
          panelmembers_email,
          student_emails,
          research_title,
          group_name,
          name,
          adviser,
          panel_head,
          panel_members,
        } = detailsResults[0];

        const panelMembersEmails = panelmembers_email
          ? panelmembers_email.split(",")
          : [];
        const studentEmails = student_emails ? student_emails.split(",") : [];

        // Notification email content with formatted time and group details
        const emailText = `\n\n
        Research Title: ${research_title}
        Group Name: ${group_name}
        Student Names: ${name}
        Adviser: ${adviser}
        Panel Head: ${panel_head}
        Panel Members: ${panel_members}
        New Date: ${start_date}
        New Time: ${formattedStartTime} - ${formattedEndTime}

        Best regards,
        Scheduler Team`;

        // Send email to adviser
        if (adviser_email) {
          const mailOptionsAdviser = {
            from: "earlsonnieandrew.plecerda1@gmail.com",
            to: adviser_email,
            subject: "Updated Schedule Notification",
            text: `Hello Sir/Ma'am ${adviser} Your Advisory group ${group_name} Schedule has been updated ${emailText}`,
          };
          transporter.sendMail(mailOptionsAdviser, (error, info) => {
            if (error) console.error("Error sending email to adviser:", error);
            else console.log("Email sent to adviser:", info.response);
          });
        }

        // Send email to panel head
        if (panelhead_email) {
          const mailOptionsPanelHead = {
            from: "earlsonnieandrew.plecerda1@gmail.com",
            to: panelhead_email,
            subject: "Updated Schedule Notification",
            text: `Hello Sir/Ma'am ${panel_head} the group you're assigned to as panel head has been rescheduled for their presentation. ${emailText}`,
          };
          transporter.sendMail(mailOptionsPanelHead, (error, info) => {
            if (error)
              console.error("Error sending email to panel head:", error);
            else console.log("Email sent to panel head:", info.response);
          });
        }

        // Send email to panel members
        panelMembersEmails.forEach((panelMemberEmail) => {
          if (panelMemberEmail) {
            const mailOptionsPanelMember = {
              from: "earlsonnieandrew.plecerda1@gmail.com",
              to: panelMemberEmail,
              subject: "Updated Schedule Notification",
              text: `Hello Sir/Ma'am ${panel_members} the group you're assigned to as a panel member has been rescheduled for their presentation. ${emailText}`,
            };
            transporter.sendMail(mailOptionsPanelMember, (error, info) => {
              if (error)
                console.error("Error sending email to panel member:", error);
              else console.log("Email sent to panel member:", info.response);
            });
          }
        });

        // Send email to students
        studentEmails.forEach((studentEmail) => {
          if (studentEmail) {
            const mailOptionsStudent = {
              from: "earlsonnieandrew.plecerda1@gmail.com",
              to: studentEmail,
              subject: "Updated Schedule Notification",
              text: `Hello ${group_name} the schedule for your group presentation has been changed. ${emailText}`,
            };
            transporter.sendMail(mailOptionsStudent, (error, info) => {
              if (error)
                console.error("Error sending email to student:", error);
              else console.log("Email sent to student:", info.response);
            });
          }
        });

        res.send("Update successful and notifications sent");
      });
    }
  );
});

// DELETE a schedule
app.delete("/api/data/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM scheduler WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(204).send(); // No content to send back
  });
});

// Route to fetch data
app.get("/api/data", (req, res) => {
  db.query("SELECT * FROM scheduler", (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get("/api/events", (req, res) => {
  db.query("SELECT * FROM scheduler", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query error" });
    }

    const events = results.map((event) => {
      // Function to convert 12-hour AM/PM to 24-hour format
      const convertTo24HourFormat = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (modifier === "PM" && hours !== "12") {
          hours = parseInt(hours) + 12; // Convert PM to 24-hour time
        } else if (modifier === "AM" && hours === "12") {
          hours = 0; // Convert 12 AM to 00 hours
        }
        return `${hours}:${minutes}`;
      };

      const startTime24 = convertTo24HourFormat(event.start_time);
      const endTime24 = convertTo24HourFormat(event.end_time);

      // Combine start date with converted time
      const startDateTime = new Date(`${event.start_date}T${startTime24}`);
      const endDateTime = new Date(`${event.start_date}T${endTime24}`);

      // Function to format time in 12-hour AM/PM format
      const formatAMPM = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? hours : 12; // Hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
      };

      // Format the start and end times in AM/PM
      const startTimeFormatted = formatAMPM(startDateTime);
      const endTimeFormatted = formatAMPM(endDateTime);

      // Check if the dates are valid
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error(
          "Invalid date:",
          event.start_date,
          event.start_time,
          event.end_time
        );
      }

      return {
        start: startDateTime,
        end: endDateTime,
        start_time: startTimeFormatted, // Include formatted time
        end_time: endTimeFormatted, // Include formatted time
        title: event.group_name,
        name: event.name,
        adviser: event.adviser,
        panel_head: event.panel_head,
        panel_members: event.panel_members,
        research_title: event.research_title,
        room: event.room,
      };
    });

    res.json(events);
  });
});

app.get("/schedulerdate", (req, res) => {
  const sql = "SELECT * FROM scheduler";
  db.query(sql, (err, data) => {
    if (err) return res.json({ Message: "Error retrieving data" });
    return res.json(data);
  });
});

// Route to fetch schedule count
app.get("/schedule-count", (req, res) => {
  const query = "SELECT COUNT(*) AS count FROM scheduler"; // Assuming your schedule table is named 'schedules'

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching schedule count:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ count: result[0].count });
  });
});

// In your backend Express server
app.get("/research-count", (req, res) => {
  // Query to get the total count of research entries from the database
  const query = "SELECT COUNT(*) AS count FROM research"; // Replace with your actual table name
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching research count:", error);
      return res.status(500).json({ error: "Failed to fetch research count" });
    }
    res.json({ count: results[0].count });
  });
});
// Endpoint to get student count
app.get("/student-count", (req, res) => {
  const sqlQuery = "SELECT COUNT(*) AS count FROM student_list";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ count: result[0].count });
  });
});

// Endpoint to get student count
app.get("/teacher-count", (req, res) => {
  const sqlQuery = "SELECT COUNT(*) AS count FROM teacher_list";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ count: result[0].count });
  });
});

// API endpoint to get all students
app.get("/studentsDashboard", (req, res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// DELETE /students/:id
app.delete("/studentsDelete/:id", (req, res) => {
  const studentId = req.params.id;
  const sqlDelete = "DELETE FROM user WHERE id = ?";
  db.query(sqlDelete, [studentId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleting student");
    } else {
      res.send("Student deleted successfully");
    }
  });
});

// PUT route to update grade, recommendation, and revision type for the group
app.put("/api/assign", (req, res) => {
  const { group_name, grade, recommendation, revision_type } = req.body;

  // Validate data
  if (!group_name || !grade || !recommendation || !revision_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // SQL query to update grade for the selected group
  const query = `
      UPDATE asign
      SET grade = ?, recommendation = ?, revision_type = ?
      WHERE group_name = ?
    `;

  db.query(
    query,
    [grade, recommendation, revision_type, group_name],
    (err, result) => {
      if (err) {
        console.error("Error updating grade:", err);
        return res.status(500).json({ error: "Error updating grade" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.json({ message: "Grade updated successfully" });
    }
  );
});

app.post("/api/grades1", (req, res) => {
  const {
    group_name,
    recommendation,
    panel_1_grades,
    panel_2_grades,
    panelhead_grades,
    panelhead_recommendation,
    panel_1_recommendation,
    panel_2_recommendation,
    revision_type,
    final_grade,
  } = req.body;

  // Validate required fields
  if (!group_name) {
    return res.status(400).json({ error: "Group name is required" });
  }
  if (!panel_1_grades && !panel_2_grades && !panelhead_grades) {
    return res.status(400).json({
      error:
        "At least one grade field (panel_1_grades, panel_2_grades, panelhead_grades) is required",
    });
  }

  // Check if revision_type is required for panelhead_grades
  if (panelhead_grades && !revision_type) {
    return res
      .status(400)
      .json({ error: "Revision type is required for panel head grades" });
  }

  // Check if the group already exists (to decide whether to UPDATE or INSERT)
  let checkGroupQuery = "SELECT * FROM grades WHERE group_name = ?";
  db.query(checkGroupQuery, [group_name], (err, result) => {
    if (err) {
      console.error("Error checking group:", err.message);
      return res.status(500).json({ error: "Failed to check group" });
    }

    if (result.length > 0) {
      // If the group exists, perform UPDATE
      let updateQuery = `UPDATE grades SET 
                panel_1_grades = ?, 
                panel_2_grades = ?, 
                panelhead_grades = ?, 
                panel_1_recommendation = ?, 
                panel_2_recommendation = ?, 
                panelhead_recommendation = ?, 
                revision_type = ?, 
                final_grade = ?
                WHERE group_name = ?`;

      let updateValues = [
        panel_1_grades || result[0].panel_1_grades,
        panel_2_grades || result[0].panel_2_grades,
        panelhead_grades || result[0].panelhead_grades,
        panel_1_recommendation || result[0].panel_1_recommendation,
        panel_2_recommendation || result[0].panel_2_recommendation,
        panelhead_recommendation || result[0].panelhead_recommendation,
        revision_type || result[0].revision_type,
        final_grade || result[0].final_grade,
        group_name,
      ];

      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error("Error updating grade:", err.message);
          return res.status(500).json({ error: "Failed to update grade" });
        }
        return res
          .status(200)
          .json({ message: "Grade updated successfully", result });
      });
    } else {
      // If the group doesn't exist, perform INSERT
      let insertQuery = `INSERT INTO grades (
                group_name, 
                panel_1_grades, 
                panel_2_grades, 
                panelhead_grades, 
                panel_1_recommendation, 
                panel_2_recommendation, 
                panelhead_recommendation, 
                revision_type, 
                final_grade
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      let insertValues = [
        group_name,
        panel_1_grades || null,
        panel_2_grades || null,
        panelhead_grades || null,
        panel_1_recommendation || null,
        panel_2_recommendation || null,
        panelhead_recommendation || null,
        revision_type || null,
        final_grade || null,
      ];

      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error("Error inserting grade:", err.message);
          return res.status(500).json({ error: "Failed to insert grade" });
        }
        return res
          .status(200)
          .json({ message: "Grade inserted successfully", result });
      });
    }
  });
});

// Route to fetch grades
app.get("/grades", (req, res) => {
  const query = "SELECT * FROM grades";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
