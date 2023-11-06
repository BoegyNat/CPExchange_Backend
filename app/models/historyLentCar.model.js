const HistoryLentCars = [
    {
        id:1,
        carId:1,
        model:"Honda Jazz",
        imageCar:"car1.png",
        lenderId:1, // IdUser
        borrowerId:2, // IdUser
        delivery:true,
        province:"Bangkok",
        district:"BangSue",
        datelent: "30/9/2021",
        datelenttime:"8:00",
        datereturn: "2/10/2021",
        datereturntime:"20:00",
        duration:1,
        price:1000,
        extras:[
            {
                idExtra:1,
                extra:"ไม่จำกัดไมล์",
                price:2000,
                duration:"การเดินทาง"
            },
            {
                idExtra:2,
                extra:"เติมน้ำมันล่วงหน้า",
                price:1000,
                duration:"การเดินทาง"
            },
            {
                idExtra:5,
                extra:"ถุงนอน",
                price:200,
                duration:"วัน"
            },
            {
                idExtra:6,
                extra:"ถังน้ำแข็ง",
                price:200,
                duration:"วัน"
            },
        ],
        status:"Approved",
    },
    {
        id:2,
        carId:1,
        model:"Honda Jazz",
        imageCar:"car3.jpg",
        lenderId:1,
        borrowerId:3,
        delivery:false,
        province:"Bangkok",
        district:"BangSue",
        datelent: "3/10/2021",
        datelenttime:"10:00",
        datereturn: "4/10/2021",
        datereturntime:"14:00",
        duration:2,
        price:2000,
        extras:[
            {
                idExtra:1,
                extra:"ไม่จำกัดไมล์",
                price:2000,
                duration:"การเดินทาง"
            },
            {
                idExtra:2,
                extra:"เติมน้ำมันล่วงหน้า",
                price:1000,
                duration:"การเดินทาง"
            },
            {
                idExtra:5,
                extra:"ถุงนอน",
                price:200,
                duration:"วัน"
            },
            {
                idExtra:6,
                extra:"ถังน้ำแข็ง",
                price:200,
                duration:"วัน"
            },
        ],
        status:"Approved",
    },
    {
        id:3,
        carId:1,
        model:"Honda Jazz",
        imageCar:"car5.jpg",
        lenderId:1,
        borrowerId:2,
        delivery:false,
        province:"Bangkok",
        district:"BangSue",
        datelent: "5/10/2022",
        datelenttime:"10:00",
        datereturn: "5/15/2022",
        datereturntime:"22:00",
        duration:2,
        price:2000,
        extras:[
            {
                idExtra:1,
                extra:"ไม่จำกัดไมล์",
                price:2000,
                duration:"การเดินทาง"
            },
            {
                idExtra:2,
                extra:"เติมน้ำมันล่วงหน้า",
                price:1000,
                duration:"การเดินทาง"
            },
            {
                idExtra:5,
                extra:"ถุงนอน",
                price:200,
                duration:"วัน"
            },
            {
                idExtra:6,
                extra:"ถังน้ำแข็ง",
                price:200,
                duration:"วัน"
            },
        ],
        status:"Waiting",
    },
];

module.exports = HistoryLentCars;