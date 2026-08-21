# Chatterbox API Documentation

This document provides the complete, tested API specification for the Chatterbox Backend API and Real-time Socket.io service.

---

## 1. Overview & Connection Info

- **REST API Base URL**: `https://frontend-task-chatapp.onrender.com/api`
- **Real-time Socket.io Server URL**: `https://frontend-task-chatapp.onrender.com` (Path: `/socket.io/`)
- **Authentication**: JWT Bearer token passed in headers for REST, or in connection handshake auth for Socket.io.
  - REST: `Authorization: Bearer <token>`
  - Socket.io: `io("https://frontend-task-chatapp.onrender.com", { auth: { token: "<token>" } })`

---

## 2. Authentication Endpoints

### 2.1 Login / Register
Logs in an existing user or automatically registers a new user if the phone number does not exist.

- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: None
- **Request Body (`application/json`)**:
  ```json
  {
    "phone": "+19991234567",
    "name": "Alice Developer"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6a886007e5d6aac9752288cb",
      "name": "Alice Developer",
      "phone": "+19991234567",
      "createdAt": "2026-08-21T14:26:15.688Z"
    }
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "error": {
      "message": "Validation failed",
      "code": "VALIDATION_ERROR",
      "details": [{ "path": "phone", "message": "Required" }]
    }
  }
  ```

### 2.2 Current User Profile
Retrieves the profile of the currently authenticated user.

- **Method**: `GET`
- **Path**: `/auth/me`
- **Auth**: Required (`Bearer <token>`)
- **Response (`200 OK`)**:
  ```json
  {
    "_id": "6a886007e5d6aac9752288cb",
    "name": "Alice Developer",
    "phone": "+19991234567",
    "createdAt": "2026-08-21T14:26:15.688Z"
  }
  ```

---

## 3. Users & Search

### 3.1 Search Users
Searches registered users by name or phone substring.

- **Method**: `GET`
- **Path**: `/users/search`
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**:
  - `query` (string, optional/required for filter): search text e.g. `?query=Bob` or `?query=+1888`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "6a886008e5d6aac9752288d2",
      "name": "Bob Test",
      "phone": "+1888300801"
    }
  ]
  ```

---

## 4. Conversations

### 4.1 List Conversations
Retrieves all direct and group conversations for the authenticated user.

- **Method**: `GET`
- **Path**: `/conversations`
- **Auth**: Required (`Bearer <token>`)
- **Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "6a886020e5d6aac9752289b2",
        "type": "direct",
        "lastMessage": {
          "text": "Hello Bob! How are you?",
          "sender": "6a88601de5d6aac975228994",
          "createdAt": "2026-08-21T14:26:41.507Z"
        },
        "updatedAt": "2026-08-21T14:26:41.741Z",
        "participant": {
          "_id": "6a88601ee5d6aac97522899c",
          "name": "Bob Test",
          "phone": "+1888489938"
        }
      },
      {
        "_id": "6a886063e5d6aac975228b0f",
        "type": "group",
        "name": "Avengers Elite",
        "createdBy": "6a886060e5d6aac975228afa",
        "admins": [
          "6a886060e5d6aac975228afa"
        ],
        "participants": [
          {
            "_id": "6a886060e5d6aac975228afa",
            "name": "Alice",
            "phone": "+1999901945"
          },
          {
            "_id": "6a886060e5d6aac975228aff",
            "name": "Bob",
            "phone": "+1888628604"
          }
        ],
        "lastMessage": {
          "text": "Avengers Assemble!",
          "sender": "6a886060e5d6aac975228afa",
          "createdAt": "2026-08-21T14:27:48.632Z"
        },
        "createdAt": "2026-08-21T14:27:47.444Z",
        "updatedAt": "2026-08-21T14:27:50.778Z"
      }
    ]
  }
  ```

### 4.2 Start Direct Conversation
Starts or opens a direct 1:1 conversation with a specific user.

- **Method**: `POST`
- **Path**: `/conversations`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "userId": "6a88601ee5d6aac97522899c"
  }
  ```
- **Response (`200 OK` or `201 Created`)**:
  ```json
  {
    "_id": "6a886020e5d6aac9752289b2",
    "participants": [
      "6a88601de5d6aac975228994",
      "6a88601ee5d6aac97522899c"
    ],
    "createdAt": "2026-08-21T14:26:40.553Z"
  }
  ```

### 4.3 Create Group Conversation
Creates a new group conversation with a designated group name and 2 or more initial members (making total 3+ including creator).

- **Method**: `POST`
- **Path**: `/conversations/group`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Avengers Team",
    "participantIds": [
      "6a886060e5d6aac975228aff",
      "6a886061e5d6aac975228b05"
    ]
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "_id": "6a886063e5d6aac975228b0f",
    "type": "group",
    "name": "Avengers Team",
    "createdBy": "6a886060e5d6aac975228afa",
    "admins": [
      "6a886060e5d6aac975228afa"
    ],
    "participants": [
      {
        "_id": "6a886060e5d6aac975228afa",
        "name": "Alice GroupTester",
        "phone": "+1999901945"
      },
      {
        "_id": "6a886060e5d6aac975228aff",
        "name": "Bob GroupTester",
        "phone": "+1888628604"
      },
      {
        "_id": "6a886061e5d6aac975228b05",
        "name": "Charlie GroupTester",
        "phone": "+1777335673"
      }
    ],
    "createdAt": "2026-08-21T14:27:47.444Z",
    "updatedAt": "2026-08-21T14:27:47.444Z"
  }
  ```

### 4.4 Rename Group
Renames an existing group conversation. Only group admins can perform this action.

- **Method**: `PATCH`
- **Path**: `/conversations/{id}`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Avengers Elite"
  }
  ```
- **Response (`200 OK`)**: Updated group conversation object.

### 4.5 Promote Member to Admin
Promotes an existing participant to admin status. Only existing admins can perform this action.

- **Method**: `POST`
- **Path**: `/conversations/{id}/admins`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "userId": "6a886060e5d6aac975228aff"
  }
  ```
- **Response (`200 OK`)**: Updated group conversation object with updated `admins` array.

### 4.6 Add Participants to Group
Adds one or more users to a group conversation. Only admins can perform this action.

- **Method**: `POST`
- **Path**: `/conversations/{id}/participants`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "userIds": ["6a886061e5d6aac975228b05"]
  }
  ```
- **Response (`200 OK`)**: Updated group conversation object.

### 4.7 Remove Participant / Leave Group
Removes a participant from a group (if caller is admin) or leaves a group (if caller removes themselves).

- **Method**: `DELETE`
- **Path**: `/conversations/{id}/participants/{userId}`
- **Auth**: Required (`Bearer <token>`)
- **Response (`200 OK`)**: Updated group conversation object.

---

## 5. Messages

### 5.1 Get Message History
Fetches messages for a specific conversation.

- **Method**: `GET`
- **Path**: `/conversations/{id}/messages`
- **Auth**: Required (`Bearer <token>`)
- **Response (`200 OK`)**:
  ```json
  {
    "messages": [
      {
        "_id": "6a886021e5d6aac9752289be",
        "conversation": "6a886020e5d6aac9752289b2",
        "sender": "6a88601de5d6aac975228994",
        "text": "Hello Bob! How are you?",
        "createdAt": "2026-08-21T14:26:41.507Z"
      }
    ],
    "hasMore": false
  }
  ```

### 5.2 Send Message
Sends a message to a direct or group conversation.

- **Method**: `POST`
- **Path**: `/messages`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "conversationId": "6a886020e5d6aac9752289b2",
    "text": "Hello Bob! How are you?"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "_id": "6a886021e5d6aac9752289be",
    "conversation": "6a886020e5d6aac9752289b2",
    "sender": "6a88601de5d6aac975228994",
    "text": "Hello Bob! How are you?",
    "createdAt": "2026-08-21T14:26:41.507Z"
  }
  ```

---

## 6. Socket.io Real-Time Specification

### 6.1 Handshake Connection
- **URL**: `https://frontend-task-chatapp.onrender.com`
- **Path**: `/socket.io/`
- **Auth**: Pass JWT in `auth: { token: "<JWT_TOKEN>" }`

```javascript
import { io } from 'socket.io-client';

const socket = io('https://frontend-task-chatapp.onrender.com', {
  auth: { token: userToken },
  transports: ['websocket', 'polling'],
});
```

### 6.2 Server-to-Client Events

#### `message:new`
Emitted by the server to all participant sockets when a new message is posted in any conversation they belong to.
- **Payload Shape**:
  ```json
  {
    "id": "6a886064e5d6aac975228b1a",
    "conversation": "6a886063e5d6aac975228b0f",
    "sender": "6a886060e5d6aac975228afa",
    "text": "Avengers Assemble!",
    "createdAt": 1787322468632
  }
  ```
  *(Note: `id` is used instead of `_id`, and `createdAt` is a millisecond timestamp number. The frontend normalizes this into standard message entities).*

#### `conversation:updated`
Emitted by the server when a group conversation is created, renamed, or membership/admins change.
- **Payload Shape**:
  ```json
  {
    "_id": "6a886063e5d6aac975228b0f",
    "type": "group",
    "name": "Avengers Elite",
    "createdBy": "6a886060e5d6aac975228afa",
    "admins": ["6a886060e5d6aac975228afa"],
    "participants": [
      {
        "_id": "6a886060e5d6aac975228afa",
        "name": "Alice",
        "phone": "+1999901945"
      }
    ]
  }
  ```

### 6.3 Client-to-Server Events
- `message:send` — `{ conversationId: string, text: string }` (Optional alternative send route). Recommended: Send via `POST /messages` with optimistic reconciliation and listen to `message:new` for broadcasts.

---

## 7. OpenAPI Named Request Schemas (from Swagger OAS 3.0)

For direct cross-reference with the Swagger UI documentation (`/docs/`), here are the formalized named request schemas:

| Schema Name | Endpoint | Fields | Description |
|---|---|---|---|
| `LoginRequest` | `POST /auth/login` | `phone` (string, req), `name` (string, req) | Login or auto-register user |
| `StartConversationRequest` | `POST /conversations` | `userId` (string, req) | Start direct 1:1 conversation |
| `SendMessageRequest` | `POST /messages` | `conversationId` (string, req), `text` (string, req) | Send message to direct or group chat |
| `CreateGroupRequest` | `POST /conversations/group` | `name` (string, req), `participantIds` (string[], req) | Create group conversation (3+ members) |
| `AddParticipantsRequest` | `POST /conversations/{id}/participants` | `userIds` (string[], req) | Add new members to a group |
| `PromoteRequest` | `POST /conversations/{id}/admins` | `userId` (string, req) | Promote existing member to admin |
| `RenameGroupRequest` | `PATCH /conversations/{id}` | `name` (string, req) | Rename an existing group |

