const pool = require("../connection.js");
const fs = require("fs");
const path = require("path");
exports.getAllPost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllPostByIdUser = async (req, res) => {
  try {
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

    if (
      fs.existsSync(path.join(__dirname, `../../app/file/post/${lastedPostId}`))
    ) {
      fs.rmSync(path.join(__dirname, `../../app/file/post/${lastedPostId}`), {
        recursive: true,
        force: true,
      });
    }
    fs.mkdirSync(path.join(__dirname, `../../app/file/post/${lastedPostId}`));

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
        `../../app/file/post/${lastedPostId}/${fileName}`
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
                        (idUser, topic, timeStamp, detail, anonymouse, hasVerify,\`like\`, filePath, idPostStatus) 
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

    const AddTag = await pool.query(
      `INSERT INTO posttag (idtag, idpost) VALUES (?, ?)`,
      [subject.idTag, lastedPostId]
    );
    for (let i = 0; i < categories.length; i++) {
      const AddSubTag = await pool.query(
        `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
        [categories[i].idSubTag, lastedPostId]
      );
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
        idPostStatus: 0,
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
