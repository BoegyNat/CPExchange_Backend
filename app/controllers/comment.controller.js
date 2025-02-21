const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
const { profile } = require("console");

function getAttchmentComments(comments) {
  let result = [];
  for (let i = 0; i < comments.length; i++) {
    let attachment = JSON.parse(comments[i].filePath) ?? [];
    let newAttachment = [];
    for (let j = 0; j < attachment.length; j++) {
      newAttachment.push({
        fileName: attachment[j].path.split("/")[1],
        url: `http://localhost:8080/file/comment/${attachment[j].path}`,
      });
    }
    result.push({
      idComment: comments[i].idComment,
      idUser: comments[i].idUser,
      detail: comments[i].detail,
      timeStamp: comments[i].timeStamp,
      anonymous: comments[i].anonymous,
      isVerify: comments[i].isVerify,
      like: comments[i].like,
      attachment: newAttachment,
      idPost: comments[i].idPost,
      profileName: comments[i].profileName,
      imagePath: comments[i].imagePath,
    });
  }
  return result;
}

async function EditTagPriority(idPost, idUser, priority) {
  try {
    let tag = await pool.query(
      `SELECT post.idPost, posttag.idTag FROM post LEFT JOIN posttag ON post.idPost = posttag.idPost WHERE post.idPost = ?`,
      [idPost]
    );
    let result;
    if (tag.length == 0) {
      return;
    }
    for (let i = 0; i < tag.length; i++) {
      let findtag = await pool.query(
        `SELECT * FROM usertagpriority WHERE idTag = ? AND idUser = ?`,
        [tag[i].idTag, idUser]
      );
      if (findtag.length == 0) {
        result = await pool.query(
          `INSERT INTO usertagpriority (idTag, idUser, priority) VALUES (?, ?, ?)`,
          [tag[i].idTag, idUser, priority]
        );
      } else {
        result = await pool.query(
          `UPDATE usertagpriority SET priority = priority + ? WHERE idTag = ? AND idUser = ?`,
          [priority, tag[i].idTag, idUser]
        );
      }
    }

    return;
  } catch (error) {
    console.log(error);
  }
}

async function EditSubTagPriority(idPost, idUser, priority) {
  try {
    let subTag = await pool.query(
      `SELECT post.idPost, postsubtag.idSubTag FROM post LEFT JOIN postsubtag ON post.idPost = postsubtag.idPost WHERE post.idPost = ?`,
      [idPost]
    );
    let result;
    if (subTag.length == 0) {
      return;
    }
    for (let i = 0; i < subTag.length; i++) {
      let findsubTag = await pool.query(
        `SELECT * FROM usersubtagpriority WHERE idSubTag = ? AND idUser = ?`,
        [subTag[i].idSubTag, idUser]
      );
      if (findsubTag.length == 0) {
        result = await pool.query(
          `INSERT INTO usersubtagpriority (idSubTag, idUser, priority) VALUES (?, ?, ?)`,
          [subTag[i].idSubTag, idUser, priority]
        );
      } else {
        result = await pool.query(
          `UPDATE usersubtagpriority SET priority = priority + ? WHERE idSubTag = ? AND idUser = ?`,
          [priority, subTag[i].idSubTag, idUser]
        );
      }
    }
    return;
  } catch (error) {
    return;
  }
}

exports.getAllCommentByIdPost = async (req, res) => {
  try {
    const { idPost } = req.params;
    let result = await pool.query(
      `SELECT * FROM comment WHERE idPost = ? ORDER BY isVerify DESC, timeStamp DESC, \`like\` DESC`,
      [idPost]
    );

    for (let i = 0; i < result.length; i++) {
      let user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
        result[i].idUser,
      ]);
      result[i].profileName = user[0].profileName;
      result[i].imagePath = user[0].imagePath;
    }

    result = getAttchmentComments(result);

    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send([]);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postClickLikeComment = async (req, res) => {
  try {
    const { idUser, idComment } = req.body;

    let checkLikeComment = await pool.query(
      `SELECT * FROM likecomment WHERE idComment = ? AND idUser = ?`,
      [idComment, idUser]
    );
    let result;
    let like = 0;
    if (checkLikeComment.length > 0) {
      let deleteLikeComment = await pool.query(
        `DELETE FROM likecomment WHERE idComment = ? AND idUser = ?`,
        [idComment, idUser]
      );
      result = await pool.query(
        `UPDATE comment SET \`like\` = \`like\` - 1 WHERE idComment = ?`,
        [idComment]
      );
      like = -1;
    } else {
      let addLikeComment = await pool.query(
        `INSERT INTO likecomment (idComment, idUser ) VALUES (?, ?)`,
        [idComment, idUser]
      );

      result = await pool.query(
        `UPDATE comment SET \`like\` = \`like\` + 1 WHERE idComment = ?`,
        [idComment]
      );
      like = 1;
    }
    let comment = await pool.query(
      `SELECT * FROM comment WHERE idComment = ?`,
      [idComment]
    );
    EditTagPriority(comment[0].idPost, idUser, like * 2);
    EditSubTagPriority(comment[0].idPost, idUser, like);

    if (result) {
      return res
        .status(200)
        .send({ message: "Like success", data: comment[0] });
    } else {
      return res.status(404).send({ message: "Don't have comment" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postCreateComment = async (req, res) => {
  try {
    const { idUser, detail, idPost } = req.body;
    const files = req.files;

    let lastedComment = await pool.query(
      "SELECT * FROM comment  ORDER BY idComment DESC LIMIT 1"
    );
    let lastedCommentId = 0;

    if (lastedComment.length == 0) {
      lastedCommentId = lastedCommentId + 1;
    } else {
      lastedCommentId = parseInt(lastedComment[0].idComment) + 1;
    }

    if (
      fs.existsSync(path.join(__dirname, `../file/comment/${lastedCommentId}`))
    ) {
      fs.rmSync(path.join(__dirname, `../file/comment/${lastedCommentId}`), {
        recursive: true,
        force: true,
      });
    }
    fs.mkdirSync(path.join(__dirname, `../file/comment/${lastedCommentId}`));

    const attachment = [];

    for (let i = 0; i < files.length; i++) {
      let fileName;

      fileName = files[i].originalname;
      let filePath = path.join(
        __dirname,
        `../file/comment/${lastedCommentId}/${fileName}`
      );
      fs.writeFileSync(filePath, files[i].buffer);

      attachment.push({
        // fileName: files[i].originalname,
        path: `${lastedCommentId}/${fileName}`,
      });
    }

    const rows = await pool.query(
      `
                    INSERT INTO 
                    comment 
                        (idUser, idPost, detail, timeStamp, \`like\`, filePath) 
                    VALUES 
                        (?, ?, ?, ?,?,?);`,
      [idUser, idPost, detail, new Date(), 0, JSON.stringify(attachment)]
    );

    const user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
      idUser,
    ]);

    EditTagPriority(idPost, idUser, 2);
    EditSubTagPriority(idPost, idUser, 1);

    let newComment = await pool.query(
      `SELECT * FROM comment WHERE idComment = ?`,
      [rows.insertId]
    );

    newComment = getAttchmentComments(newComment);

    if (rows) {
      newComment = {
        idComment: rows.insertId,
        profileName: user[0].profileName,
        idPost: idPost,
        idUser: idUser,
        timeStamp: new Date(),
        detail: detail,
        imagePath: user[0].imagePath,
        anonymouse: false,
        attachment: newComment[0].attachment,
        hasVerify: false,
        like: 0,
        filePath: JSON.stringify(attachment),
        idPostStatus: 1,
      };
      return res.status(200).send({
        success: true,
        data: newComment,
        error: null,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postClickVerifyComment = async (req, res) => {
  try {
    const { idComment, idUser } = req.body;
    let checkVerifyComment = await pool.query(
      `SELECT * FROM verifycomment WHERE idComment = ? AND idUser = ?`,
      [idComment, idUser]
    );
    let result;
    if (checkVerifyComment.length > 0) {
      if (checkVerifyComment[0].idUser == idUser) {
        let deleteVerifyComment = await pool.query(
          `DELETE FROM verifycomment WHERE idComment = ? AND idUser = ?`,
          [idComment, idUser]
        );
        result = await pool.query(
          `UPDATE comment SET isVerify = FALSE  WHERE idComment = ?`,
          [idComment]
        );
      }
    } else {
      let addVerifyComment = await pool.query(
        `INSERT INTO verifycomment (idComment, idUser ) VALUES (?, ?)`,
        [idComment, idUser]
      );

      result = await pool.query(
        `UPDATE comment SET isVerify = TRUE WHERE idComment = ?`,
        [idComment]
      );

      let AddHasVerifyPost = await pool.query(
        `UPDATE post SET hasVerify = TRUE WHERE idPost = (SELECT idPost FROM comment WHERE idComment = ?)`,
        [idComment]
      );
    }
    let comment = await pool.query(
      `SELECT * FROM comment WHERE idComment = ?`,
      [idComment]
    );
    if (result) {
      return res
        .status(200)
        .send({ message: "Verify success", data: comment[0] });
    } else {
      return res.status(404).send({ message: "Don't have comment" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { idComment } = req.params;
    // 1. Remove the post's attachment folder from disk (if it exists)
    const commentDir = path.join(__dirname, `../file/comment/${idComment}`);
    if (fs.existsSync(commentDir)) {
      // Remove the directory and all of its contents recursively
      fs.rmSync(commentDir, { recursive: true, force: true });
    }

    const deleteLikeComment = await pool.query(
      `DELETE FROM likecomment WHERE idComment = ?`,
      [idComment]
    );

    const reply = await pool.query(`SELECT * FROM reply WHERE idComment = ?`, [
      idComment,
    ]);
    if (reply.length > 0) {
      for (let i = 0; i < reply.length; i++) {
        const replyDir = path.join(
          __dirname,
          `../file/reply/${reply[i].idReply}`
        );
        if (fs.existsSync(replyDir)) {
          // Remove the directory and all of its contents recursively
          fs.rmSync(replyDir, { recursive: true, force: true });
        }
        const deleteLikeReply = await pool.query(
          `DELETE FROM likereply WHERE idReply = ?`,
          [reply[i].idReply]
        );
      }
    }
    const deleteReply = await pool.query(
      `DELETE FROM reply WHERE idComment = ?`,
      [idComment]
    );

    const deleteVerifyComment = await pool.query(
      `DELETE FROM verifycomment WHERE idComment = ?`,
      [idComment]
    );

    let result = await pool.query(`DELETE FROM comment WHERE idComment = ?`, [
      idComment,
    ]);
    if (result) {
      return res.status(200).send({ message: "Delete success" });
    } else {
      return res.status(404).send({ message: "Don't have comment" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
