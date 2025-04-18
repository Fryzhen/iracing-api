require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

let isAuthenticated = false;
let loginCookies;

const auth = async () => {
    const password = process.env.ENCODED_PASSWORD;
    const email = process.env.EMAIL;
    await fetch('https://members-ng.iracing.com/auth', {
        method: "POST",
        body: JSON.stringify({email: email, password: password}),
        credentials: 'include',
        headers: {'Accept': '*/*', "Content-type": "application/json"}
    }).then(r => {
        loginCookies = parseCookies(r);
        isAuthenticated = true;
    })
}
const parseCookies = (response) => {
    const raw = response.headers.get('set-cookie');
    if (!raw) {
        return '';
    }
    return raw.split(',').map((entry) => {
        return entry.split(';')[0];
    }).join(';');
}

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome !",
        documentation: "https://members-ng.iracing.com/data/doc",
        howToUse: "This domain name must be used like 'https://members-ng.iracing.com/data/' "
    });
})
app.get('/:first/:second', (req, res) => {
    fetch("https://members-ng.iracing.com/data" + req.url, {
        method: 'get', headers: {'Accept': 'application/json', 'cookie': loginCookies}, cache: "no-store"
    }).then((response) => {
        if (response.status >= 404) {
            throw "Not Found";
        }
        else if (response.status >= 400) {
            throw response.statusText;
        }
        response.json().then(data => {
            fetch(data.link).then((response) => {
                response.json().then((data) => {
                    res.status(200).json(data);
                })
            }).catch(error => {
                res.status(500).json(error);
            })
        })
    }).catch(error => {
        res.status(500).json(error);
    })
});

auth().then(() => {
    app.listen(port);
}).catch(error => {
    console.log(error);
})
