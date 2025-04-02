const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const { CognitoIdentityServiceProvider } = require('aws-sdk');
const jwt = require('jsonwebtoken');
const serverless = require('serverless-http');
const jwksClient = require('jwks-client')

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// AWS Configuration
const REGION = process.env.REGION
AWS.config.update({ region: `${REGION}` });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cognito = new CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const TODOS_TABLE = 'Todos';
const jwksUrl = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
const client = jwksClient({jwksUri: jwksUrl,});

// Middleware to verify JWT
function verifyToken(req, res, next) {
    let token;
    const getKey = (header, callback) => {
        client.getSigningKey(header.kid, (err, key) => {
          if (err) {
            return callback(err);
          }
          const signingKey = key.publicKey;
          callback(null, signingKey);
        });
    };
    
    if(req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No Bearer token provided.' });
    }

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token.', data: err });
        }
        req.user = {
            username: decoded['cognito:username'],
        };
      next();
    });
}

// Register User
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const params = {
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
    };

    try {
        await cognito.signUp(params).promise();
        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Authenticate User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();
        res.json({ token: data.AuthenticationResult.IdToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add a Todo
app.post('/todo', verifyToken, async (req, res) => {
    const { content, due_date, created_at } = req.body;
    const username = req.user['username'];
    
    const params = {
        TableName: TODOS_TABLE,
        Item: {
            id: Date.now().toString(),
            username,
            content,
            timestamp: new Date().toISOString(),
            due_date: due_date || null,  // Store the due date if provided
            created_at: created_at || null,  // Store the created date if provided
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.json({ message: 'Todo added!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// delete todo
app.delete('/todo/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const params = {
            TableName: TODOS_TABLE,
            Key: { id }
        };
        
        await dynamoDB.delete(params).promise();
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update todo completion status
app.put('/todo/:id/complete', verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        // First get the current todo
        const getParams = {
            TableName: TODOS_TABLE,
            Key: { id }
        };
        const todo = await dynamoDB.get(getParams).promise();
        
        if (!todo.Item) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        // Toggle completion status
        const updateParams = {
            TableName: TODOS_TABLE,
            Key: { id },
            UpdateExpression: 'SET completed = :completed',
            ExpressionAttributeValues: {
                ':completed': !todo.Item.completed
            },
            ReturnValues: 'ALL_NEW'
        };
        
        const result = await dynamoDB.update(updateParams).promise();
        res.json(result.Attributes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Todos (Secured)
app.get('/todos', verifyToken, async (req, res) => {
    const username = req.user['username'];
    const params = {
        TableName: TODOS_TABLE,
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: { ':username': username },
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        // Sort todos by timestamp (newest first)
        const sortedTodos = data.Items.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        res.json(sortedTodos);
    } catch (error) {
        res.status(500).json({ error: error.message, user: username });
    }
});


const handler = serverless(app);

/*
const startServer = async () => {
    app.listen(3000, () => {
      console.log("listening on port 3000!");
    });
}

startServer();
*/

module.exports.handler = (event, context, callback) => {
    const response = handler(event, context, callback);
    return response;
};