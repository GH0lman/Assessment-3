/* Created by George Holman - Student ID: 1580967 */

// Function to Parse XML data into a JavaScript object (DOM)
function parseXML(xmlString) {
    // Creates a Parser and XMLDoc to return the ability to parse any XML Code provided from the xmlString provided.
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "application/xml");
    return xmlDoc;
}

// Function to Fetch and Process the XML code that is given and setup the data to be used on the website.
function fetchAndProcessXML() {
    // Fetch is called to use the XML provided to get a respose, then the data, and catch any errors incase there is no response or data error in the XML.
    fetch('XML/areas.xml') 
        // Response is used to check if XML response is received correctly.
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        // Data is stored in a variable which does a final parsing check to see if data is valid.
        .then(data => {
            let xmlData = parseXML(data);

            if (xmlData.getElementsByTagName("parsererror").length > 0) {
                console.error("Error parsing XML:", xmlData.getElementsByTagName("parsererror")[0].textContent);
                return;
            }

            // Setup Booking Form Function is called with the now collected and validated XML Data to be used.
            setupBookingForm(xmlData);
        })
        // Catch any errors in the provided XML response and print to the user the exact error code to help with debugging.
        .catch(error => console.error("Error fetching or processing XML:", error));
}

// Setup Booking Form Function is called on website start up, collecting all the data being used into storage and setup the reserved area's data that will be viewed by the user.
function setupBookingForm(xmlData) {
    // Setup variable to get all areas within the XML Data to be used in the form.
    let areas = xmlData.getElementsByTagName("area");
    // Setup empty arrays that will be used later to fill with the data from the XML Form to be used after setup.
    let costData = [];
    let statusData = [];
    let capacityData = [];

    // Setup the dates of the Date Inputs to be set to default to be dates relative to the current date for easier booking experience.
    let todayDate = new Date();
    checkIn.value = todayDate.toISOString().substring(0, 10);

    todayDate.setDate(todayDate.getDate() + 1);
    checkOut.value = todayDate.toISOString().substring(0, 10);
    
    // Setup default value of user capacity for input.
    userCapacity.value = 0;

    // For Loop goes through all the areas that are found on the XML Data and apply them to an associated display for the user.
    for (let i = 0; i < areas.length; i++) {
        // Gets the div of the reserved area and associated popup that will use the data depending on the number.
        let currentArea = document.getElementById("ra-" + (i+1));
        let currentAreaPopup = document.getElementById("popup" + (i+1));
        
        // Get the content of the popup and image to edit and provide the information from the associated reserved area from the XML data.
        let popupContent = currentAreaPopup.getElementsByTagName("p");
        let popupImg = currentAreaPopup.querySelector("img");
        
        // Push the data collected into an array which can be used after startup.
        costData.push(areas[i].getElementsByTagName("cost")[0].childNodes[0].nodeValue);
        statusData.push(areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue);
        capacityData.push(areas[i].getElementsByTagName("capacity")[0].childNodes[0].nodeValue);

        // Sets the content of the popup to the XML data relative to the reserved area.
        popupContent[0].innerHTML = "<b>Cost:</b> $" + costData[i];
        popupContent[1].innerHTML = "<b>Booking Status:</b> " + statusData[i];
        popupContent[2].innerHTML = "<b>Capacity:</b> " + capacityData[i];
        popupImg.src = areas[i].getElementsByTagName("src")[0].childNodes[0].nodeValue;

        // If the status of the current reserved area is reserved than it will change the color of the div to represent that.
        if (statusData.at(i) == "Reserved")
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        
        // Create on click event so that a summary of the reserved area selected is created to book the selected reserved area.
        currentArea.onclick = function() {
            summarySetup(currentArea, costData[i], statusData[i], capacityData[i]);
        }
    }

    // Setup search button and set buntton functionality so that it checks if the availability of the reserved areas depending on the inputted capacity.
    let searchBtn = document.getElementById("searchBtn");
    searchBtn.onclick = function() {
        checkAvailability(capacityData, statusData);
    }
}

// Check Availability Function is used to check which reserved areas are available or unavailabile due to the inputted capacity.
function checkAvailability(capacityData, statusData) {
    // For loop checks through all the areas
    for (let i = 0; i < capacityData.length; i++) {
        // Gets the the div of the reserved area to make the edit.
        let currentArea = document.getElementById("ra-" + (i+1));

        // If the inputted capacity is greater than the reserved area's capacity or the area is already reserved, change the block to red, else keep it greenn. Shows the visual change on which places are available.
        if (userCapacity.value > parseInt(capacityData[i]) || statusData[i] == "Reserved") {
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        }
        else {
            currentArea.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        }
    }

    // Comparison Capacity is set to user input, this is to check if user changes the capacity after it has done a check. This is so that  if the input changes, user needs to make a new check to make sure booking is valid.
    comparisonCapacity = userCapacity.value;
}

// Summary Setup Function is used to setup the summary page the displays the details about the reserved area aswell as the user's inputs and the calculated cost.
function summarySetup(currentArea, areaCost, areaStatus, areaCapacity) {
    // Setup the content of the summary page to be edited.
    let summaryContent = summaryModal.getElementsByTagName("p");
    // Uses Date Objects to get number of days that are between the check in and check out dates.
    let numOfDays = (new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()) / (1000 * 60 * 60 * 24);  

    // If the current user capcity has been edited since it was searched, it will ask the user to search to check the availability of the areas, alert user with reason for invalid booking.
    if (comparisonCapacity != userCapacity.value) {
        alert("Capacity Input Changed. Please Use Search Button to See Available Areas for your Desired Capacity.");
        return;
    }
    // If the check in or check out dates are empty, alert user with reason for invalid booking.
    else if (checkIn.value == "" || checkOut.value == "") {
        alert("Error! Please Enter Dates for Booking.");
        return;
    }
    // If the calculated number of days booked is lesser or equal to zero, alert user with reason for invalid booking.
    else if (numOfDays <= 0) {
        alert("Error! Please Enter Valid Booking Dates.");
        return;
    }
    // If the user capacity is lesser or equal to zero, alert user with reason for invalid booking.
    else if (userCapacity.value <= 0) {
        alert("Error! Please Enter a Number greater than zero for Capacity.");
        return;
    }
    // If the selected area is reserved, alert user with reason for invalid booking.
    else if (areaStatus == "Reserved") {
        alert("Error! Booking Already Reserved. Please Choose another Reserved Area for Booking.");
        return;
    }
    // If the selected area is no available due to user capacity being too high, alert user with reason for invalid booking.
    else if (currentArea.style.backgroundColor == "rgba(255, 0, 0, 0.5)") {
        alert("Error! Capacity Inputted is Greater than Maximum Capacity of Selected Area.");
        return;
    }

    // Reveal summary modal to user.
    summaryModal.style.display = "block";
    
    // Empties the information array and stores the data of the summary information into it, this is so that whenever the user creates a booking, the data is stored to be used in the booked modal.
    userSummaryData = [];
    userSummaryData.push(checkIn.value);
    userSummaryData.push(checkOut.value);
    userSummaryData.push(userCapacity.value);
    userSummaryData.push(areaCapacity);
    userSummaryData.push(numOfDays);
    userSummaryData.push(areaCost);
    userSummaryData.push(areaCost * numOfDays);

    // Set the data within the summary modal to the inputted data.
    summaryContent[0].innerHTML = "<b>Check In:</b> " + userSummaryData[0];
    summaryContent[1].innerHTML = "<b>Check Out:</b> " + userSummaryData[1];
    summaryContent[2].innerHTML = "<b>Number of People:</b> " + userSummaryData[2];
    summaryContent[3].innerHTML = "<b>Maximum Capacity:</b> " + userSummaryData[3];
    summaryContent[4].innerHTML = "<b>No. of Days:</b> " + userSummaryData[4];
    summaryContent[5].innerHTML = "<b>Cost per Day:</b> $" + userSummaryData[5];
    summaryContent[6].innerHTML = "<b>Total Cost:</b> $" + userSummaryData[6];
}

// Submit Booking Function is used to hide the summary modal and reveal the booked modal, showing the user that their booking has been submitted.
function submitBooking() {
    // Hides summary modal and reveals booked modal.
    summaryModal.style.display = "none";
    bookedModal.style.display = "block";

    // Gets the content of the booked modal and sets it to the data collected from the summary modal stored in the array.
    let bookedContent = bookedModal.getElementsByTagName("p");
    bookedContent[0].innerHTML = "<b>Check In:</b> " + userSummaryData[0];
    bookedContent[1].innerHTML = "<b>Check Out:</b> " + userSummaryData[1];
    bookedContent[2].innerHTML = "<b>Number of People:</b> " + userSummaryData[2];
    bookedContent[3].innerHTML = "<b>Maximum Capacity:</b> " + userSummaryData[3];
    bookedContent[4].innerHTML = "<b>No. of Days:</b> " + userSummaryData[4];
    bookedContent[5].innerHTML = "<b>Cost per Day:</b> $" + userSummaryData[5];
    bookedContent[6].innerHTML = "<b>Total Cost:</b> $" + userSummaryData[6];
}

// Close Function is used to hide the modals when they have been asked to close.
function closeModal() {
    summaryModal.style.display = "none";
    bookedModal.style.display = "none";
}

// Setup reference to the modals for the booking form.
let summaryModal = document.getElementById("summaryModal");
let bookedModal = document.getElementById("bookedModal");

// Setup reference to the inputs of the booking form.
let checkIn = document.getElementById("check-in");
let checkOut = document.getElementById("check-out");
let userCapacity = document.getElementById("capacity");

// Setup array for data collection and comparison int for checking user input.
let userSummaryData = [];
let comparisonCapacity = 0;

// Onload, load the fetch and process XML to start setup.
window.onload = fetchAndProcessXML;
// When user clicks on screen, check if it clicks eithe modal, if so then close the modal.
window.onclick = function(event) {
    if (event.target == summaryModal || event.target == bookedModal) {
        closeModal();
    }
}