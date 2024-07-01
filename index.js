const express = require('express');
const axios = require('axios');
const app = express();

const IP_GEOLOCATION_API_KEY = process.env.IP_GEOLOCATION_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

app.set('trust proxy', true);

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Handle local IP addresses
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
        clientIp = '8.8.8.8'; // Use a default IP address for testing, such as Google's public DNS server
    }

    try {
        // Get location data from IP Geolocation API
        const geoResponse = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IP_GEOLOCATION_API_KEY}&ip=${clientIp}`);
        const location = geoResponse.data.city || 'Unknown Location';

        // Get weather data from WeatherAPI
        const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${location}`);
        const temperature = weatherResponse.data.current.temp_c;

        // Construct the response
        const response = {
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
        };

        // Set the Content-Type header to application/json
        res.setHeader('Content-Type', 'application/json');
       // Send the response with 2-space indentation for readability
        res.send(JSON.stringify(response, null, 2));

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
        res.status(500).json({ error: 'Internal Server Error', details: error.message});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
