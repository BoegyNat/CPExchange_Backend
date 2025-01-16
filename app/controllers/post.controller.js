const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
const { url } = require("inspector");

function getAttchment(posts) {
  let result = [];
  for (let i = 0; i < posts.length; i++) {
    let attachment = JSON.parse(posts[i].filePath);
    let newAttachment = [];
    for (let j = 0; j < attachment.length; j++) {
      newAttachment.push({
        fileName: "unknow(" + j + ")",
        url: `http://localhost:8080/file/post/${attachment[j].path}`,
      });
    }
    result.push({
      idPost: posts[i].idPost,
      idUser: posts[i].idUser,
      topic: posts[i].topic,
      timeStamp: posts[i].timeStamp,
      detail: posts[i].detail,
      anonymous: posts[i].anonymous,
      hasVerify: posts[i].hasVerify,
      like: posts[i].like,
      attachment: newAttachment,
      idPostStatus: posts[i].idPostStatus,
    });
  }
  return result;
}

exports.getAllPostByIdUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    let result = await pool.query(
      "SELECT * FROM post WHERE idUser = ? ORDER BY timeStamp DESC",
      [idUser]
    );
    result = getAttchment(result);
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have post" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM post ORDER BY timeStamp DESC");
    result = getAttchment(result);
    return res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postClickLikePost = async (req, res) => {
  try {
    const { idUser, idPost } = req.body;
    let checkLikePost = await pool.query(
      `SELECT * FROM likepost WHERE idPost = ? AND idUser = ?`,
      [idPost, idUser]
    );
    let result;
    if (checkLikePost.length > 0) {
      let deleteLikePost = await pool.query(
        `DELETE FROM likepost WHERE idPost = ? AND idUser = ?`,
        [idPost, idUser]
      );
      result = await pool.query(
        `UPDATE post SET \`like\` = \`like\` - 1 WHERE idPost = ?`,
        [idPost]
      );
    } else {
      let addLikePost = await pool.query(
        `INSERT INTO likepost (idPost, idUser ) VALUES (?, ?)`,
        [idPost, idUser]
      );

      result = await pool.query(
        `UPDATE post SET \`like\` = \`like\` + 1 WHERE idPost = ?`,
        [idPost]
      );
    }

    let post = await pool.query(`SELECT * FROM post WHERE idPost = ?`, [
      idPost,
    ]);

    if (result) {
      return res.status(200).send({ message: "Like success", data: post[0] });
    } else {
      return res.status(404).send({ message: "Don't have post" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getPostByPriority = async (req, res) => {
  try {
    const { idUser } = req.params;
    let result = await pool.query(
      `
 SELECT 
    p.*, 
    COALESCE(MAX(utp.priority), 0) AS tagPriority, 
    COALESCE(MAX(ustp.priority), 0) AS subTagPriority,
    (COALESCE(MAX(utp.priority), 0) + COALESCE(MAX(ustp.priority), 0)) AS totalPriority
FROM 
    post p
LEFT JOIN posttag pt ON p.idPost = pt.idPost
LEFT JOIN usertagpriority utp ON pt.idTag = utp.idTag AND utp.idUser = ?
LEFT JOIN postsubtag pst ON p.idPost = pst.idPost
LEFT JOIN usersubtagpriority ustp ON pst.idSubTag = ustp.idSubTag AND ustp.idUser = ? 
GROUP BY p.idPost
ORDER BY totalPriority DESC, p.timeStamp DESC;
`,
      [idUser, idUser]
    );
    result = getAttchment(result);

    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have post" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postCreatePost = async (req, res) => {
  try {
    const { idUser, topic, detail } = req.body;
    const subject = JSON.parse(req.body.subject);
    const categories = JSON.parse(req.body.categories);
    const files = req.files;

    let lastedPost = await pool.query(
      "SELECT * FROM post  ORDER BY idPost DESC LIMIT 1"
    );
    let lastedPostId = 0;

    if (lastedPost.length == 0) {
      lastedPostId = lastedPostId + 1;
    } else {
      lastedPostId = parseInt(lastedPost[0].idPost) + 1;
    }

    if (fs.existsSync(path.join(__dirname, `../file/post/${lastedPostId}`))) {
      fs.rmSync(path.join(__dirname, `../file/post/${lastedPostId}`), {
        recursive: true,
        force: true,
      });
    }
    fs.mkdirSync(path.join(__dirname, `../file/post/${lastedPostId}`));

    const attachment = [];

    for (let i = 0; i < files.length; i++) {
      let fileName;

      fileName = files[i].originalname;
      let filePath = path.join(
        __dirname,
        `../file/post/${lastedPostId}/${fileName}`
      );
      fs.writeFileSync(filePath, files[i].buffer);

      attachment.push({
        // fileName: files[i].originalname,
        path: `${lastedPostId}/${fileName}`,
      });
    }

    const rows = await pool.query(
      `
                    INSERT INTO 
                    post 
                        (idUser, topic, timeStamp, detail, anonymous, hasVerify,\`like\`, filePath, idPostStatus) 
                    VALUES 
                        (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        idUser,
        topic,
        new Date(),
        detail,
        false,
        false,
        0,
        JSON.stringify(attachment),
        1,
      ]
    );

    if (subject.idTag == null) {
      const AddTag = await pool.query(`INSERT INTO tag (tagName) VALUES (?)`, [
        subject.tagName,
      ]);
      const AddPostTag = await pool.query(
        `INSERT INTO posttag (idtag, idpost) VALUES (?, ?)`,
        [AddTag.insertId, lastedPostId]
      );
      for (let i = 0; i < categories.length; i++) {
        const AddSubTag = await pool.query(
          `INSERT INTO subtag (idTag, subTagName) VALUES (?, ?)`,
          [AddTag.insertId, categories[i].subTagName]
        );
        const AddPostSubTag = await pool.query(
          `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
          [AddSubTag.insertId, lastedPostId]
        );
      }
    } else {
      const AddTag = await pool.query(
        `INSERT INTO posttag (idtag, idpost) VALUES (?, ?)`,
        [subject.idTag, lastedPostId]
      );
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].idSubTag == null) {
          const AddSubTag = await pool.query(
            `INSERT INTO subtag (idTag, subTagName) VALUES (?, ?)`,
            [subject.idTag, categories[i].subTagName]
          );
          const AddPostSubTag = await pool.query(
            `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
            [AddSubTag.insertId, lastedPostId]
          );
        } else {
          const AddSubTag = await pool.query(
            `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
            [categories[i].idSubTag, lastedPostId]
          );
        }
      }
    }

    if (rows) {
      newPost = {
        idPost: lastedPostId,
        idUser: idUser,
        topic: topic,
        timeStamp: new Date(),
        detail: detail,
        anonymouse: false,
        hasVerify: false,
        like: 0,
        filePath: JSON.stringify(attachment),
        idPostStatus: 1,
      };
      return res.status(200).send({
        success: true,
        data: newPost,
        error: null,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
