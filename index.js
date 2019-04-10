const App = require('./src/app')
const MongoClient = require("mongodb").MongoClient
const mongoConnect = require('./src/mongodbConnection')

const axiosOptions = {
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'betaFeatures': 'true',
    'Origin': 'https://www.clubeextra.com.br',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
  }
}

const dependencies = {
  mongoConnect: mongoConnect(MongoClient),
  axios: require('axios').create(axiosOptions),
  categories: require('./categories').categories,
  formatProductUrl: require('./format-product-url')
}

new App(dependencies).init()
