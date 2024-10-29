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

            setupPopups(xmlData);
        })
        .catch(error => console.error("Error fetching or processing XML:", error));
}

function setupPopups(xmlData) {
    let areas = xmlData.getElementsByTagName("area");

    for (let i = 0; i < areas.length; i++) {
        let currentArea = document.getElementById("ra-" + (i+1));
        let currentAreaPopup = document.getElementById("popup" + (i+1));
        let popupContent = currentAreaPopup.getElementsByTagName("p");
        let popupImg = currentAreaPopup.querySelector("img");

        popupContent[0].innerHTML = "<b>Cost:</b> $" + areas[i].getElementsByTagName("cost")[0].childNodes[0].nodeValue;
        popupContent[1].innerHTML = "<b>Booking Status:</b> " + areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue;
        popupContent[2].innerHTML = "<b>Capacity:</b> " + areas[i].getElementsByTagName("capacity")[0].childNodes[0].nodeValue;
        popupImg.src = areas[i].getElementsByTagName("src")[0].childNodes[0].nodeValue;

        if (areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue == "Reserved")
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        
        currentArea.onclick = function() {
            summarySetup(areas[i].getElementsByTagName("cost")[0].childNodes[0].nodeValue, areas[i].getElementsByTagName("capacity")[0].childNodes[0].nodeValue, areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue);
        }
    }
}

function checkAvailability(areas) {

}

function summarySetup(areaCost, areaCapacity, areaStatus) {
    let checkIn = document.getElementById("check-in");
    let checkOut = document.getElementById("check-out");
    let userCapacity = document.getElementById("capacity");

    let summaryContent = modal.getElementsByTagName("p");
    let numOfDays = (new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()) / (1000 * 60 * 60 * 24);  

    if (checkIn.value == "" || checkOut.value == "") {
        alert("Error! Please Enter Dates for Booking.");
        return;
    }
    else if (userCapacity.value <= 0) {
        alert("Error! Please Enter a Number greater than zero for Capacity.");
        return;
    }
    else if (numOfDays <= 0) {
        alert("Error! Please Enter Valid Booking Dates.");
        return;
    }
    else if (areaStatus == "Reserved") {
        alert("Error! Booking Already Reserved. Please Choose another Reserved Area for Booking.");
        return;
    }

    modal.style.display = "block";
    
    summaryContent[0].innerHTML = "<b>Check In:</b> " + checkIn.value;
    summaryContent[1].innerHTML = "<b>Check Out:</b> " + checkOut.value;
    summaryContent[2].innerHTML = "<b>Number of People:</b> " + userCapacity.value;
    summaryContent[3].innerHTML = "<b>Maximum Capacity:</b> " + areaCapacity;
    summaryContent[4].innerHTML = "<b>No. of Days:</b> " + numOfDays;
    summaryContent[5].innerHTML = "<b>Cost per Day:</b> $" + areaCost;
    summaryContent[6].innerHTML = "<b>Total Cost:</b> $" + (areaCost * numOfDays);
}

let modal = document.getElementById("summaryModal");

window.onload = fetchAndProcessXML;
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    modal.style.display = "none";
}