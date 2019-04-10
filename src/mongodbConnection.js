module.exports = (MongoClient) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect('mongodb://localhost:27017/clubeextra', { useNewUrlParser: true }, function(err, client) {
      if(err) reject(err)
      else resolve(client.db('clubeextra'))
    })
  })
}
