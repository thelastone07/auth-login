# Tutorial

Every other website that deals with user information will has a login system. Although simple, building will teach you how to write backend apis, connect those apis to frontend and create isloated components that can be easily debuged. All in all, a good starter practice. 

I will not include how to install and set up different environment and start with the code. 

> Note : Ensure your json files have same module system. Ex - ESM or CommonJS

> Note : If you know Javascript, Typescript comes easier. Type related errors in JS is handled during runtime while TS handles them during compile time. 


## Backend

We need a server and a database for our backend to be complete. For my case, I use express in Typescript and PostgreSQL. 

Imagine this, you are a customer at a resturant. Let's say there are multiple chefs for different cuisines. Your main goal is to get some food. Waiter gets your order. The kitchen assigns the dish to a chef. Chef prepares it and you are served the food. If you understand this, I'm happy to say you understand how backend works.

Putting this into technical terms, frontend sends request (customer orders). The request passes through some middleware(cuisine identification and chef assignment), then it is routed (goes to the chef). The API (chef) prepares a response (food) and sends it back to you. 

We need 4 things for a complete API endpoint. Let's dicuss them: 

### Clients


```js
const prisma = new PrismaClient();
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
```

You need some agents or workers to be the point of contact, somebody to talk with the respective departments. These departments are the database, your backend server and google OAuth.

### Schema

```js
const loginSchema = Joi.object({
    username : Joi.string().required(),
    password : Joi.string().required(),
});
```

Ever been to a bank? Fill the form haunts everyone. It shall haunt you here as well(and your users). Ensuring that your data follows a schema helps you follow a strict rule. This rule helps reduce errors and future-proof your work against your bad memory.

Joi is just a helper tool makes it easier to validate the type. You can do this kind of magic with it.

```typescript
    username: Joi.string().alphanum().min(3).max(30).required()
```

### Action and Path

```router.post("/path", do something);``` 

This tells the server whenever frontend calls here - *do something*. Sometimes, before doing something you might want to do *that*. We can do *that* by -

```router.post("/path", do that, then do something)```

One more technical detail to not is we are using ```POST```. Whenever we want to send data to the server we use ```POST```. Other cases include ```GET```, ```UPDATE``` or ```DELETE```. 

### Logic 

We have our 3 essential things now. Clients who can talk to various departments(services). Schemas for validation. The path using which the frontend can contact. Now, we can define the *do something* part. 

For a login system, the something looks like:

![Login Code implementation](image-1.png)


1. Request is received as a paramter. This would be a good time to discuss what data from frontend looks like. We have a header and a body (just like HTML). Header defines what kind of data is in body and it may also contain some easter eggs like ```token```.

    ```json
    Content-Type: application/json
    Authorization: Bearer myPrecious

    {
    "name": "DJ",
    "age": 22,
    }
    ```
2. Schema Validation
    ```typescript
    const {error, value} = loginSchema.validate
    ```
    Value contains the in the form as declared in the schema.
3. Checking for exisiting user
    ```TS
    const user = await prisma.user.findFirst({
                where : {
                    OR : [{username}, 
                    {email : username}],
                },
        );

    if (!user) {
        return res.status(401).json({error : "Invalid username/email"});
     }
    ```
    We use the database agent to find using username or email. The logic in frontend allows user to enter either username or email to login. ```{email : username}``` ensures the search works in either case. If the user doesn't exist, the login process wraps up.

    ```res``` is the ```Response``` object that can be used to send a *response* to the frontend. Status codes have been standardized. You can look them up [here](https://status.js.org/). 

4. As we are dealing with login, there is a password coupled with a username. Password is stored in the form hash to prevent damages to user in case of a password leak. 
Passwords are hashed during registration using
```const hashedPassword = await bcrypt.hash(password,10);```. 
    ```typescript
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({error : "Invalid Password"});
    }
    ```

5. Next we create token. Token is kind of an entry key to various resources that your website has to offer. To ensure no one can re-create the same token, we keep a secret key with us. You can give it some payload like user information and other metadata. 

    ![JWT image](debugger.webp)         

    *Image taken from [here](https://www.jwt.io/introduction#what-is-json-web-token-structure)*

    As you can see, the Jwt based signature uses SHA256 type encryption. To brute force and decode this token you would need a whopping [10 trillion years](https://youtu.be/S9JGmA5_unY?si=Ay_U_SfTB0e2a8_I).

    ```TS
    const token = jwt.sign(
            {userId : user.id},
            process.env.JWT_SECRET!,
            {expiresIn : "1h"}
        );

        const session = await prisma.session.create({
            data : {
                userId : user.id,
                token,
                expiresAt : new Date(Date.now() + 1000*60*60),
                createdAt : new Date(Date.now()),
            }
        });
    ```
    You can create a JWT secret key by running this. 
    ```
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 
    ``` 
6. We send our response using ```res```
    ```TS
    const {passwordHash, ...safeUser} = user;

        return res.json({
            message : "Login Successful",
            token,
            user : safeUser,
            sessionId : session.id,
        });
    ```


> Note : Route parameters and query paramters are essential for other use cases, especially GET.

Now, we have a complete login API endpoint which could be hit using a frontend request. Look at the whole code [here](./backend/src/routes/authRoutes.ts).

### server.js

The last part of the backend is exposing the server at a port. We create an express object that helps with the networking. You need not worry about low level networking principles (TCP, UDP, handshakes) that happen within these three lines of code. Then, we use the endpoint we defined for *login* via */auth*. Then the server keeps listening for requests at *PORT*.

```TS
const app = express();

app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```




## Database

Before dealing with how our frontend could connect with our backend, let's define how our database can be constructed. 

Let's have a look at what ```USER``` looks like in schema.prisma

```prisma
model User {
  id String @id @default(cuid())
  username String @unique 
  email String @unique
  passwordHash String?
  provider String @default("local") 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions Session[]
}
```

The various ```@unique```, ```@id``` and ```@default``` are called attributes, which we associate our fields with. We already must have defined our schema when dealing with *POST* *request* data. The ```prisma.schema``` is the superset of the previous schema. ```Prisma``` is a higher level language that helps to handle SQL queries better. The way to talk with your database is still SQL.

1. Open your pgAdmin (Install PostgreSQL if you haven't [here](https://www.postgresql.org/download/)).
2. Click on Add New Server.
3. On ```connection``` tab set your port number.
4. Edit your ```.env``` to include your databse url, which contains authentication data like your username and password.
5. Add new schema to ```prisma/schema.prisma```. Check [here](backend\prisma\schema.prisma) to find complete schema.
6. Run ```npx prisma migrate dev``` for your devlopement server to create the tables in your database. 

## Frontend

Now, to wrap things up. I am using *vite* as my build tool for a *React + TS* environment. After setting up your respective environment, we can proceed to check how to communicate with the backend server.

We shall create three components to help us create a login system that sends data to the backend. An auth context where is declared. A TS file to deal with endpoint logic and the login-form file.

### AuthService.ts

We create a login function that fetches response by calling ```/login``` endpoint of the backend and handles error if there are any. 

```TS
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password :  password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  return res.json();
}
```
Remember, we needed username/email in our loginSchema. Defining the schema helps us to handle the data better in frontend. We can call *login* without worrying about the endpoint in the future.

### AuthContext.tsx

Why create AuthContext? Let's implement this first, then we can answer some of its usability.

```TS
const login = async (email : string, password : string) => {
        const data = await authService.login(email, password)
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token_DJ123",data.token);
        localStorage.setItem("user_DJ123", JSON.stringify(data.user));
    };
```
*login* calls authService's *login* to validate the data. (The error handling is being done in the loginform). We are setting user and token. This token can be used to access resources of the website that was unavailable prior to login. Repeated logins is not required. If token is available, the user is authenticated. 

Why use as API wrapper? Simple answer : without it, the children, grand children (I wonder if they are called so), whoever require the props (*login* function) has to be passed on by their parents. In this case, any children can access it directly. Imagine this, instead it being a family secret that is passed through generations vs the secret is noted down on some journal, so any family member can read it. 

### LoginForm.js

This is the most simplest part. All we have to do is create a form and collect data from the user and call *login* from the AuthContext. 

```TS
async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
        await login(username, password);
        setSuccess("Successful");
        setTimeout(() => {
            navigate('/');
        }, 1000);
    }
    catch (err : any) {
        setSuccess(err.error || "Invalid credentials")
    }
}
```

When form event is triggered, we navigate back to home page on successful login. Any error message from backend is handled here. User can see "Invalid credentials" as other errors are explicity handled. 

## Conclusion

Once you have understood how the logic is sewn together to make a system. Add other parts (registration, google login, reddit login) to it. A good way to use AI for this purpose is to ask it to find possible imporvements in your code logic without giving you the code. I use this when I am starting out with a new thing. After understanding, I happily use generated code for productivity purposes.

If you like or dislike any part, please let me know through my socials in my profile. Thank you very much. 














