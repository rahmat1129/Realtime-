const http = require('http');
const url = require('url');
const fs = require('fs');
const net = require('net');

// Function to get the IP address of the machine
function getIpAddress() {
    const os = require('os');
    const ifaces = os.networkInterfaces();
    let ipAddress = '';
    Object.keys(ifaces).forEach(function(ifname) {
        ifaces[ifname].forEach(function(iface) {
            if ('IPv4' === iface.family && !iface.internal) {
                ipAddress = iface.address;
            }
        });
    });
    return ipAddress;
}

// Global variables
const connectedUsers = [];
const messages = [];

// HTTP request handler function
function requestHandler(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    if (req.method === 'GET') {
        if (pathName === '/') {
            fs.readFile('index.html', (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                }
            });
        } else if (pathName === '/messages') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(messages));
        } else if (pathName === '/users') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(connectedUsers));
        } else {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    } else if (req.method === 'POST') {
        if (pathName === '/messages') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // convert Buffer to string
            });
            req.on('end', () => {
                const postParams = new URLSearchParams(body);
                const message = postParams.get('message');
                if (message) {
                    messages.push(message);
                    sendMessagesUpdate();
                    res.writeHead(200);
                    res.end('Message sent successfully');
                } else {
                    res.writeHead(400);
                    res.end('Message cannot be empty');
                }
            });
        } else {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    }
}

// Function to send message update to all connected users
function sendMessagesUpdate() {
    const messageData = JSON.stringify(messages);
    connectedUsers.forEach(user => {
        try {
            const client = new net.Socket();
            client.connect(8001, user, () => {
                client.write(messageData);
                client.end();
            });
        } catch (err) {
            console.error(err);
        }
    });
}

// HTTP server setup
const server = http.createServer(requestHandler);

// Function to start the server
function startServer(port) {
    server.listen(port, () => {
        console.log(`Server started at ${getIpAddress()}:${port}`);
    });
}

// Function to generate the URL
function generateUrl(port) {
    const ipAddress = getIpAddress();
    return `http://${ipAddress}:${port}`;
}

// Main function
function main() {
    const port = 8000; // Change this port number if needed
    const url = generateUrl(port);
    console.log("Share this URL with your friend to connect: ", url);
    startServer(port);
}

if (require.main === module) {
    main();
}
