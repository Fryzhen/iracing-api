require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let isAuthenticated = false;
let loginCookies;

const auth = async () => {
    console.log("Authentification en cours ...");
    const password = process.env.ENCODED_PASSWORD;
    const email = process.env.EMAIL;
    await fetch('https://members-ng.iracing.com/auth', {
        method: "POST",
        body: JSON.stringify({email: email, password: password}),
        credentials: 'include',
        headers: {'Accept': '*/*', "Content-type": "application/json"}
    })
        .then(r => {
            loginCookies = parseCookies(r);
            isAuthenticated = true;
            console.log("Authentication successful");
        })
}
const parseCookies = (response) => {
    console.log(response.headers);
    const raw = response.headers.get('set-cookie'); // Fetch API does not support multiple 'set-cookie' headers directly
    if (!raw) {
        return '';
    }
    return raw.split(',').map((entry) => {
        return entry.split(';')[0];
    }).join(';');
}

app.get('/', (req, res) => {
    res.status(200).json("bienvenue sur l'api iracing de fryzhen")
})
app.get('/:first/:second', (req, res) => {
    console.log(req.path);
    if (isAuthenticated) {
        let url = "https://members-ng.iracing.com/data" + req.path + "?";
        for (let key in req.query) {
            let value = req.query[key];
            url += key + "=" + value + "&";
        }
        console.log(url);
        fetch(url, {
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
    }
    else {
        auth().then(() => {
            handleRequest(req, res)
        })
    }
});

auth().then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}).catch(error => {
    console.log(error);
})
