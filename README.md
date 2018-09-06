# Kappa Theta Pi at the University of Pittsburgh

## About us
We are a co-ed professional technology fraternity located at the University of Pittsburgh that participate fully in the thriving tech scene in our city. Our organizations aims to better its members through:
* Community service
* Field experience such as hackathons
* Mentoring
* Attending tech talks with local companies such as Google, Dick's Sporting Goods, UPMC
* Social events 

## Our website
Our website is meant to not only give an outsider a perspective on our fraternity, but to also allow existing members to login and view important information that pertain to their role in the fraternity. 

### The website right now
Current functionality allows for members to create accounts and login in order to view a community board of how many brotherhoods points each member has obtained. With this, members can submit point requests that state how many points they received (through means of community service, events, etc.) and a member of the executive board can accept or deny this request. Members of e-board are given the role of "admins" and have additional power to edit current members.

### The website in the future
In the future (as soon as tomorrow or a year from now) we would like to implement helpful features such as:
* Easy logging of who attends chapter meetings and how many unexcused absences they have
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


