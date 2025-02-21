const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
const { profile } = require("console");

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
      `SELECT * FROM reply WHERE idComment = ? ORDER BY isVerify DESC, timeStamp DESC, \`like\` DESC`,
      [idComment]
    );

    for (let i = 0; i < result.length; i++) {
      let user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
        result[i].idUser,
      ]);
      result[i].profileName = user[0].profileName;
      result[i].imagePath = user[0].imagePath;
    }
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
    let reply = await pool.query(`SELECT * FROM reply WHERE idReply = ?`, [
      idReply,
    ]);
    EditTagPriority(reply[0].idPost, idUser, like * 2);
    EditSubTagPriority(reply[0].idPost, idUser, like);

    if (result) {
      return res.status(200).send({ message: "Like success", data: reply[0] });
    } else {
      return res.status(404).send({ message: "Don't have reply" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postCreateReply = async (req, res) => {
  try {
    const { idUser, detail, idComment } = req.body;
    // const files = req.files;

    // let lastedPost = await pool.query(
    //   "SELECT * FROM post  ORDER BY idPost DESC LIMIT 1"
    // );
    // let lastedPostId = 0;

    // if (lastedPost.length == 0) {
    //   lastedPostId = lastedPostId + 1;
    // } else {
    //   lastedPostId = parseInt(lastedPost[0].idPost) + 1;
    // }

    // if (fs.existsSync(path.join(__dirname, `../file/post/${lastedPostId}`))) {
    //   fs.rmSync(path.join(__dirname, `../file/post/${lastedPostId}`), {
    //     recursive: true,
    //     force: true,
    //   });
    // }
    // fs.mkdirSync(path.join(__dirname, `../file/post/${lastedPostId}`));

    // const attachment = [];

    // for (let i = 0; i < files.length; i++) {
    //   let fileName;
    //   if (i == 0) {
    //     fileName =
    //       "unknow" +
    //       "." +
    //       files[i].originalname.split(".")[
    //         files[i].originalname.split(".").length - 1
    //       ];
    //   } else {
    //     fileName =
    //       "unknow" +
    //       "(" +
    //       i +
    //       ")" +
    //       "." +
    //       files[i].originalname.split(".")[
    //         files[i].originalname.split(".").length - 1
    //       ];
    //   }
    //   let filePath = path.join(
    //     __dirname,
    //     `../file/post/${lastedPostId}/${fileName}`
    //   );
    //   fs.writeFileSync(filePath, files[i].buffer);

    //   attachment.push({
    //     // fileName: files[i].originalname,
    //     path: `${lastedPostId}/${fileName}`,
    //   });
    // }

    const rows = await pool.query(
      `
                    INSERT INTO 
                    reply 
                        (idUser, idComment, detail, timeStamp, \`like\`) 
                    VALUES 
                        (?, ?, ?, ?,?);`,
      [idUser, idComment, detail, new Date(), 0]
    );

    const user = await pool.query(`SELECT * FROM user WHERE idUser = ?`, [
      idUser,
    ]);

    EditTagPriority(idComment, idUser, 2);
    EditSubTagPriority(idComment, idUser, 1);

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
        // filePath: JSON.stringify(attachment),
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

exports.deleteReplyById = async (req, res) => {
  try {
    const { idReply } = req.params;
    const replyDir = path.join(__dirname, `../file/reply/${idReply}`);
    if (fs.existsSync(replyDir)) {
      // Remove the directory and all of its contents recursively
      fs.rmSync(replyDir, { recursive: true, force: true });
    }
    const deleteLikeReply = await pool.query(
      `DELETE FROM likeReply WHERE idReply = ?`,
      [idReply]
    );
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
