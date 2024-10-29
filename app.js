/* Created by George Holman - Student ID: 1580967 */

// Function to parse XML data into a JavaScript object (DOM)
function parseXML(xmlString) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "application/xml");
    return xmlDoc;
}


function fetchAndProcessXML() {
    fetch('XML/areas.xml') 
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(data => {
            let xmlData = parseXML(data);

            if (xmlData.getElementsByTagName("parsererror").length > 0) {
                console.error("Error parsing XML:", xmlData.getElementsByTagName("parsererror")[0].textContent);
                return;
            }

            setupBookingForm(xmlData);
        })
        .catch(error => console.error("Error fetching or processing XML:", error));
}

function setupBookingForm(xmlData) {
    let areas = xmlData.getElementsByTagName("area");
    let costData = [];
    let statusData = [];
    let capacityData = [];

    let todayDate = new Date();
    checkIn.value = todayDate.toISOString().substring(0, 10);

    todayDate.setDate(todayDate.getDate() + 1);
    checkOut.value = todayDate.toISOString().substring(0, 10);
    
    userCapacity.value = 0;

    for (let i = 0; i < areas.length; i++) {
        let currentArea = document.getElementById("ra-" + (i+1));
        let currentAreaPopup = document.getElementById("popup" + (i+1));
        let popupContent = currentAreaPopup.getElementsByTagName("p");
        let popupImg = currentAreaPopup.querySelector("img");
        
        costData.push(areas[i].getElementsByTagName("cost")[0].childNodes[0].nodeValue);
        statusData.push(areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue);
        capacityData.push(areas[i].getElementsByTagName("capacity")[0].childNodes[0].nodeValue);

        popupContent[0].innerHTML = "<b>Cost:</b> $" + costData[i];
        popupContent[1].innerHTML = "<b>Booking Status:</b> " + statusData[i];
        popupContent[2].innerHTML = "<b>Capacity:</b> " + capacityData[i];
        popupImg.src = areas[i].getElementsByTagName("src")[0].childNodes[0].nodeValue;

        if (statusData.at(i) == "Reserved")
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        
        currentArea.onclick = function() {
            summarySetup(currentArea, costData[i], statusData[i], capacityData[i]);
        }
    }

    let searchBtn = document.getElementById("search");

    searchBtn.onclick = function() {
        checkAvailability(capacityData, statusData);
    }
}

function checkAvailability(capacityData, statusData) {
    for (let i = 0; i < 10; i++) {
        let currentArea = document.getElementById("ra-" + (i+1));

        if (userCapacity.value > parseInt(capacityData[i]) || statusData[i] == "Reserved") {
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        }
        else {
            currentArea.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        }
    }

    comparisonCapacity = userCapacity.value;
}

function summarySetup(currentArea, areaCost, areaStatus, areaCapacity) {
    let summaryContent = summaryModal.getElementsByTagName("p");
    let numOfDays = (new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()) / (1000 * 60 * 60 * 24);  

    if (comparisonCapacity != userCapacity.value) {
        alert("Capacity Input Changed. Please Use Search Button to See Available Areas for your Desired Capacity.");
        return;
    }
    if (checkIn.value == "" || checkOut.value == "") {
        alert("Error! Please Enter Dates for Booking.");
        return;
    }
    else if (numOfDays <= 0) {
        alert("Error! Please Enter Valid Booking Dates.");
        return;
    }
    else if (userCapacity.value <= 0) {
        alert("Error! Please Enter a Number greater than zero for Capacity.");
        return;
    }
    else if (areaStatus == "Reserved") {
        alert("Error! Booking Already Reserved. Please Choose another Reserved Area for Booking.");
        return;
    }
    else if (currentArea.style.backgroundColor == "rgba(255, 0, 0, 0.5)") {
        alert("Error! Capacity Inputted is Greater than Maximum Capacity of Selected Area.");
        return;
    }

    summaryModal.style.display = "block";
    
    userSummaryData = [];
    userSummaryData.push(checkIn.value);
    userSummaryData.push(checkOut.value);
    userSummaryData.push(userCapacity.value);
    userSummaryData.push(areaCapacity);
    userSummaryData.push(numOfDays);
    userSummaryData.push(areaCost);
    userSummaryData.push(areaCost * numOfDays);

    summaryContent[0].innerHTML = "<b>Check In:</b> " + userSummaryData[0];
    summaryContent[1].innerHTML = "<b>Check Out:</b> " + userSummaryData[1];
    summaryContent[2].innerHTML = "<b>Number of People:</b> " + userSummaryData[2];
    summaryContent[3].innerHTML = "<b>Maximum Capacity:</b> " + userSummaryData[3];
    summaryContent[4].innerHTML = "<b>No. of Days:</b> " + userSummaryData[4];
    summaryContent[5].innerHTML = "<b>Cost per Day:</b> $" + userSummaryData[5];
    summaryContent[6].innerHTML = "<b>Total Cost:</b> $" + userSummaryData[6];
}

let summaryModal = document.getElementById("summaryModal");
let bookedModal = document.getElementById("bookedModal");

let checkIn = document.getElementById("check-in");
let checkOut = document.getElementById("check-out");
let userCapacity = document.getElementById("capacity");

let userSummaryData = [];
let comparisonCapacity = 0;

window.onload = fetchAndProcessXML;
window.onclick = function(event) {
    if (event.target == summaryModal || event.target == bookedModal) {
        closeModal();
    }
}

function submitBooking() {
    summaryModal.style.display = "none";
    bookedModal.style.display = "block";

    let bookedContent = bookedModal.getElementsByTagName("p");

    bookedContent[0].innerHTML = "<b>Check In:</b> " + userSummaryData[0];
    bookedContent[1].innerHTML = "<b>Check Out:</b> " + userSummaryData[1];
    bookedContent[2].innerHTML = "<b>Number of People:</b> " + userSummaryData[2];
    bookedContent[3].innerHTML = "<b>Maximum Capacity:</b> " + userSummaryData[3];
    bookedContent[4].innerHTML = "<b>No. of Days:</b> " + userSummaryData[4];
    bookedContent[5].innerHTML = "<b>Cost per Day:</b> $" + userSummaryData[5];
    bookedContent[6].innerHTML = "<b>Total Cost:</b> $" + userSummaryData[6];
}

function closeModal() {
    summaryModal.style.display = "none";
    bookedModal.style.display = "none";
}