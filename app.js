// using apis for fun + tests //

// trefle.io - plants
// const baseurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/v1/distributions/'
// const place = 'antarctica'; // lower case
// const token = '/plants?token='; // add token at end
// const search = '';
// const url = baseurl + place + token;


//basic fetch function
function fetchJson(url,) {
    return fetch(url)
        .then(checkStatus)
        .then(data => data.json())
        .then(data=>console.log(data))
}

// call fetch and fill the div with the results
fetchJson(url)
    .catch(error => console.log('Looks like there was an error', error))

// -------------- RELATED FUNCTIONS ---------- //
//status check on HTTP response for fetch function
function checkStatus(response) {
    if(response.ok) { // read-only property of Responsive (boolean)
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}