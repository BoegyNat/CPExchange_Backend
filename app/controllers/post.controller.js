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
        fileName: attachment[j].path.split("/")[1],
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
      firstName_TH: posts[i].firstName_TH,
      lastName_TH: posts[i].lastName_TH,
      firstName_EN: posts[i].firstName_EN,
      lastName_EN: posts[i].lastName_EN,
      email: posts[i].email,
      profileName: posts[i].profileName,
      imagePath: posts[i].imagePath,
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

exports.getAllPostByIdUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    let result = await pool.query(
      "SELECT * FROM post p LEFT JOIN user u ON p.idUser = u.idUser WHERE p.idUser = ? ORDER BY timeStamp DESC",
      [idUser]
    );
    result = getAttchment(result);
    for (let i = 0; i < result.length; i++) {
      const tag = await pool.query(
        "SELECT * FROM tag t LEFT JOIN posttag pt ON t.idTag = pt.idTag WHERE pt.idPost = ?",
        [result[i].idPost]
      );
      result[i].tag = tag;

      const subtag = await pool.query(
        "SELECT * FROM subtag s LEFT JOIN postsubtag ps ON s.idSubTag = ps.idSubTag WHERE ps.idPost = ?",
        [result[i].idPost]
      );
      result[i].subtag = subtag;
      const liked = await pool.query(
        `SELECT * FROM likepost WHERE idPost = ? AND idUser = ?`,
        [result[i].idPost, idUser]
      );
      result[i].liked = liked.length > 0 ? true : false;
    }

    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have post" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getPostByIdPost = async (req, res) => {
  try {
    const { idPost } = req.params;
    let result = await pool.query(
      "SELECT * FROM post p LEFT JOIN user u ON p.idUser = u.idUser WHERE p.idPost = ?",
      [idPost]
    );
    result = getAttchment(result);
    for (let i = 0; i < result.length; i++) {
      let tag = await pool.query(
        "SELECT * FROM tag t LEFT JOIN posttag pt ON t.idTag = pt.idTag WHERE pt.idPost = ?",
        [result[i].idPost]
      );
      result[i].tag = tag;

      let subtag = await pool.query(
        "SELECT * FROM subtag s LEFT JOIN postsubtag ps ON s.idSubTag = ps.idSubTag WHERE ps.idPost = ?",
        [result[i].idPost]
      );

      result[i].subtag = subtag;

      let the_other_subtag = await pool.query(
        `
        SELECT * 
FROM subtag s LEFT JOIN tag t  ON s.idTag = t.idTag 
WHERE t.idTag = ? AND idSubTag NOT IN (
    SELECT idSubTag 
    FROM postsubtag 
    WHERE idPost = ?
);
        `,
        [result[i].tag[0].idTag, result[i].idPost]
      );
      result[i].the_other_subtag = the_other_subtag;
    }
    if (result) {
      res.status(200).send(result[0]);
    } else {
      return res.status(404).send({ message: "Post Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM post p LEFT JOIN user u ON p.idUser = u.idUser ORDER BY timeStamp DESC"
    );
    result = getAttchment(result);
    for (let i = 0; i < result.length; i++) {
      let tag = await pool.query(
        "SELECT * FROM tag t LEFT JOIN posttag pt ON t.idTag = pt.idTag WHERE pt.idPost = ?",
        [result[i].idPost]
      );
      result[i].tag = tag;

      let subtag = await pool.query(
        "SELECT * FROM subtag s LEFT JOIN postsubtag ps ON s.idSubTag = ps.idSubTag WHERE ps.idPost = ?",
        [result[i].idPost]
      );
      result[i].subtag = subtag;
    }
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
    let like = 0;
    if (checkLikePost.length > 0) {
      let deleteLikePost = await pool.query(
        `DELETE FROM likepost WHERE idPost = ? AND idUser = ?`,
        [idPost, idUser]
      );
      result = await pool.query(
        `UPDATE post SET \`like\` = \`like\` - 1 WHERE idPost = ?`,
        [idPost]
      );
      EditTagPriority(idPost, idUser, -2);
      EditSubTagPriority(idPost, idUser, -1);
      like = -1;
    } else {
      let addLikePost = await pool.query(
        `INSERT INTO likepost (idPost, idUser ) VALUES (?, ?)`,
        [idPost, idUser]
      );

      result = await pool.query(
        `UPDATE post SET \`like\` = \`like\` + 1 WHERE idPost = ?`,
        [idPost]
      );
      EditTagPriority(idPost, idUser, 2);
      EditSubTagPriority(idPost, idUser, 1);
      like = 1;
    }

    let post = await pool.query(`SELECT * FROM post WHERE idPost = ?`, [
      idPost,
    ]);

    if (result) {
      return res
        .status(200)
        .send({ message: "Like success", data: post[0], like: like });
    } else {
      return res.status(404).send({ message: "Don't have post" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getPostByPriorityForSubmmitedPost = async (req, res) => {
  try {
    const { idUser } = req.params;
    let result = [];
    let lastPost = await pool.query(
      `SELECT p.*, u.* FROM post p LEFT JOIN user u ON p.idUser = u.idUser WHERE p.idUser = ? ORDER BY p.timeStamp DESC LIMIT 1`,
      [idUser]
    );
    result.push(lastPost[0]);
    let posts = await pool.query(
      `
 SELECT 
    p.*,  u.* ,
    COALESCE(MAX(utp.priority), 0) AS tagPriority, 
    COALESCE(MAX(ustp.priority), 0) AS subTagPriority,
    (COALESCE(MAX(utp.priority), 0) + COALESCE(MAX(ustp.priority), 0)) AS totalPriority
FROM 
    post p
LEFT JOIN posttag pt ON p.idPost = pt.idPost
LEFT JOIN usertagpriority utp ON pt.idTag = utp.idTag AND utp.idUser = ?
LEFT JOIN postsubtag pst ON p.idPost = pst.idPost
LEFT JOIN usersubtagpriority ustp ON pst.idSubTag = ustp.idSubTag AND ustp.idUser = ? 
LEFT JOIN user u ON p.idUser = u.idUser
GROUP BY p.idPost
ORDER BY totalPriority DESC, p.timeStamp DESC;
`,
      [idUser, idUser]
    );
    for (let i = 0; i < posts.length; i++) {
      result.push(posts[i]);
    }
    result = getAttchment(result);

    for (let i = 0; i < result.length; i++) {
      const tag = await pool.query(
        "SELECT * FROM tag t LEFT JOIN posttag pt ON t.idTag = pt.idTag WHERE pt.idPost = ?",
        [result[i].idPost]
      );
      result[i].tag = tag;

      const subtag = await pool.query(
        "SELECT * FROM subtag s LEFT JOIN postsubtag ps ON s.idSubTag = ps.idSubTag WHERE ps.idPost = ?",
        [result[i].idPost]
      );
      result[i].subtag = subtag;

      const liked = await pool.query(
        `SELECT * FROM likepost WHERE idPost = ? AND idUser = ?`,
        [result[i].idPost, idUser]
      );
      result[i].liked = liked.length > 0 ? true : false;
    }
    if (result) {
      res.status(200).send(result);
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
    p.*,  u.* ,
    COALESCE(MAX(utp.priority), 0) AS tagPriority, 
    COALESCE(MAX(ustp.priority), 0) AS subTagPriority,
    (COALESCE(MAX(utp.priority), 0) + COALESCE(MAX(ustp.priority), 0)) AS totalPriority
FROM 
    post p
LEFT JOIN posttag pt ON p.idPost = pt.idPost
LEFT JOIN usertagpriority utp ON pt.idTag = utp.idTag AND utp.idUser = ?
LEFT JOIN postsubtag pst ON p.idPost = pst.idPost
LEFT JOIN usersubtagpriority ustp ON pst.idSubTag = ustp.idSubTag AND ustp.idUser = ? 
LEFT JOIN user u ON p.idUser = u.idUser
GROUP BY p.idPost
ORDER BY totalPriority DESC, p.timeStamp DESC;
`,
      [idUser, idUser]
    );
    result = getAttchment(result);

    for (let i = 0; i < result.length; i++) {
      const tag = await pool.query(
        "SELECT * FROM tag t LEFT JOIN posttag pt ON t.idTag = pt.idTag WHERE pt.idPost = ?",
        [result[i].idPost]
      );
      result[i].tag = tag;

      const subtag = await pool.query(
        "SELECT * FROM subtag s LEFT JOIN postsubtag ps ON s.idSubTag = ps.idSubTag WHERE ps.idPost = ?",
        [result[i].idPost]
      );
      result[i].subtag = subtag;

      const liked = await pool.query(
        `SELECT * FROM likepost WHERE idPost = ? AND idUser = ?`,
        [result[i].idPost, idUser]
      );
      result[i].liked = liked.length > 0 ? true : false;
    }
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
    EditTagPriority(lastedPostId, idUser, 5);
    EditSubTagPriority(lastedPostId, idUser, 2);

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

exports.postEditPost = async (req, res) => {
  try {
    // Extract values from req.body and parse JSON strings
    const { idUser, idPost, topic, detail } = req.body;
    const subject = JSON.parse(req.body.subject);
    const categories = JSON.parse(req.body.categories);
    const attachment_old = JSON.parse(req.body.attachment_old);
    const files = req.files; // New attachments

    // Define the folder path for this post's attachments
    const postDir = path.join(__dirname, `../file/post/${idPost}`);

    // Ensure the post directory exists (create if needed)
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    let attachment = [];

    // Process the old attachments:
    // • If the client indicates an attachment is deleted, remove it from disk.
    // • Otherwise, keep its reference.
    for (let i = 0; i < attachment_old.length; i++) {
      const oldAtt = attachment_old[i];
      if (oldAtt.isDeleted) {
        // Remove the file if it exists
        const filePath = path.join(postDir, oldAtt.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        // Keep the attachment by adding its relative path
        attachment.push({
          path: `${idPost}/${oldAtt.fileName}`,
        });
      }
    }

    // Process any new attachments coming in req.files:
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i].originalname;
        const filePath = path.join(postDir, fileName);
        // Write the new file to the disk
        fs.writeFileSync(filePath, files[i].buffer);
        // Add its path to the attachment list
        attachment.push({
          path: `${idPost}/${fileName}`,
        });
      }
    }

    // Update the "post" record in the database.
    // (Here we update topic, detail, timestamp, and the filePath field.)
    const updateQuery = `
      UPDATE post 
      SET topic = ?, detail = ?, timeStamp = ?, filePath = ?
      WHERE idPost = ?`;
    const updateValues = [
      topic,
      detail,
      new Date(),
      JSON.stringify(attachment),
      idPost,
    ];
    const updateResult = await pool.query(updateQuery, updateValues);

    // Update tag relationships.
    // First, remove any existing relations for this post.
    await pool.query("DELETE FROM posttag WHERE idpost = ?", [idPost]);
    await pool.query("DELETE FROM postsubtag WHERE idpost = ?", [idPost]);

    // Now, insert new tag/subtag records based on the request data.
    if (subject.idTag == null) {
      // No tag id provided so we create a new tag.
      const addTagResult = await pool.query(
        `INSERT INTO tag (tagName) VALUES (?)`,
        [subject.tagName]
      );
      const newTagId = addTagResult.insertId;
      await pool.query(`INSERT INTO posttag (idtag, idpost) VALUES (?, ?)`, [
        newTagId,
        idPost,
      ]);
      // Insert each category as a subtag
      for (let i = 0; i < categories.length; i++) {
        const addSubTagResult = await pool.query(
          `INSERT INTO subtag (idTag, subTagName) VALUES (?, ?)`,
          [newTagId, categories[i].subTagName]
        );
        await pool.query(
          `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
          [addSubTagResult.insertId, idPost]
        );
      }
    } else {
      // Use the provided tag id.
      await pool.query(`INSERT INTO posttag (idtag, idpost) VALUES (?, ?)`, [
        subject.idTag,
        idPost,
      ]);
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].idSubTag == null) {
          const addSubTagResult = await pool.query(
            `INSERT INTO subtag (idTag, subTagName) VALUES (?, ?)`,
            [subject.idTag, categories[i].subTagName]
          );
          await pool.query(
            `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
            [addSubTagResult.insertId, idPost]
          );
        } else {
          await pool.query(
            `INSERT INTO postsubtag (idsubtag, idpost) VALUES (?, ?)`,
            [categories[i].idSubTag, idPost]
          );
        }
      }
    }

    // If the update was successful, respond with the updated post details.
    const updatedPost = {
      idPost,
      idUser,
      topic,
      timeStamp: new Date(),
      detail,
      anonymous: false,
      hasVerify: false,
      like: 0,
      filePath: JSON.stringify(attachment),
      idPostStatus: 1,
    };

    return res.status(200).send({
      success: true,
      data: updatedPost,
      error: null,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
