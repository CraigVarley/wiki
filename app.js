
// DATA.GOV  - some federal election candidate queries via FEC API with wiki query for images

// DOM variables
let candidateJson = [];
let committeeJson = [];
let committeeHtml ='';
let namefinal = '';
let wikiJson = [];
let committeeFinanceJson = [];
let receiptsJson=[];
let committeeFinanceHtml='';
let committeeId='';
const name = document.getElementById('name');
const namebutton = document.getElementById('namebutton');
const namesearch = document.getElementById('namesearch');
const namediv = document.getElementById('namediv');
const candidateDiv = document.getElementById('candidateDiv');
const financialDiv = document.getElementById('financialDiv');


// url variables
const urlbase = 'https://api.open.fec.gov/v1/'; // base FEC url
const wikiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/'; // base wiki for pics of candidates
const token = '&api_key=UeuRrDCEiiFdnN7HrOMdT7lfYSEq6rL9s4PePW7C'; // 
const candidates = 'candidates/?q='; 

// -------------- BASIC FETCH FUNCTIONS ------------------- //

//basic fetch function called in event listener on search button
function fetchJson(url) {
    return fetch(url)
        .then(checkStatus)
        .then(data => data.json())
        .catch(e => candidateDiv.innerHTML = `<p>Can't find some of that person's info or photograph. Clear and try again.</p>`)
}

//status check on HTTP response for fetch function
function checkStatus(response) {
    if(response.ok) { // read-only property of Responsive (boolean)
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

// --------------- OTHER FUNCTIONS -------------------- //

// v. bothersome formatting of str 'LASTNAME, FIRSTNAME' to 'Firstname Lastname'
// for display and later Wikipedia API search (case sensitive, )
// has problems with military ranks, nicknames, 'Mc's in the 'name' field of the API
function nameFormat(name) {
    console.log(name); // basic name
    let newname = name.split(' ').reverse(); // turn str into new array and flip it
    let namearray = [];
    for (let item of newname) {
        item = item.toLowerCase(); // all lower case
        item = item.charAt(0).toUpperCase() + item.substr(1); // so can capitalize initial of each item
        // caps the letter after a hyphen
        item = item.replace(/(^|[\s-])\S/g, function (match) {
            return match.toUpperCase();
        });
        // push to new array
        namearray.push(item); // put in new array
        // if middle initial, remove the initial, Wikipedia doesn't need it
        if (item.includes('.') || (item.length === 1)) {namearray.pop(item)};
        // if hyphenated, cap the next letter (like Ocasio-Cortez)
        namealmost = namearray.join(' '); // join into new formatted str
        namefinal = namealmost.replace(',', ''); // remove the bloody comma
    }
    return namefinal;
}

// // gets the wiki picture for the html
function getWikiPhoto(name) {
    // format the name for the url
    let wikiname = name.replace(' ', '_'); // gotta have the underscores not spaces
    let url = wikiUrl + wikiname;
    // get the data from the wikipedia API
    fetchJson(url)
        .then(makePhotoHtml)
};

// create html from the wikipedia API thumbnail image and return
function makePhotoHtml(data) {
    wikiJson = data;
    let {source} = wikiJson.thumbnail;
    const section = document.createElement('div');
    candidateDiv.appendChild(section);
    section.innerHTML = `<img src=${source}><h4>2020 Financial Committees</h4>`;
}

// provides simple interpolation of candidate search results in one sentence if successful
// candidates can be Senate or House, but not President, so if President in results, go to previous fundraiser for 2020
function candidateHtml(data) {
    candidateJson = data;
    let candidateCard;
    let i=0;
    candidateIndex = candidateJson.results.length-1;
    // ghet office to check for House, Senates or President
    let {office} = candidateJson.results[candidateIndex];
    // THIS IS VERY UGLY
    // if last race Senate: fill html, if last race House: fill html, if last race lost President:
    // look for last campaign and fill that (H or S)
    if (office === 'S') {
        let {
            name,
            incumbent_challenge_full,
            party_full,
            office,
            state,
            office_full,
            district
        } = candidateJson.results[candidateIndex];
        // flips candidate name into readable order
        nameFormat(name);
        //get the wikipedia picture from their API
        getWikiPhoto(namefinal);
        candidateCard =
        `<h3><span id="cap">${namefinal}</span></h3>
        <p>is the ${party_full} ${incumbent_challenge_full} in the ${state} ${office_full} race.</p>
        `;
        } else if (office === 'H') {
            let {
                name,
                incumbent_challenge_full,
                party_full,
                office,
                state,
                office_full,
                district
            } = candidateJson.results[candidateIndex];
            // flips candidate name into readable order
            nameFormat(name);
            //get the wikipedia picture from their API
            getWikiPhoto(namefinal);
            candidateCard = 
        `<h3>${namefinal}</h3><p>is the ${party_full} candidate in the ${state} district ${district} ${office_full} race.</p>`;
        } else if (office == 'P') { // House candidate and not president
            let {           
                name,
                incumbent_challenge_full,
                party_full,
                office,
                state,
                office_full,
                district
            } = candidateJson.results[candidateIndex-1];
            // flips candidate name into readable order
            nameFormat(name);
            //get the wikipedia picture from their API
            getWikiPhoto(namefinal);
            if (office === 'S') {
                    candidateCard =
                    `<h3><span id="cap">${namefinal}</span></h3>
                    <p>is the ${party_full} ${incumbent_challenge_full} in the ${state} ${office_full} race.</p>
                    `;
                    }
            else if (office === 'H') {
                    candidateCard = 
                    `
                    <h3>${namefinal}</h3><p>is the ${party_full} candidate in the ${state} district ${district} ${office_full} race.</p>
                    `;
                }
            }
    // now fill the div
    candidateDiv.innerHTML = candidateCard;
}

// takes the candidate id and does a basic candidate funding committee API search, html created in next function
function candidateCommittee() {
    // create the url from previous api results to search the committee API for chosen candidate's campaign
    let  {candidate_id, office} = candidateJson.results[candidateIndex];
    const committee = `&committee_type=${office}`;
    const candidate = `candidate/${candidate_id}/committees/?`
    const url = urlbase + candidate + token + committee;
    // fetch the data and do stuff
    fetchJson(url)
        .then(candidateCommitteeHtml)
        .then(candidateCommitteeReceipts)

}

// build and display the html from the committee data json, prepare for next api query
function candidateCommitteeHtml(data) {
    // array of all the committee names (sometimes 1, sometimes 10+, not all current races)
    committeeJson = data;
    // iterate through results array to get each committee name and info
    let i = 0;
    while (i<committeeJson.results.length){ // number of committees in array, one iteration per committee
        let {name, cycles, committee_id} = committeeJson.results[i]; // get id, name and active year of committee
        committeeId = committee_id; // need this global for the receipts query
        if (cycles.includes(2020)) { // if committee active this year only
        // using the committee id query the financial API to get latest reported disbursement and add to html
        /// this should happen once only for each committee, create url, get data, find vars and make the html
        const url = urlbase + 'committee/' + committee_id + '/totals/?' + token; // brings up all committees, work in index
        fetchJson(url)
            .then(candidateCommitteeFinancials)
            .then(money => {
                committeeHtml += `
            <p>${name}</p>
            ${committeeFinanceHtml}
            `
            financialDiv.innerHTML = committeeHtml;
            })
        } // end if
        i++; // increment while loop
    } // end while loop
}

// get the total disbursements for last quarter from each committee and display
function candidateCommitteeFinancials(data) {
    committeeFinanceJson = data;
    // most recent report has index of 0 so bind values from that
    let {committee_name, coverage_start_date, coverage_end_date, disbursements} = committeeFinanceJson.results[0];
    // format the disbursement with commas for ease of reading
    let dollars = disbursements.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // trim the dates for ease of reading
    let coverageStartFormat = coverage_start_date.substr(0,10);
    let coverageEndFormat = coverage_end_date.substr(0,10);
    // build html
    committeeFinanceHtml = `<p id="committeeName">${committee_name} has spent $${dollars} between ${coverageStartFormat} and ${coverageEndFormat}</p>`
    return committeeFinanceHtml;
}

function candidateCommitteeReceipts() {
    // url for API query
    const urlprefix = `schedules/schedule_a/?two_year_transaction_period=2020&committee_id=`;
    const urlreceipt = `&contributor_type=committee&sort=-contribution_receipt_date&`;
    const url = urlbase + urlprefix + committeeId + urlreceipt + token + '&sort_null_only=false&per_page=20&sort_hide_null=false';
    console.log(url);
    fetch(url)
        .then(candidateCommitteeReceiptsHtml)
}

function candidateCommitteeReceiptsHtml(data) {
    receiptsJson = data;
    // console.log(`Receipts JSON length= ${receiptsJson.results.length}`)
    // receiptsJson.forEach(item => {
    //     let {
    //         contributor_name,
    //         contribution_receipt_amount
    //     } = receiptsJson;
    // })
    // console.log(contributor_name)
    //vars= contributor.state contributor_name contribution_receipt_amount
}


// ------------- EVENT LISTENERS -------------- //

// SEARCH FOR CANDIDATE //
namediv.addEventListener('click', (e) => {
    if (e.target === namebutton) {
        // get candidate name from input field
        const candName = namesearch.value;
        //make candidate search url
        const candidateUrl = urlbase + candidates + candName + token;
        // get it, save it as 
        fetchJson(candidateUrl)
            .then(candidateHtml)
            .then(candidateCommittee)
    }
    // CLEAR RESULTS
    if (e.target === clearbutton) {
        candidateDiv.innerHTML = '';
        financialDiv.innerHTML = '';
        namesearch.value = '';
        committeeHtml = ''; 

    }
})

