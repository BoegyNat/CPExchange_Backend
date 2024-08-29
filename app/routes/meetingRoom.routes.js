const { authJwt } = require("../middleware");
const MeetingRoomController = require("../controllers/meetingRoom.controller");
const multer = require("multer");
const upload = multer();
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/add_new_meeting_room",
    [authJwt.verifyToken, upload.array("attachment")],
    MeetingRoomController.postNewMeetingRoom
  );
  app.get(
    "/api/all_new_meeting_room",
    [authJwt.verifyToken],
    MeetingRoomController.getAllNewMeetingRoom
  );
  app.get(
    "/api/all_image_new_meeting_room_byId/:id",
    [authJwt.verifyToken],
    MeetingRoomController.getAllImageNewMeetingRoomById
  );
  app.get(
    "/api/all_meeting_room_byId/:id",
    [authJwt.verifyToken],
    MeetingRoomController.getAllMeetingRoomById
  );
  app.post(
    "/api/add_new_meeting_room_booking",
    [authJwt.verifyToken],
    MeetingRoomController.postNewMeetingRoomBooking
  );
  app.get(
    "/api/get_meeting_room_booking_byIdUser/:idUser",
    [authJwt.verifyToken],
    MeetingRoomController.getMeetingRoomBookingByIdUser
  );
  app.get(
    "/api/all_new_meeting_room_booking",
    [authJwt.verifyToken],
    MeetingRoomController.getAllNewMeetingRoomBooking
  );
  app.post(
    "/api/all_new_meeting_room_booking_and_all_meeting_room",
    [authJwt.verifyToken],
    MeetingRoomController.getAllMeetingRoomBookingAndAllMeetingRoom
  );
  app.post(
    "/api/approved_meeting_room_booking",
    [authJwt.verifyToken],
    MeetingRoomController.postApprovedlMeetingRoomBooking
  );
  app.get(
    "/api/meeting_room_booking_byIdUser_ForRating/:idUser",
    [authJwt.verifyToken],
    MeetingRoomController.getMeetingRoomBookingByIdUserForRating
  );
  app.post(
    "/api/meeting_room_booking_ByFilter",
    [authJwt.verifyToken],
    MeetingRoomController.getMeetingRoomBookingByFilter
  );
  app.get(
    "/api/get_meeting_room_booking_byIdMeetingRoom/:id",
    [authJwt.verifyToken],
    MeetingRoomController.getAllMeetingRoomBookingByIdMeetingRoom
  );
  app.get(
    "/api/get_meeting_room_booking_byId/:id",
    [authJwt.verifyToken],
    MeetingRoomController.getMeetingRoomBookingById
  );
};
