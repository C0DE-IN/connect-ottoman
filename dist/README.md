**connect-ottoman** provides Ottoman session storage for Express. Requires Ottoman >= `2.0.0-beta`.

## Installation

npm:

```sh
npm install redis connect-ottoman express-session express
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

; (async () => {
    const OttomanStore = connectOttoman(session)
    const client = {
      connectionString: 'localhost:8091',
      bucketName: 'example',
      username: 'example',
      password: 'example'
    }
    const store = new OttomanStore({ client })
    const app = createApp(store)
    
    export const createApp = (store: Store) => {
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

    app.listen(3000, () => console.log(`http://localhost:3000`))
  })()
```
