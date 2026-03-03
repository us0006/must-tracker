# MUST Tracker - Student Achievement Tracking System

##  Project Description
MUST Tracker is a comprehensive, web-based Student Achievement Tracking System developed for Mirpur University of Science & Technology (MUST). It digitizes the process of recording, evaluating, and managing student accomplishments. The system features a Role-Based Access Control (RBAC) architecture for Students, Teachers, and Administrators, promoting transparency and institutional oversight.

##  Technologies Used
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Fetch API
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Key Libraries:** `bcrypt` (password hashing), `express-session` (authentication), `multer` (file uploads)

##  Setup Steps
1. Clone the repository to your local machine:
   `git clone https://github.com/your-username/must-tracker.git`
2. Navigate to the project directory:
   `cd must-tracker`
3. Install the required Node.js dependencies:
   `npm install`
4. Create a MySQL database named `must_tracker`.
5. Import the database tables using the SQL commands provided in the project report.
6. Ensure your MySQL server (e.g., XAMPP/WAMP) is running.

##  Execution Instructions
1. Start the backend server by running the following command in your terminal:
   `node server.js`
2. Open your web browser and navigate to:
   `http://localhost:3000`
3. You can now register and log in as a Student, Teacher, or Admin.

##  Project Documentation
The complete formal Project Report (including ERD and System Architecture) is included in this repository as `MUST_Tracker_Report.pdf`.