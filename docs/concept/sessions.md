# Sessions

The authentication classes in isolex supports JWT-based RBAC and sessions.

While authentication for chat and HTTP is fundamentally the same, the protocols have radically different ways
of tracking users. Most chat applications, for example, have already authenticated a user and established a session
of their own. HTTP has no such session, until provided by a cookie.

The authentication controller calls the underlying whatever to create a session. This includes the listener from the
context. That means context should not be saved in the database, which makes sense.

The session whatever notifies the listener that a session has been established between a user (based on the context
passed) and the user fetched.

TOKENS HAVE NOTHING TO DO WITH SESSIONS
TOKENS PROVIDE THE INITIAL LOOKUP TO ASSOCIATE A USER WITH A LISTENER
THAT IS A SESSION

What is context?

Context is:

- source listener (service)
- target ? (always starts equal to source, can change when message becomes command or for completion)
- optional user (entity, loaded)
- session data (flash)

## Tokens

Tokens are the only 