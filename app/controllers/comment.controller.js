const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
const { getIO } = require("../../socket.js");
const { profile } = require("console");

require("dotenv").config();

async function getAttchmentComments(comments, idUser = null) {
  let result = [];
  for (let i = 0; i < comments.length; i++) {
    let attachment = JSON.parse(comments[i].filePath) ?? [];
    let newAttachment = [];
    for (let j = 0; j < attachment.length; j++) {
      newAttachment.push({
        fileName: attachment[j].path.split("/")[1],
        url: `${process.env.API_URL}file/comment/${attachment[j].path}`,
      });
    }

    const countReply = await pool.query(
      `SELECT * FROM reply WHERE idComment = ?`,
      [comments[i].idComment]
    );

    isUpVote = false;
    isDownVote = false;
    if (idUser != null) {
      const countLike = await pool.query(
        `SELECT * FROM likecomment WHERE idComment = ? AND idUser = ?`,
        [comments[i].idComment, idUser]
      );
      for (let j = 0; j < countLike.length; j++) {
        if (countLike[j].isUpVote == true) {
          isUpVote = true;
        } else {
          isDownVote = true;
        }
      }
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
      countReply: countReply.length,
      isUpVote: isUpVote,
      isDownVote: isDownVote,
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
      `SELECT * FROM comment LEFT JOIN user ON comment.idUser = user.idUser WHERE idPost = ? ORDER BY isVerify DESC, \`like\` DESC, timeStamp DESC`,
      [idPost]
    );

    result = await getAttchmentComments(result);

    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send([]);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllCommentByIdPostWithIdUser = async (req, res) => {
  try {
    const { idPost, idUser } = req.body;
    let result = await pool.query(
      `SELECT * FROM comment LEFT JOIN user ON comment.idUser = user.idUser WHERE idPost = ? ORDER BY isVerify DESC, \`like\` DESC, timeStamp DESC`,
      [idPost]
    );

    result = await getAttchmentComments(result, idUser);

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
    const { idUser, idComment, isUpVote } = req.body;
    const comment = await pool.query(
      "SELECT * FROM comment WHERE idComment = ?",
      [idComment]
    );
    const likecomment = await pool.query(
      "SELECT * FROM likecomment WHERE idUser = ? AND idComment = ?",
      [idUser, idComment]
    );
    const deleteLikeComment = await pool.query(
      "DELETE FROM likecomment WHERE idUser = ? AND idComment = ?",
      [idUser, idComment]
    );
    let changeScore = 0;
    let check = 0;
    if (likecomment.length > 0) {
      if (likecomment[0].isUpVote == isUpVote) {
        if (isUpVote == true) {
          changeScore -= 1;
        } else {
          changeScore += 1;
        }
      } else {
        if (isUpVote == true) {
          changeScore += 2;
          check = 1;
        } else {
          changeScore -= 2;
          check = -1;
        }
      }
    } else {
      if (isUpVote == true) {
        changeScore += 1;
        check = 1;
      } else {
        changeScore -= 1;
        check = -1;
      }
    }
    if (check != 0) {
      EditTagPriority(comment[0].idPost, idUser, changeScore * 2);
      EditSubTagPriority(comment[0].idPost, idUser, changeScore);
      const addLikeComment = await pool.query(
        "INSERT INTO likecomment (idUser, idComment, isUpVote) VALUES (?, ?, ?)",
        [idUser, idComment, isUpVote]
      );
    }

    const result = await pool.query(
      "UPDATE comment SET `like` = `like` + ? WHERE idComment = ?",
      [changeScore, idComment]
    );

    if (result) {
      return res.status(200).send({
        message: "Like success",
        like: comment[0].like + changeScore,
        changeScore: check,
      });
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

    const rows = await pool.query(
      `
                    INSERT INTO 
                    comment 
                        (idUser, idPost, detail, timeStamp, \`like\`) 
                    VALUES 
                        (?, ?, ?, ?,?);`,
      [idUser, idPost, detail, new Date(), 0]
    );

    const lastedCommentId = rows.insertId;

    if (!fs.existsSync(path.join(__dirname, `../file/comment`))) {
      fs.mkdirSync(path.join(__dirname, `../file/comment`));
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

    const updaterows = await pool.query(
      `
                    UPDATE 
                    comment 
                    SET 
                        filePath = ?
                    WHERE 
                        idComment = ?;`,
      [JSON.stringify(attachment), lastedCommentId]
    );

    const user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
      idUser,
    ]);

    EditTagPriority(idPost, idUser, 2);
    EditSubTagPriority(idPost, idUser, 1);

    let newComment = await pool.query(
      `SELECT * FROM comment LEFT JOIN user ON comment.idUser = user.idUser WHERE idComment = ? `,
      [rows.insertId]
    );

    newComment = await getAttchmentComments(newComment, idUser);

    const postOwner = await pool.query(
      `SELECT idUser, topic FROM post WHERE idPost = ?`,
      [idPost]
    );

    if (postOwner.length > 0 && postOwner[0].idUser != idUser) {
      const postOwnerId = postOwner[0].idUser;
      const topic = postOwner[0].topic;
      const insertNotification = await pool.query(
        `INSERT INTO notification (idUser, idSender, detail, idNotificationStatus, idPost, idComment, timeStamp) VALUES (?,?,?, ?, ?, ?, ?)`,
        [
          postOwnerId,
          idUser,
          `${user[0].profileName} commented on your post. Post's topic :"${topic}"`,
          1,
          idPost,
          lastedCommentId,
          new Date(),
        ]
      );

      try {
        const io = getIO(); // ✅ ใช้ getIO() เพื่อดึง instance ของ io
        io.emit(`notify_post_${postOwnerId}`, {
          message: `${user[0].profileName} commented on your post. Post's topic :"${topic}"`,
          postId: idPost,
          userId: postOwnerId,
        });
        console.log(`✅ ส่งแจ้งเตือนสำเร็จ: notify_post_${postOwnerId}`);
      } catch (error) {
        console.error("❌ ไม่สามารถส่งแจ้งเตือนได้:", error.message);
      }
    }

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
        isVerify: false,
        like: 0,
        filePath: JSON.stringify(attachment),
        idPostStatus: 1,
        countReply: 0,
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

exports.postEditComment = async (req, res) => {
  try {
    const { idUser, detail, idPost, idComment } = req.body;
    const attachment_old = JSON.parse(req.body.attachment_old);
    const files = req.files;

    const commentDir = path.join(__dirname, `../file/comment/${idComment}`);
    if (!fs.existsSync(path.join(__dirname, `../file/comment`))) {
      fs.mkdirSync(path.join(__dirname, `../file/comment`));
    }

    if (!fs.existsSync(commentDir)) {
      fs.mkdirSync(commentDir, { recursive: true });
    }

    let attachment = [];
    for (let i = 0; i < attachment_old.length; i++) {
      const oldAtt = attachment_old[i];
      if (oldAtt.isDeleted) {
        const filePath = path.join(commentDir, oldAtt.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        attachment.push({
          path: `${idComment}/${oldAtt.fileName}`,
        });
      }
    }
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i].originalname;
        const filePath = path.join(commentDir, fileName);
        fs.writeFileSync(filePath, files[i].buffer);
        attachment.push({
          path: `${idComment}/${fileName}`,
        });
      }
    }

    const rows = await pool.query(
      `
                    UPDATE 
                    comment 
                    SET 
                        detail = ?, timeStamp = ?, filePath = ?
                    WHERE 
                        idComment = ?;`,
      [detail, new Date(), JSON.stringify(attachment), idComment]
    );

    if (rows) {
      let newComment = await pool.query(
        `SELECT * FROM comment LEFT JOIN user ON comment.idUser = user.idUser WHERE idPost = ? ORDER BY isVerify DESC, timeStamp DESC, \`like\` DESC`,
        [idPost]
      );

      newComment = await getAttchmentComments(newComment, idUser);
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
    let verified = false;
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
        const checkPostHasVerify = await pool.query(
          `SELECT * FROM comment WHERE idPost = (SELECT idPost FROM comment WHERE idComment = ?) AND isVerify = TRUE`,
          [idComment]
        );

        if (checkPostHasVerify.length == 0) {
          let AddHasVerifyPost = await pool.query(
            `UPDATE post SET hasVerify = FALSE WHERE idPost = (SELECT idPost FROM comment WHERE idComment = ?)`,
            [idComment]
          );
        }
        verified = false;
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

      verified = true;
    }

    if (result) {
      return res
        .status(200)
        .send({ message: "Verify success", data: verified });
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
    const deleteNotification = await pool.query(
      `DELETE FROM notification WHERE idComment = ?`,
      [idComment]
    );
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
