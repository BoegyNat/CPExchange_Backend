const e = require("express");
const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");

exports.getAllCommentByIdPost = async (req, res) => {
  try {
    const { idPost } = req.params;
    let result = await pool.query(
      `SELECT * FROM comment WHERE idPost = ? ORDER BY isVerify DESC, timeStamp DESC, \`like\` DESC`,
      [idPost]
    );

    return res.status(200).send(result);
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
    if (checkLikeComment.length > 0) {
      let deleteLikeComment = await pool.query(
        `DELETE FROM likecomment WHERE idComment = ? AND idUser = ?`,
        [idComment, idUser]
      );
      result = await pool.query(
        `UPDATE comment SET \`like\` = \`like\` - 1 WHERE idComment = ?`,
        [idComment]
      );
    } else {
      let addLikeComment = await pool.query(
        `INSERT INTO likecomment (idComment, idUser ) VALUES (?, ?)`,
        [idComment, idUser]
      );

      result = await pool.query(
        `UPDATE comment SET \`like\` = \`like\` + 1 WHERE idComment = ?`,
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
                    comment 
                        (idUser, idPost, detail, timeStamp, \`like\`) 
                    VALUES 
                        (?, ?, ?, ?);`,
      [idUser, idPost, detail, new Date(), 0]
    );

    if (rows) {
      newComment = {
        idPost: idPost,
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
        data: newPost,
        error: null,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postVerifyClickComment = async (req, res) => {
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
