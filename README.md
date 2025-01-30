# virtual-study-room
A Virtual Study Room website called TheStudySpot made by the group MangoCat

##Team MangoCat Large Group Project Members;
Aamukta Thogata
Agrima Khare
Isha Selvakumaran
Natalia Ahsan
Onessa Crispeyn
Prapti Patel
Yonna Khatri
Yuliia Bohak

##Project structure
The project is called virtual-study-room. It is made up of a React frontend, Django Backend using Rest API calls.

##Deployed version of the application
The deployed version of the application can be found at %%%%%%

##Installation instructions
To install the software and use it in your local development environment, you must first set up and activate a local development environment. From the root of the project:

$ virtualenv venv
$ source venv/bin/activate
Install all required packages:

$ pip3 install -r requirements.txt
Migrate the database:

$ python3 manage.py migrate
Seed the development database with:

$ python3 manage.py seed
Run all tests with:

$ python3 manage.py test
The above instructions should work in your version of the application. If there are deviations, declare those here in bold. Otherwise, remove this line.

##Sources
The packages used by this application are specified in requirements.txt

##ChatGPT -views.py line 426: significant lines of code in the function "create_multiple_objects()" was generated by ChatGPT

We have developed a web application for tutors, students and Code Tutor admins. The application allows students to request booking for a desired programming language and a level of complexity (difficulty). After which an admin can confirm the booking by assigning a tutor, date and time for 10 weekly sessions.

In addition to the pre-existing functionality:

As an admin you can: -View bookings -Manage bookings (edit or delete) -View booking requests created by students -Confirm requests created by students -View and manage admins -View and manage students -View and manage tutors -Manually create a booking for a student

Admin Login: Username:@johndoe Alternative: Username:@admin Password:Password123 Password:Password123

As a student you can---------------------------------------------------------------------------------- -Create a booking request -View your bookings -View invoices

Student Login: Username:@student Password:Password123

As a tutor you can:---------------------------------------------------------------------------------- -View upcoming lessons

Student Login: Username:@tutor Password:Password123
