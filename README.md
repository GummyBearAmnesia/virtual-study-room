# THE STUDY SPOT ~ Team MANGOCAT
## Team members
The members of the team are:
- Aamukta Thogata
- Agrima Khare
- Isha Selvakumaran
- Natalia Ahsan
- Onessa Crispeyn
- Prapti Patel
- Yonna Khatri
- Yuliia Bohak

## Project Overview
**The Study Spot** is a web application designed to facilitate online study sessions between students through virtual study rooms. Users can create and join rooms, share resources and work collaboratively with friends using our software. 

## Deployed Application
The deployed version of the application can be found at [*virtual-study-room-phi.vercel.app*](virtual-study-room-phi.vercel.app).


## Default Logins for Testing
- _Alice Smith_
	- Email: alice@example.com
   	- Password: Password123
- _Bob Johnson_
	- Email: bob@example.com
   	- Password: Password123
- _John Doe_
	- Email: john@example.com
   	- Password: Password123
- _Name Surname_
  	- Email: name@example.com
  	- Password: Password123

## Project structure
The project consists of the following components:
- **Frontend:** React.js
- **Backend:** Django with REST API integration and Websockets
- **Database:** Primarily Django Models, as well as Firebase for storage of multimedia

## Installation instructions
To install the software and use it in your local development environment, you must first set up and activate a local development environment.  Follow these steps. 

From the root of the project:

### 1. Set Up a Virtual Environment
```
$ virtualenv venv
$ source venv/bin/activate
```

### 2. Install Dependencies
```
$ pip3 install -r requirements.txt
```

### 3. Install React.js Dependencies
```
$ cd application/frontend/
$ npm install
```

### 4. Build the React Project
```
$ cd application/frontend/ npm run build
```

### 5. Run the Django Backend
_Note: Run the backend on a new terminal_
```
$ cd application/
$ python3 manage.py runserver
```

### 6. Migrate the Database
```
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

### 7. Seed the Development Database
```
$ python3 manage.py seed
```

### 8. Run the React Project
```
$ cd application/frontend/
$ npm start
```

Notes:
#### Run Tests
##### Frontend
```
$ cd application/frontend/
$ npx jest --coverage
```
##### Backend
_Note: Navigate back into the virtual environment (see above)_
```
$(venv) python3 manage.py test
```

#### Unseeding the Database
```
$ python3 manage.py unseed
```

## Sources
- All dependencies are listed in 'requirements.txt'

## AI Usage Declaration
- views.py line 426: significant lines of code in the function "create_multiple_objects()" were generated by ChatGPT
- We used ChatGPT to help write some of our jest tests, as well as to comment a few files
- We followed a YouTube video to start coding the chatbox and playlist functionalities. 

       
