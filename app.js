// using trefle.io api for fun //

const baseurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/v1/distributions/'
const place = 'antarctica'; // lower case
const token = '/plants?token=AkMqGCYLEYjgBeyV7GqoCkxcbN2l9At_nGWfQwimLjw';
const search = '';
const url = baseurl + place + token;

// let myHeaders = new Headers({
//     'Access-Control-Allow-Origin':'*'
// });

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