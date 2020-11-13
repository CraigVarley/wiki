// DATA.GOV  - some federal election candidate queries via FEC API with wikipedia query for images

// array and string variables
let candidateJson = [];
let committeeJson = [];
let committeeHtml ='';
let namefinal = '';
let wikiJson = [];
let committeeFinanceJson = [];
let occupationJson = [];
let committeeFinanceHtml='';
let candidateId;
let committeeId = new String(); // mutable
let occupationArray = [];
let countOccupationArray = [];
let totalOccupationArray = [];
// DOM variables
const name = document.getElementById('name');
const namebutton = document.getElementById('namebutton');
const namesearch = document.getElementById('namesearch');
const namediv = document.getElementById('namediv');
const candidateDiv = document.getElementById('candidateDiv');
const financialDiv = document.getElementById('financialDiv');
const occupationDiv = document.getElementById('occupationDiv');
const occupationResults = document.getElementById('occupationResults');
const occupationResults2 = document.getElementById('occupationResults2');
const tableBody = document.getElementById('tbody');
const tableCols = document.getElementById('tableCols');
const donationStateResults = document.getElementById('donationStateResults');
// API url variables
const urlbase = 'https://api.open.fec.gov/v1/'; // base FEC url
const wikiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/'; // base wiki for pics of candidates
const token = '&api_key=UeuRrDCEiiFdnN7HrOMdT7lfYSEq6rL9s4PePW7C'; // 
const candidates = 'candidates/?q='; 

// -------------- BASIC FETCH FUNCTIONS ------------------- //

//basic fetch function called in event listener on search button
async function fetchJson(url) {
    return await fetch(url)
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

// --------------- OTHER FUNCTIONS -------------------- //

// v. bothersome formatting of str 'LASTNAME, FIRSTNAME' to 'Firstname Lastname'
// for display and later Wikipedia API search (case sensitive, )
// has problems with military ranks, nicknames, 'Mc's in the 'name' field of the API
// this can mess with the wikipedia url
function nameFormat(name) {
    // console.log(name); // basic name
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
        namefinal = namealmost.replace(',', ''); // remove the  comma
    }
    // console.log(namefinal);
    return namefinal;
}

// // gets the wiki picture for the html
async function getWikiPhoto(name) {
    // format the name for the url
    let wikiname = name.replace(' ', '_'); // gotta have the underscores not spaces
    let url = wikiUrl + wikiname;
    // get the data from the wikipedia API
    await fetchJson(url)
        .then(makePhotoHtml)
        .catch(e => candidateDiv.innerHTML = `
        <p>Can't find some of that person's image. They may not have a Wikipedia page or some middle names I haven't taken into account.</p>
        <p>Try <a href="https://www.fec.gov/data/candidates/?has_raised_funds=true&is_active_candidate=true">FEC Candidate Search</a> if you're sure you have the name right and nothing comes up.</p>
        `)
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
    // get office to check for House, Senates or President
    let {office} = candidateJson.results[candidateIndex];
    // THIS IS UGLY AT THE MOMENT
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
        } else if (office == 'P') { 
            candidateCard = `
            <p>Your candidate is either running or ran for President in their last race. Try entering a Senate or House
            candidate instead. If they're not running for Congress right now, the result will be a primary committee.
            `;
                if (office === 'S') {
                        candidateCard =
                        `<h3><span id="cap">${namefinal}</span></h3>
                        <p>is the ${party_full} ${incumbent_challenge_full} in the ${state} ${office_full} race.</p>
                        `;
                }
    // now fill the div
            }
    candidateDiv.innerHTML = candidateCard;
}

// takes the candidate id and does a basic candidate funding committee API search, html created in next function
async function candidateCommittee() {
    // create the url from previous api results to search the committee API for chosen candidate's campaign
    let  {candidate_id, office} = candidateJson.results[candidateIndex];
    candidateId = candidate_id;
    const committee = `&committee_type=${office}`;
    const candidate = `candidate/${candidate_id}/committees/?`
    const url = urlbase + candidate + token + committee;
    // fetch the data and do stuff
    await fetchJson(url)
        .then(candidateCommitteeHtml)
        .then(committeeDonorByOccupation)
}

// build and display the html from the committee data json, prepare for next api query
async function candidateCommitteeHtml(data) {
    // array of all the committee names (sometimes 1, sometimes 10+, not all current races)
    committeeJson = data;
    // iterate through results array to get each committee name and info
    let i = 0;
    while (i<committeeJson.results.length){ // number of committees in array, one iteration per committee
        let {name, cycles, committee_id} = committeeJson.results[i]; // get id, name and active year of committee
            if (cycles.includes(2020)) { // if committee active this year only
        // using the committee id query the financial API to get latest reported disbursement and add to html
        /// this should happen once only for each committee, create url, get data, find vars and make the html
        const url = urlbase + 'committee/' + committee_id + '/totals/?' + token; // brings up all committees, work in index
        await fetchJson(url)
            .then(candidateCommitteeFinancials)
            .then(money => {
                committeeHtml += `
            <p>${name} ${committee_id}</p>
            ${committeeFinanceHtml}
            `
            financialDiv.innerHTML = committeeHtml;
            })
        } // end if
        i++; // increment while loop
    } // end while loop
    return committeeJson;
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

// gets a list of committee donors by occupation and number for display
async function committeeDonorByOccupation(data) {
    let committeeJsonInOccupationFunc = data;
    let i = 0;
    // this repeats something in candidateCommitteeHtml and could probably be simplified
    while (i<committeeJsonInOccupationFunc.results.length){
        let {committee_id, cycles} = committeeJsonInOccupationFunc.results[i];
        if (cycles.includes(2020)) { // if this year
            // console.log(`Committee id in occupation function: ${committee_id}`);
            // make the url for the occupation search
            let url = `https://api.open.fec.gov/v1/schedules/schedule_a/by_occupation/?&api_key=UeuRrDCEiiFdnN7HrOMdT7lfYSEq6rL9s4PePW7C&committee_id=${committee_id}&sort_nulls_last=false&sort_null_only=false&per_page=100&sort_hide_null=true&cycle=2020`;
            await fetchJson(url)
                .then((data)=>createOccupationArray(data, committee_id))
        } // end if
        i++;
    } // end while loop
}

// this loops through multiple pages of occupation donor then passes page to addPage
async function createOccupationArray(data, committee_id) {
    // data is 100 results, multiple pages
    committeeId = committee_id;
    // iterate through all results and output to html
    for (let i = 0; i<data.pagination.pages; i++) { // page loop
        // new url for new page fetch
        let page = i+1;
        let url = `https://api.open.fec.gov/v1/schedules/schedule_a/by_occupation/?&api_key=UeuRrDCEiiFdnN7HrOMdT7lfYSEq6rL9s4PePW7C&committee_id=${committeeId}&sort_nulls_last=false&sort_null_only=false&per_page=100&sort_hide_null=true&page=${page}&cycle=2020`;
        // console.log(`currrent url for occupation is: ${url}`);
        await fetchJson(url)
            .then((data) => addPage(data));
    } // end of page loop
}

// this creates item-by-item the object array for each new page and fills the occupationArray with select values
function addPage(data) {
    for (let j = 0; j<data.results.length; j++) { // results in page loop
        let {occupation, total, count, committee_id} = data.results[j];
        committeeId = committee_id;
        let occupationTempObject = { // object for storing key/values, note committee_id to sort later
            committee_id:`${committee_id}`,
            occupation:`${occupation}`,
            total:`${total}`,
            count:`${count}`
        };
        occupationArray.push(occupationTempObject) // push to array of occupation objects, will contain all committees info in one array
        } // end of results loop
}

// // creates and adds html for occupation total table
function addOccupationTotalHtml() {
    let occupationTotalInfo= '';
    let occupationArray2 = occupationArray.sort(function (x, y) {
        return x.total - y.total;
    });
    occupationArray2.reverse();
    // table headers, different for each of the 2 tables
    occupationTotalInfo = 
        `
        <h2>Donors By Occupation<br>(Searchable & Sortable)</h2>
        <table id="" class="display compact">
            <thead>
                <tr><th>Total $</th><th>Donor Count</th><th>Donor Occupation</th></tr>
            </thead>
            <tbody>
        `;
    for (let i=0; i<occupationArray2.length; i++) {
        let occupationCount = occupationArray2[i].count;
        let occupationTotal = occupationArray2[i].total;
        let occupationOccupation = occupationArray2[i].occupation;
        // creates the html table rows from the occupation array results 
        occupationTotalInfo +=
        `
        <tr><td>$${occupationTotal}</td><td>${occupationCount}</td><td>${occupationOccupation}</td></tr>
        `;
    }
    occupationResults.innerHTML = occupationTotalInfo; // add to html
    occupationTotalInfo = `</tbody></table>`;
    occupationResults.innerHTML += occupationTotalInfo; // add closing tags for table body
    // datatable formatting add
    $('table.display').DataTable();
    occupationResults.style.display = 'block'; // make it visible
}

async function createStateDonationJson() {
    // candidateId currently filled globally out of candidateCommittee()
    // create state donation url
    let stateDonationUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/by_state/by_candidate/?sort_hide_null=false&candidate_id=${candidateId}&cycle=2020${token}&per_page=60&sort_null_only=false&sort_nulls_last=false&election_full=true&page=1`;
    await fetchJson(stateDonationUrl)
        .then(createStateDonationArray)
        .then(createStateDonationTable)
}

function createStateDonationArray(data) {
    // takes array and simplifies to
    let stateDonationArray=[];
    for (let i=0; i<data.results.length; i++) {
        // just keep the needed values in  a new object and push to array
        let {state_full, count, total} = data.results[i];
        let stateDonationObject = {
            state:`${state_full}`,
            count:`${count}`,
            total:`${total}`
        };
        stateDonationArray.push(stateDonationObject);
    }
    return stateDonationArray;
}

function createStateDonationTable(data) {
    console.log(data)
    let stateDonationInfo = 
        `
        <h2>Donors By State <br>(Searchable & Sortable)</h2>
        <table id="" class="display compact">
            <thead>
                <tr>
                <tr><th>State</th><th>Donor Count</th><th>Total Donor $</th></tr>
                </tr>
            </thead>
            <tbody>
        `;
    for (let i=0; i<data.length; i++) {
        let state = data[i].state;
        let count = data[i].count;
        let total = data[i].total;
        stateDonationInfo +=
        `
        <tr><td>${state}</td><td>${count}</td><td>$${total}</td></tr>
        `
    }
    donationStateResults.innerHTML = stateDonationInfo;
    stateDonationInfo = `</tbody></table>`;
    donationStateResults.innerHTML += stateDonationInfo; // add closing tags for table body
    // datatable formatting add
    $('table.display').DataTable();
    donationStateResults.style.display = 'block';
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
        /*await*/ fetchJson(candidateUrl)
            .then(candidateHtml)
            .then(candidateCommittee)
            .then(createStateDonationJson)
            .then(addOccupationTotalHtml);
    }
    // CLEAR RESULTS
    if (e.target === clearbutton) {
        candidateDiv.innerText = '';
        financialDiv.innerText = '';
        committeeHtml = '';
        namesearch.value = '';
        occupationResults.innerText = '';
        donationStateResults.innerHTML = '';
        occupationArray = [];
        
        }
})