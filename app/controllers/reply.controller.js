const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
const { profile } = require("console");

function getAttchmentReply(reply) {
  let result = [];
  for (let i = 0; i < reply.length; i++) {
    let attachment = JSON.parse(reply[i].filePath) ?? [];
    let newAttachment = [];
    for (let j = 0; j < attachment.length; j++) {
      newAttachment.push({
        fileName: attachment[j].path.split("/")[1],
        url: `${process.env.API_URL}file/reply/${attachment[j].path}`,
      });
    }
    result.push({
      idReply: reply[i].idReply,
      idComment: reply[i].idComment,
      idUser: reply[i].idUser,
      detail: reply[i].detail,
      timeStamp: reply[i].timeStamp,
      anonymous: reply[i].anonymous,
      like: reply[i].like,
      attachment: newAttachment,
      profileName: reply[i].profileName,
      imagePath: reply[i].imagePath,
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
exports.getAllReplyByIdComment = async (req, res) => {
  try {
    const { idComment } = req.params;
    let result = await pool.query(
      `SELECT * FROM reply WHERE idComment = ? ORDER BY  timeStamp DESC, \`like\` DESC`,
      [idComment]
    );

    for (let i = 0; i < result.length; i++) {
      let user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
        result[i].idUser,
      ]);
      let checkLikeReply = await pool.query(
        `SELECT * FROM likereply WHERE idReply = ? AND idUser = ?`,
        [result[i].idReply, result[i].idUser]
      );
      result[i].liked = checkLikeReply.length > 0 ? true : false;
      result[i].profileName = user[0].profileName;
      result[i].imagePath = user[0].imagePath;
    }
    result = getAttchmentReply(result);
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send([]);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postClickLikeReply = async (req, res) => {
  try {
    const { idUser, idReply } = req.body;

    let checkLikeReply = await pool.query(
      `SELECT * FROM likereply WHERE idReply = ? AND idUser = ?`,
      [idReply, idUser]
    );
    let result;
    let like = 0;
    if (checkLikeReply.length > 0) {
      let deleteLikeReply = await pool.query(
        `DELETE FROM likereply WHERE idReply = ? AND idUser = ?`,
        [idReply, idUser]
      );
      result = await pool.query(
        `UPDATE reply SET \`like\` = \`like\` - 1 WHERE idReply = ?`,
        [idReply]
      );
      like = -1;
    } else {
      let addLikeReply = await pool.query(
        `INSERT INTO likereply (idReply, idUser ) VALUES (?, ?)`,
        [idReply, idUser]
      );

      result = await pool.query(
        `UPDATE reply SET \`like\` = \`like\` + 1 WHERE idReply = ?`,
        [idReply]
      );
      like = 1;
    }
    let reply = await pool.query(
      `SELECT * FROM reply LEFT JOIN comment ON reply.idComment = comment.idComment WHERE idReply = ?`,
      [idReply]
    );
    EditTagPriority(reply[0].idPost, idUser, like * 2);
    EditSubTagPriority(reply[0].idPost, idUser, like);

    if (result) {
      return res
        .status(200)
        .send({ message: "Like success", data: reply[0], like: like });
    } else {
      return res.status(404).send({ message: "Don't have reply" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postCreateReply = async (req, res) => {
  try {
    const { idUser, detail, idComment, idPost } = req.body;
    const files = req.files;

    const rows = await pool.query(
      `
                    INSERT INTO 
                    reply 
                        (idUser, idComment, detail, timeStamp, \`like\`) 
                    VALUES 
                        (?, ?, ?, ?,?);`,
      [idUser, idComment, detail, new Date(), 0]
    );

    const lastedReplyId = rows.insertId;

    if (!fs.existsSync(path.join(__dirname, `../file/reply`))) {
      fs.mkdirSync(path.join(__dirname, `../file/reply`));
    }

    if (fs.existsSync(path.join(__dirname, `../file/reply/${lastedReplyId}`))) {
      fs.rmSync(path.join(__dirname, `../file/reply/${lastedReplyId}`), {
        recursive: true,
        force: true,
      });
    }
    fs.mkdirSync(path.join(__dirname, `../file/reply/${lastedReplyId}`));

    const attachment = [];

    for (let i = 0; i < files.length; i++) {
      let fileName;
      if (i == 0) {
        fileName =
          "unknow" +
          "." +
          files[i].originalname.split(".")[
            files[i].originalname.split(".").length - 1
          ];
      } else {
        fileName =
          "unknow" +
          "(" +
          i +
          ")" +
          "." +
          files[i].originalname.split(".")[
            files[i].originalname.split(".").length - 1
          ];
      }
      let filePath = path.join(
        __dirname,
        `../file/reply/${lastedReplyId}/${fileName}`
      );
      fs.writeFileSync(filePath, files[i].buffer);

      attachment.push({
        // fileName: files[i].originalname,
        path: `${lastedReplyId}/${fileName}`,
      });
    }

    const updaterows = await pool.query(
      `
                    UPDATE reply
                    SET filePath = ?
                    WHERE idUser = ? AND idComment = ?;`,
      [JSON.stringify(attachment), idUser, idComment]
    );

    const user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
      idUser,
    ]);

    EditTagPriority(idPost, idUser, 1);
    EditSubTagPriority(idPost, idUser, 0.5);

    if (rows) {
      newReply = {
        idReply: rows.insertId,
        profileName: user[0].profileName,
        idComment: idComment,
        idUser: idUser,
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
        data: newReply,
        error: null,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditReply = async (req, res) => {
  try {
    const { idUser, detail, idPost, idReply, idComment } = req.body;
    const attachment_old = JSON.parse(req.body.attachment_old);
    const files = req.files;

    const replyDir = path.join(__dirname, `../file/reply/${idReply}`);
    if (!fs.existsSync(path.join(__dirname, `../file/reply`))) {
      fs.mkdirSync(path.join(__dirname, `../file/reply`));
    }

    if (!fs.existsSync(replyDir)) {
      fs.mkdirSync(replyDir, { recursive: true });
    }

    let attachment = [];
    for (let i = 0; i < attachment_old.length; i++) {
      const oldAtt = attachment_old[i];
      if (oldAtt.isDeleted) {
        const filePath = path.join(replyDir, oldAtt.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        attachment.push({
          path: `${idReply}/${oldAtt.fileName}`,
        });
      }
    }
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i].originalname;
        const filePath = path.join(replyDir, fileName);
        fs.writeFileSync(filePath, files[i].buffer);
        attachment.push({
          path: `${idReply}/${fileName}`,
        });
      }
    }

    const rows = await pool.query(
      `
                    UPDATE 
                    reply 
                    SET 
                        detail = ?, timeStamp = ?, filePath = ?
                    WHERE 
                        idReply = ?;`,
      [detail, new Date(), JSON.stringify(attachment), idReply]
    );

    if (rows) {
      let comments = await pool.query(
        `SELECT * FROM comment LEFT JOIN user ON comment.idUser = user.idUser WHERE idPost = ? ORDER BY isVerify DESC, timeStamp DESC, \`like\` DESC`,
        [idPost]
      );
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

        const countLike = await pool.query(
          `SELECT * FROM likecomment WHERE idComment = ? AND idUser = ?`,
          [comments[i].idComment, comments[i].idUser]
        );
        isUpVote = false;
        isDownVote = false;
        for (let j = 0; j < countLike.length; j++) {
          if (countLike[j].isUpVote == true) {
            isUpVote = true;
          } else {
            isDownVote = true;
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

      return res.status(200).send({
        success: true,
        data: result,
        error: null,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteReplyByIdReply = async (req, res) => {
  try {
    const { idReply } = req.params;
    const replyDir = path.join(__dirname, `../file/reply/${idReply}`);
    if (fs.existsSync(replyDir)) {
      // Remove the directory and all of its contents recursively
      fs.rmSync(replyDir, { recursive: true, force: true });
    }
    const deleteLikeReply = await pool.query(
      `DELETE FROM likereply WHERE idReply = ?`,
      [idReply]
    );
    let reply = await pool.query(
      `SELECT * FROM reply LEFT JOIN comment ON reply.idComment = comment.idComment WHERE idReply = ?`,
      [idReply]
    );
    EditTagPriority(reply[0].idPost, reply[0].idUser, 1);
    EditSubTagPriority(reply[0].idPost, reply[0].idUser, 0.5);

    let result = await pool.query(`DELETE FROM reply WHERE idReply = ?`, [
      idReply,
    ]);
    if (result) {
      return res.status(200).send({ message: "Delete success" });
    } else {
      return res.status(404).send({ message: "Don't have reply" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
