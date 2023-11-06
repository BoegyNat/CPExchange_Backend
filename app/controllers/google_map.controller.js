exports.getLatLngPlace = async (req,res) => {
    try {
        let key = req.params.key.trim();
        var axios = require('axios');
        var config = {
          method: 'get',
          url: encodeURI(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.params.placeFind}&inputtype=textquery&fields=formatted_address,name,geometry&key=${key}`)
        };
        await axios(config)
        .then(function (response) {
            res.status(200).send(response.data);
        })
        .catch(function (error) {
            res.status(500).send({ message: error.message });
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};