const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const app = express();
const port = 3000;


const cors = require('cors');
app.use(cors());


//MongoDB connection
mongoose.connect('mongodb+srv://yokesh:Yokesh@guvib46.pmyuwfm.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Create a schema and model
const productSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  price: Number,
  finalPrice: Number
});

const Product = mongoose.model('Product', productSchema);

// Scrape data from Flipkart
app.get('/scrape', async (req, res) => {
  try {
    // Make HTTP request to Flipkart
    const response = await axios.get('https://www.flipkart.com/samsung-galaxy-f54-5g-stardust-silver-256-gb/p/itme2f1ad33150df?pid=MOBGPN55PEBUKZX2&param=887&otracker=hp_bannerads_2_2.bannerAdCard.BANNERADS_A_B9SV1MMR4ZQI');

    // Parse the HTML response using Cheerio
    const $ = cheerio.load(response.data);

    // Extract the required data
    const title = $('._35KyD6').text();
    const rating = parseFloat($('._3LWZlK').text());
    const price = parseFloat($('._30jeq3._1_WHN1').text().replace('₹', '').replace(',', ''));
    const finalPrice = parseFloat($('._3I9_wc._2p6lqe').text().replace('₹', '').replace(',', ''));

    const product = new Product({
      title,
      rating,
      price,
      finalPrice
    });

    // Save the product to the db
    await product.save();

    // Send the product object as the response
    res.json(product);
  } catch (error) {
    console.error('Error scraping data', error);
    res.status(500).send('Error scraping data');
  }
});

app.post('/scrape', async (req, res) => {
  try {
    // Extract the product data from the request body
    const { title, rating, price, finalPrice } = req.body;

    // Create a new product instance using the Product model
    const product = new Product({
      title,
      rating,
      price,
      finalPrice
    });

    // Save the product to the database
    await product.save();

    // Send the product object as the response
    res.json(product);
  } catch (error) {
    console.error('Error creating product', error);
    res.status(500).send('Error creating product');
  }
});
