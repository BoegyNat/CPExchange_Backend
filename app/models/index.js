const db = {};

db.users = require("../models/user.model.js");
db.courses = require("../models/course.model.js");
db.departments = require("../models/department.model.js");
db.cars = require("../models/car.model");
db.statusCar =  require("./statusCar.model");
db.wayOfDriver = require("./wayOfDriver.model");
db.buses = require("../models/bus.model");
db.bookings = require("../models/booking.modal");
db.waitingFriendCars = require("../models/waitingFriendCar.modal");
db.registersOfDriver = require("../models/registerOfDriver.model");
db.routes = require("../models/route.modal");
db.employees = require("../models/employee.modal");
db.routesDay = require("../models/routeDay.model");
db.drivers = require("../models/driver.model");
db.vehicles =require("../models/vehicle.model");
db.lentcar = require("./lentCar.model");
db.reviews = require("./review.model");
db.historyLentCars = require("./historyLentCar.model");
db.historyActionsOfLentCar = require("./historyActionsOfLentCar.model");
db.options = require("./option.model");
db.requestsPassenger = require("../models/requestPassenger.model");
db.crossAreaCarBookings = require("../models/crossAreaCarBooking.model");
db.crossAreaCarBookingPassengers = require("../models/crossAreaCarBookingPassenger.model");
db.vehicleTypes = require("../models/vehicleType.model");
db.vehicleBrandsAndModels = require("../models/vehicleBrandAndModel.model");
db.crossAreaCarPoolBookings = require("../models/crossAreaCarPoolBooking.model");
db.crossAreaCarPoolBookingPassengers = require("../models/crossAreaCarPoolBookingPassenger.model");
db.inAreaCarBookings = require("../models/inAreaCarBooking.model");
db.deliveryCarBookings = require("../models/deliveryCarBooking.model");
db.betweenSiteCars = require("../models/betweenSiteCar.model");
db.passengerFriendToFriends = require("../models/passengerFriendToFriend.model");
db.driverRouteDays = require("../models/driverRouteDay.model");
db.adminLentCars = require("../models/adminLentCar.model");
db.routeCrossAreaCarPool = require("../models/routeCrossAreaCarPool.model");

//Catering Backend
db.caterings = require("../models/Catering/catering.model");
db.restaurants = require("../models/Catering/restaurant.model");
db.foods = require("../models/Catering/food.model");
db.orderFoods = require("../models/Catering/orderFood.model");
db.restaurantRatings = require("../models/Catering/restaurantRating.model");

//Maintenances Backend
db.maintenances = require("../models/Maintenances/maintenance.model");
db.maintenanceTechnicians = require("../models/Maintenances/maintenance.technician.model");
db.maintenanceProgressReport = require("../models/Maintenances/maintenance.progressReport.model");
db.maintenanceNotificationTypes = require("../models/Maintenances/maintenance.notificationType.model");
db.maintenanceNotifications = require("../models/Maintenances/maintenance.notification.model");

module.exports = db;
