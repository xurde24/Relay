# Relay

### A microservices-based real-time messaging platform built with Node.js, Next.js, Socket.IO, RabbitMQ, Redis, and MongoDB.

Relay is a full-stack chat application designed around a distributed backend architecture. It supports OTP-based authentication, one-to-one conversations, and real-time messaging.

Instead of putting everything into a single backend, Relay separates authentication, email processing, and chat functionality into independent services. RabbitMQ handles asynchronous communication, Redis manages temporary OTP data, MongoDB provides persistent storage, and Socket.IO enables real-time communication between users.

---

## Overview

Relay consists of four main components:

* **Frontend** — Next.js application responsible for the user interface
* **User Service** — handles users, OTP authentication and JWT-based authentication
* **Mail Service** — processes email jobs received through RabbitMQ
* **Chat Service** — manages conversations, messages and real-time communication

The services communicate through a combination of HTTP APIs, RabbitMQ and Socket.IO.

```text
                         ┌───────────────────┐
                         │    Next.js App    │
                         │    Frontend       │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
             ┌──────────────┐              ┌──────────────┐
             │ User Service │              │ Chat Service │
             │    :5000     │              │    :5002     │
             └──────┬───────┘              └──────┬───────┘
                    │                             │
             ┌──────┴──────┐                      │
             ▼             ▼                      ▼
          Redis         RabbitMQ               MongoDB
                          │
                          ▼
                   ┌──────────────┐
                   │ Mail Service │
                   │    :5001     │
                   └──────────────┘
```

---

## Features

### Authentication

* OTP-based user authentication
* JWT-based authorization
* HTTP-only authentication cookies
* Protected backend routes
* Temporary OTP storage using Redis

### Messaging

* One-to-one conversations
* Real-time message delivery
* Persistent message storage
* Socket.IO-based communication
* Automatic chat updates on incoming messages

### Backend Architecture

* Independent microservices
* Asynchronous email processing with RabbitMQ
* Redis-based temporary data storage
* MongoDB persistence
* Service-to-service communication
* Dockerized RabbitMQ environment

### Frontend

* Next.js + React
* Responsive interface
* Context API for application state
* Tailwind CSS
* Socket.IO client integration

---

# Architecture

Relay uses separate services so that different responsibilities can evolve independently.

### User Service

The User Service is responsible for:

* Creating and managing users
* Generating OTPs
* Verifying OTPs
* Creating JWTs
* Handling authentication
* Communicating with Redis
* Publishing email jobs to RabbitMQ

**Port:** `5000`

### Mail Service

The Mail Service consumes email-related jobs from RabbitMQ.

Instead of making the User Service directly responsible for sending emails, the email operation is moved to a separate service.

**Port:** `5001`

### Chat Service

The Chat Service handles:

* Creating conversations
* Fetching chats
* Sending messages
* Persisting messages
* Socket.IO connections
* Real-time message delivery

**Port:** `5002`

---

# Authentication Flow

Relay uses OTP verification as the initial authentication mechanism.

The flow is approximately:

```text
User
 │
 │ Enter email
 ▼
User Service
 │
 ├── Generate OTP
 │
 ├── Store OTP in Redis
 │
 └── Publish email job
          │
          ▼
      RabbitMQ
          │
          ▼
     Mail Service
          │
          ▼
      OTP Email
```

When the user submits the OTP:

```text
User
 │
 │ Submit OTP
 ▼
User Service
 │
 ▼
Redis
 │
 │ Verify OTP
 ▼
Generate JWT
 │
 ▼
HTTP-only Cookie
```

The JWT is then used to authenticate requests to protected services.

---

# Why Redis?

OTP information is temporary by nature, so it doesn't need to live permanently in the main database.

Redis provides a fast temporary storage layer for OTP-related information.

Conceptually:

```text
OTP Generated
     │
     ▼
   Redis
     │
     │ temporary
     ▼
OTP Verification
     │
     ▼
 OTP Removed / Expired
```

This also allows OTP data to expire automatically rather than requiring permanent database records.

---

# RabbitMQ Communication

RabbitMQ is used to decouple the User Service from the Mail Service.

Without a queue, the User Service could directly call the Mail Service:

```text
User Service ─────HTTP─────► Mail Service
```

Relay instead uses:

```text
User Service
     │
     │ Publish
     ▼
 RabbitMQ
     │
     │ Consume
     ▼
 Mail Service
```

This means the User Service only needs to publish an email task.

The Mail Service is responsible for consuming that task and actually sending the email.

This is useful for operations that don't need to block the original request.

---

# Real-Time Messaging

Socket.IO is used to establish persistent communication between the frontend and Chat Service.

A typical message flow is:

```text
User A
  │
  │ Socket.IO
  ▼
Chat Service
  │
  ├── Validate request
  │
  ├── Save message
  │
  ▼
MongoDB
  │
  ▼
Chat Service
  │
  │ Socket.IO
  ▼
User B
```

When a message is sent, it is first persisted and then emitted to the appropriate connected user.

This allows the UI to update immediately without repeatedly polling the backend for new messages.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Context API
* Tailwind CSS
* Socket.IO Client

## Backend

* Node.js
* Express.js
* TypeScript
* Socket.IO

## Data & Infrastructure

* MongoDB
* Redis / Upstash Redis
* RabbitMQ
* Docker

## Other Tools

* Git
* Postman
* Cloudinary

---

# Project Structure

```text
Relay/
│
├── frontend/
│   └── ...
│
├── backend/
│   │
│   ├── user/
│   │   └── src/
│   │
│   ├── mail/
│   │   └── src/
│   │
│   └── chat/
│       └── src/
│
└── .postman/
```

Each backend directory represents a separate service.

---

# Environment Variables

## User Service

Create a `.env` file inside `backend/user`.

```env
MONGO_URI=
PORT=5000

REDIS_URL=

RabbitMQ_Host=
RabbitMQ_Username=
RabbitMQ_Password=

JWT_SECRET=
```

---

## Mail Service

Create a `.env` file inside `backend/mail`.

```env
PORT=5001

RabbitMQ_Host=
RabbitMQ_Username=
RabbitMQ_Password=

USER_EMAIL=
USER_PASS=
```

---

## Chat Service

Create a `.env` file inside `backend/chat`.

```env
PORT=5002

MONGO_URI=
JWT_SECRET=

USER_SERVICE=http://localhost:5000

CLOUD_NAME=
API_KEY=
API_SECRET=
```

> Do not commit `.env` files or expose credentials in the repository.

---

# Running Relay Locally

## 1. Start RabbitMQ

RabbitMQ can be started using Docker:

```bash
docker run -d \
  --hostname rabbitmq \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

The RabbitMQ management dashboard will be available at:

```text
http://localhost:15672
```

---

## 2. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### User Service

```bash
cd backend/user
npm install
```

### Mail Service

```bash
cd backend/mail
npm install
```

### Chat Service

```bash
cd backend/chat
npm install
```

---

# Start the Application

Relay currently runs as four separate processes.

### Terminal 1 — User Service

```bash
cd backend/user
npm run dev
```

Service:

```text
http://localhost:5000
```

### Terminal 2 — Mail Service

```bash
cd backend/mail
npm run dev
```

Service:

```text
http://localhost:5001
```

### Terminal 3 — Chat Service

```bash
cd backend/chat
npm run dev
```

Service:

```text
http://localhost:5002
```

### Terminal 4 — Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Once all four processes are running, open the frontend in your browser.

---

# Service Communication

Relay uses different communication mechanisms depending on the problem being solved.

### HTTP

Used for request/response interactions where the client needs an immediate result.

```text
Frontend
   │
   │ HTTP
   ▼
Backend Service
   │
   ▼
Response
```

### RabbitMQ

Used for asynchronous tasks such as email processing.

```text
Producer
   │
   ▼
RabbitMQ
   │
   ▼
Consumer
```

### Socket.IO

Used for persistent real-time communication.

```text
Client
  ⇄
Socket.IO
  ⇄
Chat Service
```

This separation keeps synchronous API requests, background jobs, and real-time events independent from each other.

---

# Database Responsibilities

MongoDB is used for persistent application data such as:

* Users
* Conversations
* Messages
* Chat-related information

Redis is primarily used for short-lived data such as:

* OTPs
* Temporary authentication-related information

This keeps temporary data separate from the application's long-term data.

---

# Design Goals

The main goal of Relay was to explore how a real-time application can be structured as multiple independent services.

The project focuses on understanding:

* Microservice boundaries
* Real-time communication
* Asynchronous message processing
* Caching and temporary storage
* Authentication and authorization
* Persistent message storage
* Service-to-service communication

Rather than treating the application as a single backend, each service has a specific responsibility.

---

# Future Improvements

Some features planned for future versions include:

* Group conversations
* Typing indicators
* Read receipts
* Message reactions
* Image and file sharing
* Push notifications
* Improved message delivery guarantees
* Kubernetes deployment
* End-to-end encryption

---

# Author

**Shreyansh Anand**

B.Tech CSE
IIIT Bhagalpur

---

## Built With

**Next.js · React · Node.js · Express · TypeScript · Socket.IO · MongoDB · Redis · RabbitMQ · Docker**

If you found Relay interesting, consider giving the repository a ⭐.
