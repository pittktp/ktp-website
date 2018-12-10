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
Current functionality allows for members to create accounts and login in order to view a community board of how many brotherhoods points each member has obtained. With this, members can submit point requests or service hour reqeusts that state how many points or service hours they have received (through means of community service, events, etc.) and a member of the executive board can accept or deny this request. Members of e-board are given the role of "admins" and have additional power to edit current members. There is also functionality for attendance taking that increments unexcused absences at chapter meetings.

### The website in the future
In the future (as soon as tomorrow or a year from now) we would like to implement helpful features such as:
* A community page where members can submit ideas they have for future KTP events or even just general questions
* Functionality to handle live voting (for when we elect new e-board members once per year)

## The tech behind the website
We are using the popular MEAN webstack (MongoDB, Express.js, Angular6, and NodeJS) for development.

### Frontend
For the frontend (the user interface) we are using Angular6 due to its extensive premade components. Angular is an awesome framework that essentially does the heavy lifting for you so you can focus solely on creating the best UI for your user. We are in the age of reactive programming, so we take advantage of the rxjs library to have asyncronous calls when possible for better performance.

### Backend
For the backend (server-side) we use NodeJS which is a very popular JavaScript backend tool. NodeJS is awesome because it also has extensive libraries to take advantage of. For example, when a user creates an account and sends that password to the backend, a library called bcrypt is used to hash this password so that we don't store the user's plaintext password in the database. Express.js is middleware that makes setting up a NodeJS server extremely easy. MongoDB is a No SQL database that works perfectly for our situation due to the ease of hooking up to our backend through the middleware Mongoose.

### Deployment
Currently we are hosted on GitHub but have an intention in the very near future of migrating to AWS.

## Ok cool, but how do I run this?
In order to run this locally, you have to install some dependencies for all layers of the application (Angular6, NodeJS, and MongoDB). Start by cloning this project to your local machine with:
```
git clone https://github.com/jdepp/ktp-website.git
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

### MongoDB (database)
This is easy on a Mac using Homebrew which makes installing MongoDB super easy. If it's not installed, install it with:
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
Now type:
```
brew update
brew install mongodb
sudo mkdir -p /data/db
sudo chown -R `id -un` /data/db
```
So what this did was install MongoDB, then made a directory called db where your MongoDB will store its data on your local computer (data you store in the database will only be accessible from your computer and is nice for testing locally).

### MongoDB Compass
This isn't required but is super helpful. It's basically just a program that shows you the data you have in your database and allows you to edit it. It's nice to be able to visually see your data and makes debugging easier. Get it at https://www.mongodb.com/products/compass at the bottom of the page. It'll prompt you for your business info but you can just BS that.


### NodeJS (backend)
The backend isn't as heavy code-wise as the frontend, as it's only really responsible for taking stuff from the frontend and saving it to the database, or pulling from the database and giving it to the frontend. Set up your dependencies with: 
```
npm install
```

### Typical flow of execution
So there are 3 parts to this app: database, backend (aka server), and frontend. You have to run all 3 of these things in this order:
(open 3 command line windows/tabs because we need these 3 processes running at the same time)
1. Run the database with the command (doesn't matter what directory you're in):
```
mongod
```
This runs the database, and also allows you to open MongoDB Compass and view your data (when Compass boots up, don't type anything in those boxes, just hit Connect).<br/><br/>
  2. The backend needs Mongo to be running, so now that Mongo is running, run the backend by navigating to the "server" folder and typing:
```
node index.js
```
3. Run the frontend by navigating to the "angular" folder and typing:
```
ng serve
```

By default, your local Mongo database will be empty and won't have any members in it, so you'll have to Register yourself and any other "dummy" members you want displayed. For now, the code "g62dz9t4qm" when registering is to indicate a person of type "member" (which have less privilege than an admin). Use the code "6edwxvuh06" to make the person you're registering an "admin" which have increased privileges. When you start adding members, you'll see in Compass the database called KtpDB is created along with a collection of type "members". When you submit a service hour or point request, it'll create a collection called "requests" that store these requests.

### Quit the application
To stop the app from running, just go to all 3 command line windows/tabs and ctrl+c them. It's good practice to do this especially with the Mongo process to prevent data corruption.
