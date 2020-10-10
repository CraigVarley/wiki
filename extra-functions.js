// extra functions that need work

// detailed committee receipts functions

// function candidateCommitteeReceipts() {
//     // url for API query
//     const url1 = `https://api.open.fec.gov/v1/schedules/schedule_a/?two_year_transaction_period=2020&committee_id=${committee_id}&contributor_type=committee&sort=-contribution_receipt_date&${token}`;
//     console.log(url1)
//     fetchJson(url1)
//         .then(candidateCommitteeReceiptsHtml)
// }

// function candidateCommitteeReceiptsHtml(data) {
//     // this starts with 20 results in one page. have to requery to get more by appending the 'last_index' value to the end of the next url
//     receiptsJson = data; // 20 results
//     let {pages} = receiptsJson.pagination; // get the last indexes of this page / get pages for the total count of results
//     let {committee} = receiptsJson.results[0];
//     let i =0; // while count
//     let j = 0; // for count
//     // this for loop iterates from page to page & starts with a JSON page of 20 results
//     for (j=0; j<pages; j++) {
//         // the while loop iterates WITHIN the page of 20 results
//         while (i<receiptsJson.results.length) {
//             let {contributor_name} = receiptsJson.results[i];
//             let l = receiptsJson.results.length; // length of results in case there are none (v. small committees, largely unused, etc.)
//             if (l === 0) {
//                 // very rare
//                 console.log(`${committee.committee_id} has no committee donations.`)
//             } else {
//                 // do something with the individual donation on the page here (make new array)
//                 let html = `<p>${contributor_name}</p>`
//                 console.log(`${committee.committee_id} has ${l*pages} committee donations`); // 20*total pages is (almost) donation totals
//             } // end if
//             i++; // iterate the while loop
//         } // end while loop
//         // still in for loop, now query api for next page
//         let {last_index, last_contribution_receipt_date} = receiptsJson.pagination.last_indexes; // extra api url stuff to go to next page
//         let newIndexUrl = new String(); // mutable string object for url
//         newIndexUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?two_year_transaction_period=2020&committee_id=${committee.committee_id}&contributor_type=committee&sort=-contribution_receipt_date&${token}&last_index=${last_index}&last_contribution_receipt_date=${last_contribution_receipt_date}`;
//         fetchJson(newIndexUrl)
//         .then(json => {receiptsJson = json;})
//         console.log(`receiptsJson hopefully: ${receiptsJson}`)
//     } // end for loop
// //vars= contributor.state contributor_name contribution_receipt_amount
// }
