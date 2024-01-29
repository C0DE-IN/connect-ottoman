**connect-ottoman** provides Ottoman session storage for Express. Requires Ottoman >= `2.0.0-beta`.



## Installation

npm:

```sh
npm install connect-ottoman express-session express
```

Yarn:

```sh
yarn add connect-ottoman express-session express
```

## API

```ts
import connectOttoman from 'connect-ottoman'
import express from 'express'
import session, { Store } from 'express-session'
import { Ottoman } from 'ottoman'

  ; (async () => {
    const OttomanStore = connectOttoman(session)
    const client = new Ottoman()
    client.connect({
      connectionString: 'localhost:8091',
      bucketName: 'example',
      username: 'example',
      password: 'someSecret'
    })

    //Except client other options are optional
    // scopeName:string
    // collectionName:string
    // sessionSchema:Schema
    // modelName: string
    // prefix:string
    // maxExpiry:number


    const store = new OttomanStore({ client, scopeName, collectionName, sessionSchema, modelName, prefix, maxExpiry })
    
    
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
```

**document expiration** collection must be created with ttl to avail document expiration`.


