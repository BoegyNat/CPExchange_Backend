# CPExchange_Backend

# Build Database SQL Code


```

-- Create the 'userstatus' table
CREATE TABLE userstatus (
    idUserStatus INT PRIMARY KEY AUTO_INCREMENT,
    StatusName VARCHAR(255) NOT NULL
);

-- Create the 'user' table
CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    studentCode VARCHAR(255),
    firstname_TH VARCHAR(255),
    lastname_TH VARCHAR(255),
    firstname_EN VARCHAR(255),
    lastname_EN VARCHAR(255),
    email VARCHAR(255),
    profileName VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255),
    imagePath VARCHAR(255),
    idUserStatus INT,
    FOREIGN KEY (idUserStatus) REFERENCES userstatus(idUserStatus)
);

-- Create the 'poststatus' table
CREATE TABLE poststatus (
    idPostStatus INT PRIMARY KEY AUTO_INCREMENT,
    PostStatusName VARCHAR(255) NOT NULL
);

-- Create the 'post' table
CREATE TABLE post (
    idPost INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    topic VARCHAR(255),
    timeStamp DATETIME,
    detail TEXT,
    anonymous BOOLEAN,
    hasVerify BOOLEAN,
    `like` INT DEFAULT 0,
    filePath VARCHAR(255),
    idPostStatus INT,
    FOREIGN KEY (idUser) REFERENCES user(idUser),
    FOREIGN KEY (idPostStatus) REFERENCES poststatus(idPostStatus)
);

-- Create the 'comment' table
CREATE TABLE comment (
    idComment INT PRIMARY KEY AUTO_INCREMENT,
    idPost INT,
    idUser INT,
    timeStamp DATETIME,
    anonymous BOOLEAN,
    detail TEXT,
    `like` INT DEFAULT 0,
    idPostStatus INT,
    FOREIGN KEY (idPost) REFERENCES post(idPost),
    FOREIGN KEY (idUser) REFERENCES user(idUser),
    FOREIGN KEY (idPostStatus) REFERENCES poststatus(idPostStatus)
);

-- Create the 'reply' table
CREATE TABLE reply (
    idReply INT PRIMARY KEY AUTO_INCREMENT,
    idComment INT,
    idUser INT,
    timeStamp DATETIME,
    anonymous BOOLEAN,
    detail TEXT,
    `like` INT DEFAULT 0,
    idPostStatus INT,
    FOREIGN KEY (idComment) REFERENCES comment(idComment),
    FOREIGN KEY (idUser) REFERENCES user(idUser),
    FOREIGN KEY (idPostStatus) REFERENCES poststatus(idPostStatus)
);

-- Create the 'likepost' table
CREATE TABLE likepost (
    idLikePost INT PRIMARY KEY AUTO_INCREMENT,
    idPost INT,
    idUser INT,
    FOREIGN KEY (idPost) REFERENCES post(idPost),
    FOREIGN KEY (idUser) REFERENCES user(idUser)
);

-- Create the 'likecomment' table
CREATE TABLE likecomment (
    idLikeComment INT PRIMARY KEY AUTO_INCREMENT,
    idComment INT,
    idUser INT,
    FOREIGN KEY (idComment) REFERENCES comment(idComment),
    FOREIGN KEY (idUser) REFERENCES user(idUser)
);

-- Create the 'likereply' table
CREATE TABLE likereply (
    idLikeReply INT PRIMARY KEY AUTO_INCREMENT,
    idReply INT,
    idUser INT,
    FOREIGN KEY (idReply) REFERENCES reply(idReply),
    FOREIGN KEY (idUser) REFERENCES user(idUser)
);

-- Create the 'bookmark' table
CREATE TABLE bookmark (
    idBookMark INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    idPost INT,
    FOREIGN KEY (idUser) REFERENCES user(idUser),
    FOREIGN KEY (idPost) REFERENCES post(idPost)
);

-- Create the 'tag' table
CREATE TABLE tag (
    idTag INT PRIMARY KEY AUTO_INCREMENT,
    tagName VARCHAR(255) NOT NULL
);

-- Create the 'subtag' table
CREATE TABLE subtag (
    idSubTag INT PRIMARY KEY AUTO_INCREMENT,
    idTag INT NOT NULL,
    subTagName VARCHAR(255) NOT NULL,
    FOREIGN KEY (idTag) REFERENCES tag(idTag)
);

-- Create the 'posttag' table
CREATE TABLE posttag (
    idPostTag INT PRIMARY KEY AUTO_INCREMENT,
    idTag INT,
    idPost INT,
    FOREIGN KEY (idTag) REFERENCES tag(idTag),
    FOREIGN KEY (idPost) REFERENCES post(idPost)
);

-- Create the 'postsubtag' table
CREATE TABLE postsubtag (
    idPostSubTag INT PRIMARY KEY AUTO_INCREMENT,
    idSubTag INT,
    idPost INT,
    FOREIGN KEY (idSubTag) REFERENCES subtag(idSubTag),
    FOREIGN KEY (idPost) REFERENCES post(idPost)
);

-- Create the 'usertagpriority' table
CREATE TABLE usertagpriority (
    idUserTagPriority INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    idTag INT,
    priority INT,
    FOREIGN KEY (idTag) REFERENCES tag(idTag),
    FOREIGN KEY (idUser) REFERENCES user(idUser)
);

-- Create the 'usersubtagpriority' table
CREATE TABLE usersubtagpriority (
    idUserSubTagPriority INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    idSubTag INT,
    priority INT,
    FOREIGN KEY (idSubTag) REFERENCES subtag(idSubTag),
    FOREIGN KEY (idUser) REFERENCES user(idUser)
);

-- Create the 'notificationstatus' table
CREATE TABLE notificationstatus (
    idNotificationStatus INT PRIMARY KEY AUTO_INCREMENT,
    NotificationStatusName VARCHAR(255) NOT NULL
);

-- Create the 'notification' table
CREATE TABLE notification (
    idNotification INT PRIMARY KEY AUTO_INCREMENT,
    detail TEXT,
    idNotificationStatus INT,
    reference VARCHAR(255),
    FOREIGN KEY (idNotificationStatus) REFERENCES notificationstatus(idNotificationStatus)
);

```
