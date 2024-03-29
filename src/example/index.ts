import  OttomanStore  from '../../dist'
import express from 'express'
import session, { Store } from 'express-session'
import { Ottoman } from 'ottoman'

  ; (async () => {
    const client = new Ottoman()
    client.connect({
      connectionString: 'localhost:8091',
      bucketName: 'example',
      username: 'example',
      password: 'someSecret'
    })
    const store = new OttomanStore({ client })

    const createApp = (store: Store) => {
      const app = express()
      app.use(express.json())
      app.use(session({
        ...{
          secret: 'example',
          name: 'sid',
          cookie: {
            maxAge: 180000,
            secure: false,
            sameSite: true
          },
          rolling: true,
          resave: false,
          saveUninitialized: false
        },
        store
      }))
      return app
    }
    const app = createApp(store)

    app.listen(3000, () => console.log(`http://localhost:3000`))
  })()