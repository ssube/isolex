CREATE TABLE context (roomId VARCHAR, threadId VARCHAR, userId VARCHAR, userName VARCHAR);
CREATE TABLE command (context VARCHAR, data VARCHAR, id VARCHAR, name VARCHAR, type INT);
CREATE TABLE message (body VARCHAR, context VARCHAR, id VARCHAR, reactions VARCHAR);