# Serverless

This project represents the Udacity Serverless Application project. The project application is a simple TODO application that uses AWS lambda and the Serveless framework.

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

Authentication is handled via interfacing with an Auth0 application interface that 

Udacity provides a base implementation that students must finish. The outline of the work to be done is specified in [ASSIGNMENT.md](file:./ASSIGNMENT.md).

# How to run the application

The application is currently configured to run with Auth0 application template that has been created. If you wish to override this and use your own Auth0 Application template see the explaination under [ASSIGNMENT.md](ASSIGNMENT.md).

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```
This should start a development server that the React application in client will interface.  Make note of the endpoint as it will be necessary to configure this in the Frontend client application.

The serverless endpoint can be retrieved after deployment via 

```
$ serverless info -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set the endpoint parameter. And then run the following commands:

```
cd client
npm install
npm run start
```

This will start the React Application and redirect the browser interface on your system to this interface. 


## Layout

The development tree is broken into two primary sections. One for the frontend client and one for the backend serverless implementation.

```
├── ASSIGNMENT.md           - Original Assignment
├── README.md               - Project Description
├── backend
│   ├── package-lock.json
│   ├── package.json
│   ├── serverless.yml      - Serverless Deployment file
│   ├── src                 - Backend source code
│   ├── tsconfig.json
│   └── webpack.config.js
├── client                  - Client code 
└── postman_collection.json - Postman collection for REST API
```

### Backend Project Layout

```
backend/src
├── auth
│   ├── Jwt.ts
│   ├── JwtPayload.ts
│   └── utils.ts
├── buisnessLogic
├── dataLayer
├── lambda
│   ├── auth
│   │   └── auth0Authorizer.ts      - Auth handler
│   ├── http
│   │   ├── createTodo.ts           - Create Handler
│   │   ├── deleteTodo.ts           - Delete Handler
│   │   ├── generateUploadUrl.ts    - Upload handler
│   │   ├── getTodos.ts             - Get Todos Handler
│   │   └── updateTodo.ts           - Update Todos Handler
│   └── utils.ts
├── models                          - Data Models
│   ├── TodoItem.ts             
│   └── TodoUpdate.ts
├── requests
│   ├── CreateTodoRequest.ts         
│   └── UpdateTodoRequest.ts
└── utils
    ├── cert.ts
    └── logger.ts
```
