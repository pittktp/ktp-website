# Kappa Theta Pi at the University of Pittsburgh

## About us
We are a co-ed professional technology fraternity located at the University of Pittsburgh that participates fully in the thriving tech scene of our city. Our organization aims to better its members through:
* Community service
* Field experience such as hackathons
* Mentoring
* Attending tech talks with local companies such as Google, Dick's Sporting Goods, UPMC
* Social events

## Our website
Our website is meant to not only give an outsider a perspective on our fraternity, but to also allow existing members to login and view important information that pertain to their role in the fraternity.

### The website right now
Current functionality allows for members to create accounts and login in order to view a community board of how many brotherhoods points each member has obtained. With this, members can submit point requests or service hour reqeusts that state how many points or service hours they have received (through means of community service, events, etc.) and a member of the executive board can accept or deny this request. Members of e-board are given the role of "admins" and have additional power to edit current members. There is also functionality for attendance taking that increments unexcused absences at chapter meetings. Recent functionality includes a profile page where members can edit information about themselves that is available to other logged in members. A members page is publically available that lists all current, inactive, and alumni members. The public can see member's name, major, and description about themselves. 

### The website in the future
In the future (as soon as tomorrow or a year from now) we would like to implement helpful features such as:
* A community page where members can submit ideas they have for future KTP events or even just general questions
* Functionality to handle live voting (for when we elect new e-board members once per year)

## The tech behind the website
We are using Angular7 for the frontend, NodeJS/Express.js for the backend REST API, AWS DynamoDB for the database, and NGINX for the web server. We are hosted on AWS utilizing the following services: Route53 for DNS, Elastic Load Balancer for application load balancing, EC2 for our VM (virtual machine) where our app is running, DynamoDB for our NoSQL database, IAM to provide credentials. Also, Docker is used to "containerize" the frontend and backend application. The docker containers run on our EC2 VM.

### Frontend
For the frontend (the user interface) we are using Angular6 due to its extensive premade components. Angular is an awesome framework that essentially does the heavy lifting for you so you can focus solely on creating the best UI for your user. We are in the age of reactive programming, so we take advantage of the rxjs library to have asyncronous calls when possible for better performance.

### Backend
For the backend (server-side) we use NodeJS which is a very popular JavaScript backend tool. NodeJS is awesome because it also has extensive libraries to take advantage of. For example, when a user creates an account and sends that password to the backend, a library called bcrypt is used to hash this password so that we don't store the user's plaintext password in the database. Express.js is middleware that makes setting up a NodeJS server extremely easy. MongoDB is a No SQL database that works perfectly for our situation due to the ease of hooking up to our backend through the middleware Mongoose.

## Ok cool, but how do I run this?
In order to run this locally, you have to install some dependencies for all layers of the application (Angular6, NodeJS, and MongoDB). Start by cloning this project to your local machine with:
```
git clone https://github.com/pittktp/ktp-website.git
```
And then navigate to this directory.

### Prerequisites
You have to have the Node package manager installed called npm. Npm is a nice command line tool that lets you easily set up dependencies that you may need for Angular and NodeJS.
To check if you have npm installed go to command line and type "node -v".
If you don't have it installed, go to https://www.npmjs.com/get-npm

### Angular (frontend)
Angular has a nice command line tool called ng which gives you shortcuts for things like: setting up a new Angular project, or adding a component to your Angular project, but the most common one you'll use is to serve your application which makes it accessible through your browser. So start by installing the Angular command line tool by navigating to the "angular" folder and typing:
```
npm install -g @angular/cli
```
Next install your dependencies that Angular needs with:
```
sudo npm install
```
Now you're able to run the frontend with:
```
ng serve
```
Go to localhost:4200 in your browser and you're able to see the webpage. However, since we don't have the backend or database setup yet, you won't be able to do things like login which require the server.

### NodeJS (backend)
The backend isn't as heavy code-wise as the frontend, as it's only really responsible for taking stuff from the frontend and saving it to the database, or pulling from the database and giving it to the frontend. Set up your dependencies with:
```
npm install
```
and run the application with 
```
node index.js
```

