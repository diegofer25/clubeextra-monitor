module.exports = class {
  constructor ({ axios, categories, mongoConnect, formatProductUrl }) {
    this.axios = axios
    this.categories = categories
    this.db = mongoConnect
    this.formatProductUrl = formatProductUrl
  }

  async init () {
    try {
      const app = this
      app.db = await app.db

      const cursor = app.db.collection('products')
      cursor.createIndex({ id: 1 }, { unique: true })

      const count = await cursor.find().count()

      if (!count) await populateDatabase()

      const allProductsIds = await cursor.find({}).toArray()

      const allProductsDetails = await allProductsIds.reduce(async (acc, { id }) => {
        acc = await acc

        const productDetails = await app.getProductDetail(id)
        acc.push(productDetails)
        console.log(`Requisitando detalhes dos produtos: ${acc.length} de ${count}`)

        return acc
      }, [])

      await app.setProductsToDB(allProductsDetails)

    } catch (err) {
      console.error('ERROR: ', err)
    }
    console.log('END')
  }

  async getProductDetail (productId) {
    const { data } = await this.axios(this.formatProductUrl(productId))
    await this.waitTime(100)
    return data.content
  }

  async populateDatabase () {
    const app = this
    return await app.categories.reduce(async (next, { name, subCategory }) => {
      next = await next
      console.log(`Request Categoria: ${name}`)

      const products = await subCategory.reduce(async (list, subcategorie) => {
        list = await list

        const products = await app.requestAllProductsFromCategorieUrl(subcategorie)

        return [ ...list, ...products]
      }, [])

      await app.setProductsToDB(products)

      return next
    }, true)
  }

  async requestAllProductsFromCategorieUrl ({ name, link }) {
    console.log(` - Request Subcategoria: ${name}`)
    var page = 0
    var allProducts = []

    const { totalPages, products } =  await this.requestProductsbyPage(link, page)

    allProducts = products
    page++

    while (page < totalPages) {

      const { products } =  await this.requestProductsbyPage(link, page)
      allProducts = [ ...allProducts, ...products ]
      page++

    }
    return allProducts
  }

  async requestProductsbyPage (url, page) {
    console.log(`Página: ${page + 1}`)
    url = url.replace('?p=', '?p=' + page)

    const { data } = await this.axios(url)
    await this.waitTime(100)

    const { products, totalPages } = data.content
    return {
      products: products.map(({ id, urlDetails }) => {
        return { id, urlDetails }
      }),
      totalPages
    }
  }

  async setProductsToDB (products) {
    return await this.db.collection('products').bulkWrite(
      products.map(product => {
        return {
          updateOne: {
            filter : {
              id: product.id
            },
            update : {
              $set: product
            },
            upsert : true,
          }
        }
      })
    )
  }

  waitTime (time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, time)
    })
  }
}
