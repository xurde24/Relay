# 🚀 Relay – Real-Time Messaging Platform

**Relay** is a full-stack, microservices-based real-time chat application built to provide fast and reliable one-to-one messaging. The project combines **Next.js, Node.js, Socket.IO, RabbitMQ, Redis, and MongoDB** to create a distributed backend capable of handling authentication, asynchronous tasks, and real-time communication.

---

## ✨ Key Features

* 🔐 **OTP-Based Authentication**

  Secure user authentication using OTP verification, followed by JWT-based authorization.

* 💬 **Real-Time Messaging**

  Send and receive messages instantly using Socket.IO without refreshing the page.

* 👥 **One-to-One Conversations**

  Create private conversations and communicate directly with other users.

* ⚡ **Event-Driven Communication**

  RabbitMQ is used to decouple background operations between backend services.

* 📦 **Microservices Architecture**

  User, mail, and chat functionality are separated into independent backend services.

* 🚀 **Redis-Based OTP Storage**

  Temporary OTP data is stored in Redis with expiration support.

* 🍪 **HTTP-Only Authentication**

  JWT tokens are stored using HTTP-only cookies for safer client-side authentication.

* 💾 **Persistent Message Storage**

  Conversations and messages are stored in MongoDB for reliable data persistence.

* 📱 **Responsive Interface**

  A responsive Next.js frontend designed for a smooth messaging experience.

* 🐳 **Dockerized Infrastructure**

  RabbitMQ can be easily started using Docker for local development.

---

# 🏗️ Architecture

Relay is divided into multiple services, with each service responsible for a specific part of the application.

```text
                         ┌─────────────────────┐
                         │     Next.js App     │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
             ┌───────────────┐               ┌───────────────┐
             │  User Service │               │  Chat Service │
             │     :5000     │               │     :5002     │
             └───────┬───────┘               └───────┬───────┘
                     │                               │
              ┌──────┴──────┐                        │
              ▼             ▼                        ▼
           Redis         RabbitMQ                 MongoDB
                            │
                            ▼
                    ┌───────────────┐
                    │  Mail Service │
                    │     :5001     │
                    └───────────────┘
```

### 🔹 User Service

Responsible for:

* User registration and management
* OTP generation and verification
* JWT generation
* Authentication and authorization
* Redis communication
* Publishing email jobs to RabbitMQ

**Port:** `5000`

### 🔹 Mail Service

Responsible for consuming email tasks from RabbitMQ and sending emails such as authentication OTPs.

**Port:** `5001`

### 🔹 Chat Service

Responsible for:

* Conversations
* Messages
* Message persistence
* Socket.IO connections
* Real-time message delivery

**Port:** `5002`

---

# 🔄 Authentication Flow

Relay uses OTP verification as the initial authentication mechanism.

```text
User
 │
 │ Enter Email
 ▼
User Service
 │
 ├── Generate OTP
 │
 ├── Store OTP ──────────► Redis
 │
 └── Publish Email Job
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

After receiving the OTP:

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
HTTP-Only Cookie
```

The JWT is then used to authenticate protected requests.

---

# 💬 Real-Time Chat Flow

Socket.IO provides persistent communication between the frontend and Chat Service.

```text
User A
  │
  │ Socket.IO
  ▼
Chat Service
  │
  ├── Validate Request
  │
  ├── Save Message
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

This allows new messages to appear immediately for connected users without repeatedly polling the server.

---

# 📨 RabbitMQ Workflow

RabbitMQ is used to separate asynchronous operations from the services that initiate them.

For example, when an OTP needs to be sent:

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
     │
     ▼
  Send Email
```

This allows the Mail Service to handle email processing independently from the User Service.

---

# 🛠️ Tech Stack

## 🖥️ Frontend

* **Framework:** Next.js
* **UI:** React
* **Styling:** Tailwind CSS
* **State Management:** Context API
* **Real-Time Communication:** Socket.IO Client
* **Language:** TypeScript

## ⚙️ Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Real-Time Communication:** Socket.IO
* **Authentication:** JWT
* **Password / Security:** bcrypt

## 💾 Database & Storage

* **Database:** MongoDB
* **ODM:** Mongoose
* **Cache:** Redis / Upstash Redis

## 📨 Messaging & Infrastructure

* **Message Broker:** RabbitMQ
* **Containerization:** Docker

## 🧰 Development Tools

* Git
* Postman
* Cloudinary

---

# 📂 Project Structure

```text
Relay/
│
├── frontend/
│   ├── ...
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
├── .postman/
│
├── .gitignore
└── README.md
```

---

# 🧪 Getting Started

## 🔧 Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* Git
* Docker
* MongoDB or a MongoDB Atlas account
* Redis / Upstash Redis account
* RabbitMQ

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/xurde24/Relay.git
cd Relay
```

---

## 2️⃣ Start RabbitMQ

RabbitMQ can be run locally using Docker:

```bash
docker run -d \
  --hostname rabbitmq \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

RabbitMQ management dashboard:

```text
http://localhost:15672
```

---

## 3️⃣ Setup User Service

```bash
cd backend/user
npm install
```

Create a `.env` file:

```env
MONGO_URI=
PORT=5000

REDIS_URL=

RabbitMQ_Host=
RabbitMQ_Username=
RabbitMQ_Password=

JWT_SECRET=
```

Start the service:

```bash
npm run dev
```

User Service:

```text
http://localhost:5000
```

---

## 4️⃣ Setup Mail Service

Open another terminal:

```bash
cd backend/mail
npm install
```

Create a `.env` file:

```env
PORT=5001

RabbitMQ_Host=
RabbitMQ_Username=
RabbitMQ_Password=

USER_EMAIL=
USER_PASS=
```

Start the service:

```bash
npm run dev
```

Mail Service:

```text
http://localhost:5001
```

---

## 5️⃣ Setup Chat Service

Open another terminal:

```bash
cd backend/chat
npm install
```

Create a `.env` file:

```env
PORT=5002

MONGO_URI=
JWT_SECRET=

USER_SERVICE=http://localhost:5000

CLOUD_NAME=
API_KEY=
API_SECRET=
```

Start the service:

```bash
npm run dev
```

Chat Service:

```text
http://localhost:5002
```

---

## 6️⃣ Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

For security reasons, environment files containing credentials should **never be committed to Git**.

Make sure your `.gitignore` includes:

```gitignore
node_modules/
.env
.env.local
.env.*.local
.next/
dist/
build/
coverage/
```

---

# 🔌 Service Communication

Relay uses different communication mechanisms depending on the type of operation.

### HTTP APIs

Used for normal request/response operations.

```text
Frontend
   │
   │ HTTP
   ▼
Backend Service
```

### RabbitMQ

Used for asynchronous communication.

```text
Service A
   │
   ▼
RabbitMQ
   │
   ▼
Service B
```

### Socket.IO

Used for real-time communication.

```text
Client
   ⇄
Socket.IO
   ⇄
Chat Service
```

---

# 📈 Future Improvements

Some features planned for future versions include:

* 👥 Group Chats
* ✍️ Typing Indicators
* ✅ Read Receipts
* ❤️ Message Reactions
* 📎 Image & File Sharing
* 🔔 Push Notifications
* 🔄 Improved Message Delivery Guarantees
* ☸️ Kubernetes Deployment
* 🔒 End-to-End Encryption

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

### Getting Started

1. Fork the repository.
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/Relay.git
cd Relay
```

3. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes and commit them:

```bash
git add .
git commit -m "Add: your feature"
```

5. Push your branch:

```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request against the `main` branch.

Please make sure your changes are tested and follow the existing project structure.

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

# 👨‍💻 Author

### Shreyansh Anand

**B.Tech CSE — IIIT Bhagalpur**

---

<div align="center">

### ⭐ If you found Relay interesting, consider giving the repository a star!

Built with ❤️ using **Next.js · Node.js · Socket.IO · MongoDB · Redis · RabbitMQ**

</div>
