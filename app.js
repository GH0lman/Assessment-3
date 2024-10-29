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

        popupContent[0].innerHTML = "Cost: " + areas[i].getElementsByTagName("cost")[0].childNodes[0].nodeValue;
        popupContent[1].innerHTML = "Booking Status: " + areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue;
        popupContent[2].innerHTML = "Capacity: " + areas[i].getElementsByTagName("capacity")[0].childNodes[0].nodeValue;
        popupImg.src = areas[i].getElementsByTagName("src")[0].childNodes[0].nodeValue;

        if (areas[i].getElementsByTagName("status")[0].childNodes[0].nodeValue == "Reserved")
            currentArea.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    }
}

function revealPopup(object) {
    object.style.visibility = "visible";
}

window.onload = fetchAndProcessXML;