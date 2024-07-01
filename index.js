const express = require('express');
const axios = require('axios');
const app = express();

const IP_GEOLOCATION_API_KEY = '3c157014abe54a2fa062bf9ded9f4c5c';
const WEATHERAPI_KEY = '1f659253b7024c0885602159240107';

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // Get location data from IP Geolocation API
        const geoResponse = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IP_GEOLOCATION_API_KEY}&ip=${clientIp}`);
        const location = geoResponse.data.city || 'Unknown Location';

        // Get weather data from WeatherAPI
        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${location}`);
        const temperature = weatherResponse.data.current.temp_c;

        // Construct the response
        const response = {
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
