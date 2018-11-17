CREATE TABLE context (id VARCHAR, listenerId VARCHAR, roomId VARCHAR, threadId VARCHAR, userId VARCHAR, userName VARCHAR);
CREATE TABLE command (id VARCHAR, contextId VARCHAR, name VARCHAR, type INT, data VARCHAR);
CREATE TABLE message (id VARCHAR, contextId VARCHAR, body VARCHAR, reactions VARCHAR);
CREATE TABLE trigger (name VARCHAR, commandId VARCHAR, controller VARCHAR);
