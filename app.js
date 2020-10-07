
// DATA.GOV  - some federal election queries ia FEC API

// DOM variables
let candidateJson = [];
let committeeJson = [];
let committeeHtml ='';
let committeeFinanceJson = [];
let committeeFinanceHtml='';
const name = document.getElementById('name');
const namebutton = document.getElementById('namebutton');
const namesearch = document.getElementById('namesearch');
const namediv = document.getElementById('namediv');
const candidateDiv = document.getElementById('candidateDiv');
const financialDiv = document.getElementById('financialDiv');


// url variables
const urlbase = 'https://api.open.fec.gov/v1/'; // base FEC url
const token = '&api_key=UeuRrDCEiiFdnN7HrOMdT7lfYSEq6rL9s4PePW7C'; // 
const candidates = 'candidates/?q='; 

// -------------- FUNCTIONS ------------------- //

//basic fetch function called in event listener on search button
function fetchJson(url) {
    return fetch(url)
        .then(checkStatus)
        .then(data => data.json())
}

//status check on HTTP response for fetch function
function checkStatus(response) {
    if(response.ok) { // read-only property of Responsive (boolean)
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

// provides simple interpolation of candidate search results in one sentence if successful
function candidateHtml(data) {
    candidateJson = data;
    let candidateCard;
    let i=0;
    candidateIndex = candidateJson.results.length-1;
    // destructure the data for the vars
    let {
        name,
        incumbent_challenge_full,
        party_full,
        office,
        state,
        office_full,
        election_districts
    } = candidateJson.results[candidateIndex];

    // flips candidate name into readable order (usually), but military ranks mess it up a bit
    let nameswitch = name.split(',').reverse().join(' ');
    // let namelower = nameswitch.toLowerCase();
    // let namecap = nameswitch.charAt(0).toUpperCase();

    // create the html
    // check to see if senate (S) otherwise House
    if (office === 'S') {
    candidateCard =
    `<p>${nameswitch} is the ${party_full} ${incumbent_challenge_full} in the ${state} ${office_full} race.`;
    }
    else if (office === 'H' && office !== 'P') { // House candidate and not president
    candidateCard = 
    `<p>${nameswitch} is the ${party_full} candidate in the ${state} district ${election_districts} ${office_full} race`;
    }
    // now fill the div
    candidateDiv.innerHTML = candidateCard;
}

// takes the candidate id and does a basic funding committee API search, html created in next function
function candidateCommittee() {
    // create the url from previous api results to search the committee API for chosen candidate's campaign
    let  {candidate_id, office} = candidateJson.results[candidateIndex];
    const committee = `&committee_type=${office}`;
    const candidate = `candidate/${candidate_id}/committees/?`
    const url = urlbase + candidate + token + committee;
    // fetch the data and do stuff
    fetchJson(url)
        .then(candidateCommitteeHtml)
}

// build and display the html from the committee data json, prepare for next api query
function candidateCommitteeHtml(data) {
    // array of all the committee names (sometimes 1, sometimes 10+, not all current races)
    committeeJson = data;
    // iterate through results array to get each committee name and info
    let i = 0;
    while (i<committeeJson.results.length){ // number of committees in array, one iteration per committee
        let {name, cycles, committee_id} = committeeJson.results[i]; // get id, name and active year of committee
        if (cycles.includes(2020)) { // if committee active this year only
        // using the committee id query the financial API to get latest reported disbursement and add to html
        /// this should happen once only for each committee
        const url = urlbase + 'committee/' + committee_id + '/totals/?' + token; // brings up all committees, work in index
        fetchJson(url)
            .then(candidateCommitteeFinancials)
            .then(money => console.log(money)) // <---- THIS LOGS ALL CORRECTLY BUT DOESN'T PUSH TO HTML CORRECTLY!
            // add html to variable - PROBLEM SOMETHING BELOW HERE I THINK.
            committeeHtml += `
            <p>Candidate Committee #${i}: ${name}</p>
            ${committeeFinanceHtml}
            ` 

        } // end if
        i++; // increment while loop
    } // end while loop
    financialDiv.innerHTML = committeeHtml; // fill the div in html with variable
}

// get the total disbursements for last quarter from each committee and display
function candidateCommitteeFinancials(data) {
    committeeFinanceJson = data;
    // most recent report has index of 0 so bind values from that
    let {committee_name, coverage_start_date, coverage_end_date, disbursements} = committeeFinanceJson.results[0];
    // build html
    committeeFinanceHtml = `<p>${committee_name} has raised ${disbursements} between ${coverage_start_date} and ${coverage_end_date}</p>`
    return committeeFinanceHtml;
}



// ------------- EVENT LISTENERS -------------- //
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
})