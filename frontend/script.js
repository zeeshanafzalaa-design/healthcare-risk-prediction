/* =========================================================
   CONFIGURATION
========================================================= */
const API_URL = "http://127.0.0.1:8000/predict";

const PATIENTS_API_URL = "http://127.0.0.1:8000/patients";

/* =========================================================
   GLOBAL DATA
========================================================= */

let patients = [];

let assessmentNumber = 0;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const closeSidebar =
    document.getElementById("closeSidebar");

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebar() {

    sidebar.classList.add(
        "mobile-open"
    );

    sidebarOverlay.classList.add(
        "show"
    );

}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );

}


menuButton.addEventListener(
    "click",
    openSidebar
);


closeSidebar.addEventListener(
    "click",
    closeMobileSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeMobileSidebar
);


/* =========================================================
   NAVIGATION
========================================================= */

navItems.forEach(function(item) {

    item.addEventListener(
        "click",
        function() {

            const pageName =
                item.dataset.page;

            navigateTo(
                pageName
            );

        }
    );

});


function navigateTo(pageName) {


    /* Remove active class */

    navItems.forEach(function(item) {

        item.classList.remove(
            "active"
        );

    });


    /* Activate selected button */

    const selectedNav =
        document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );


    if(selectedNav) {

        selectedNav.classList.add(
            "active"
        );

    }


    /* Hide every page */

    pages.forEach(function(page) {

        page.classList.remove(
            "active-page"
        );

    });


    /* Show selected page */

    const selectedPage =
        document.getElementById(
            `page-${pageName}`
        );


    if(selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    /* Close mobile menu */

    closeMobileSidebar();


    /* Scroll to top */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   INTERNAL PAGE BUTTONS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-page-target]"
            );


        if(!button) {

            return;

        }


        const target =
            button.dataset.pageTarget;


        navigateTo(
            target
        );

    }
);


/* =========================================================
   PREDICTION FORM
========================================================= */

const form =
    document.getElementById(
        "predictionForm"
    );


const predictButton =
    document.getElementById(
        "predictButton"
    );


const clearButton =
    document.getElementById(
        "clearButton"
    );


const buttonText =
    document.getElementById(
        "buttonText"
    );


const loadingSpinner =
    document.getElementById(
        "loadingSpinner"
    );


const initialResult =
    document.getElementById(
        "initialResult"
    );


const predictionResult =
    document.getElementById(
        "predictionResult"
    );


/* =========================================================
   FORM SUBMIT
========================================================= */

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const patientData = {

            pregnancies:
                Number(
                    document.getElementById(
                        "pregnancies"
                    ).value
                ),

            glucose:
                Number(
                    document.getElementById(
                        "glucose"
                    ).value
                ),

            blood_pressure:
                Number(
                    document.getElementById(
                        "blood_pressure"
                    ).value
                ),

            skin_thickness:
                Number(
                    document.getElementById(
                        "skin_thickness"
                    ).value
                ),

            insulin:
                Number(
                    document.getElementById(
                        "insulin"
                    ).value
                ),

            bmi:
                Number(
                    document.getElementById(
                        "bmi"
                    ).value
                ),

            diabetes_pedigree_function:
                Number(
                    document.getElementById(
                        "diabetes_pedigree"
                    ).value
                ),

            age:
                Number(
                    document.getElementById(
                        "age"
                    ).value
                )

        };


        /* Update loading state */

        predictButton.disabled = true;

        buttonText.textContent =
            "Analyzing...";

        loadingSpinner.classList.remove(
            "hidden"
        );


        try {


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                patientData
                            )

                    }
                );


            if(!response.ok) {

                let errorMessage =
                    "Prediction failed.";

                try {

                    const error =
                        await response.json();

                    errorMessage =
                        error.detail ||
                        errorMessage;

                }

                catch(error) {

                }


                throw new Error(
                    errorMessage
                );

            }


            const result =
                await response.json();


            console.log(
                "API RESULT:",
                result
            );


            /* Display prediction */

            displayPrediction(
                result,
                patientData
            );


        }

        catch(error) {

            console.error(
                error
            );


            alert(

                "Could not connect to the prediction API.\n\n" +

                "Make sure FastAPI is running:\n" +

                "http://127.0.0.1:8000\n\n" +

                "Error: " +

                error.message

            );

        }

        finally {

            predictButton.disabled =
                false;

            buttonText.textContent =
                "Run Risk Assessment";

            loadingSpinner.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   DISPLAY PREDICTION
========================================================= */

function displayPrediction(
    result,
    patientData
) {


    initialResult.classList.add(
        "hidden"
    );


    predictionResult.classList.remove(
        "hidden"
    );


    /*
       Support several possible API response names.
    */

    let probabilityValue =
        getProbability(
            result
        );


    let predictionValue =
        result.prediction;


    let riskLevelValue =
        result.risk_level;


    /*
       If backend does not return risk level,
       calculate one ourselves.
    */

    if(!riskLevelValue) {

        riskLevelValue =
            calculateRiskLevel(
                probabilityValue
            );

    }


    /*
       Convert probability to percentage.
    */

    const percentage =
        probabilityValue;


    document.getElementById(
        "probability"
    ).textContent =
        percentage.toFixed(1) + "%";


    document.getElementById(
        "probabilityText"
    ).textContent =
        percentage.toFixed(1) + "%";


    document.getElementById(
        "predictionText"
    ).textContent =
        predictionValue == 1
            ? "Positive"
            : "Negative";


    document.getElementById(
        "riskLevel"
    ).textContent =
        riskLevelValue;


    /*
       Clinical message
    */

    const clinicalMessage =
        result.message ||
        generateClinicalMessage(
            riskLevelValue,
            percentage
        );


    document.getElementById(
        "message"
    ).textContent =
        clinicalMessage;


    /*
       Change risk colors
    */

    updateRiskColor(
        riskLevelValue
    );


    /*
       Save patient assessment
    */

    savePatient(

        patientData,

        result,

        percentage,

        riskLevelValue,

        predictionValue

    );


    /*
       Update dashboard
    */

    updateDashboard();


    /*
       Update analytics
    */

    updateAnalytics();

}


/* =========================================================
   GET PROBABILITY
========================================================= */

function getProbability(result) {


    let value = 0;


    if(
        result.probability_percentage
        !== undefined
    ) {

        value =
            Number(
                result.probability_percentage
            );

    }

    else if(
        result.probability
        !== undefined
    ) {

        value =
            Number(
                result.probability
            );

        /*
           If probability is between 0 and 1,
           convert to percentage.
        */

        if(value <= 1) {

            value =
                value * 100;

        }

    }

    else if(
        result.risk_score
        !== undefined
    ) {

        value =
            Number(
                result.risk_score
            );

        if(value <= 1) {

            value =
                value * 100;

        }

    }


    if(
        Number.isNaN(value)
    ) {

        value = 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            value
        )
    );

}


/* =========================================================
   RISK LEVEL
========================================================= */

function calculateRiskLevel(
    probability
) {

    if(probability < 25) {

        return "Low";

    }

    if(probability < 50) {

        return "Moderate";

    }

    if(probability < 75) {

        return "High";

    }

    return "Critical";

}


/* =========================================================
   CLINICAL MESSAGE
========================================================= */

function generateClinicalMessage(
    risk,
    probability
) {


    if(risk === "Low") {

        return (
            "The estimated risk is low. " +
            "Continue routine monitoring and " +
            "maintain healthy lifestyle practices."
        );

    }


    if(risk === "Moderate") {

        return (
            "The estimated risk is moderate. " +
            "Consider additional clinical review " +
            "and continued monitoring."
        );

    }


    if(risk === "High") {

        return (
            "The estimated risk is high. " +
            "Clinical review and appropriate " +
            "follow-up are recommended."
        );

    }


    return (
        "The estimated risk is critical. " +
        "Prompt clinical assessment is recommended."
    );

}


/* =========================================================
   RISK COLOR
========================================================= */

function updateRiskColor(
    level
) {


    const circle =
        document.getElementById(
            "riskCircle"
        );


    const title =
        document.getElementById(
            "riskLevel"
        );


    circle.classList.remove(

        "risk-low",

        "risk-moderate",

        "risk-high",

        "risk-critical"

    );


    title.classList.remove(

        "risk-low-text",

        "risk-moderate-text",

        "risk-high-text",

        "risk-critical-text"

    );


    const normalized =
        String(
            level
        ).toLowerCase();


    if(normalized === "low") {

        circle.classList.add(
            "risk-low"
        );

        title.classList.add(
            "risk-low-text"
        );

    }

    else if(
        normalized === "moderate"
    ) {

        circle.classList.add(
            "risk-moderate"
        );

        title.classList.add(
            "risk-moderate-text"
        );

    }

    else if(
        normalized === "high"
    ) {

        circle.classList.add(
            "risk-high"
        );

        title.classList.add(
            "risk-high-text"
        );

    }

    else {

        circle.classList.add(
            "risk-critical"
        );

        title.classList.add(
            "risk-critical-text"
        );

    }

}


/* =========================================================
   SAVE PATIENT
========================================================= */

function savePatient(

    data,

    result,

    probability,

    risk,

    prediction

) {


    assessmentNumber++;


    const patient = {

        id:
            assessmentNumber,

        name:
            "Patient " +
            String(
                assessmentNumber
            ).padStart(
                3,
                "0"
            ),

        age:
            data.age,

        glucose:
            data.glucose,

        bmi:
            data.bmi,

        bloodPressure:
            data.blood_pressure,

        probability:
            probability,

        risk:
            risk,

        prediction:
            prediction == 1
                ? "Positive"
                : "Negative",

        timestamp:
            new Date()

    };


    patients.unshift(
        patient
    );


    /*
       Keep maximum 50 records.
    */

    if(
        patients.length > 50
    ) {

        patients =
            patients.slice(
                0,
                50
            );

    }


    renderPatientTable();

}


/* =========================================================
   PATIENT TABLE
========================================================= */

function renderPatientTable(
    searchTerm = ""
) {


    const tableBody =
        document.getElementById(
            "patientTableBody"
        );


    let filtered =
        patients;


    if(searchTerm) {

        const search =
            searchTerm.toLowerCase();


        filtered =
            patients.filter(
                function(patient) {

                    return (

                        patient.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            patient.age
                        ).includes(search)

                        ||

                        patient.risk
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    if(filtered.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="no-data"
                >
                    No patient assessments available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        filtered
            .map(
                function(patient) {

                    const riskClass =
                        patient.risk
                            .toLowerCase();


                    return `

                        <tr>

                            <td>

                                <span
                                    class="patient-name"
                                >
                                    ${patient.name}
                                </span>

                            </td>

                            <td>
                                ${patient.age}
                            </td>

                            <td>
                                ${patient.glucose}
                                mg/dL
                            </td>

                            <td>
                                ${patient.bmi}
                            </td>

                            <td>

                                <span
                                    class="risk-badge ${riskClass}"
                                >
                                    ${patient.risk}
                                </span>

                            </td>

                            <td>
                                ${patient.probability.toFixed(1)}%
                            </td>

                            <td>
                                ${patient.prediction}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   PATIENT SEARCH
========================================================= */

const patientSearch =
    document.getElementById(
        "patientSearch"
    );


patientSearch.addEventListener(
    "input",
    function() {

        renderPatientTable(
            this.value
        );

    }
);


/* =========================================================
   DASHBOARD UPDATE
========================================================= */

function updateDashboard() {


    document.getElementById(
        "totalAssessments"
    ).textContent =
        patients.length;


    const highRisk =
        patients.filter(
            function(patient) {

                return (

                    patient.risk === "High"

                    ||

                    patient.risk === "Critical"

                );

            }
        ).length;


    const lowRisk =
        patients.filter(
            function(patient) {

                return patient.risk === "Low";

            }
        ).length;


    document.getElementById(
        "highRiskCount"
    ).textContent =
        highRisk;


    document.getElementById(
        "lowRiskCount"
    ).textContent =
        lowRisk;


    renderRecentPatients();

}


/* =========================================================
   RECENT PATIENTS
========================================================= */

function renderRecentPatients() {


    const container =
        document.getElementById(
            "dashboardPatients"
        );


    if(patients.length === 0) {

        return;

    }


    const recent =
        patients.slice(
            0,
            5
        );


    container.innerHTML =
        recent
            .map(
                function(patient) {

                    const riskClass =
                        patient.risk
                            .toLowerCase();


                    return `

                        <div class="recent-patient">

                            <div class="recent-avatar">
                                ${patient.name.substring(8)}
                            </div>

                            <div class="recent-info">

                                <strong>
                                    ${patient.name}
                                </strong>

                                <span>
                                    Age ${patient.age}
                                    • Glucose ${patient.glucose}
                                </span>

                            </div>

                            <span
                                class="risk-badge ${riskClass}"
                            >
                                ${patient.risk}
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ANALYTICS
========================================================= */

function updateAnalytics() {


    const total =
        patients.length;


    const positive =
        patients.filter(
            function(patient) {

                return patient.prediction ===
                    "Positive";

            }
        ).length;


    const average =
        total === 0
            ? 0
            : patients.reduce(
                function(sum, patient) {

                    return (
                        sum +
                        patient.probability
                    );

                },
                0
            ) / total;


    const high =
        patients.filter(
            function(patient) {

                return (

                    patient.risk === "High"

                    ||

                    patient.risk === "Critical"

                );

            }
        ).length;


    document.getElementById(
        "analyticsTotal"
    ).textContent =
        total;


    document.getElementById(
        "analyticsPositive"
    ).textContent =
        positive;


    document.getElementById(
        "analyticsAverage"
    ).textContent =
        average.toFixed(1) +
        "%";


    document.getElementById(
        "analyticsHigh"
    ).textContent =
        total === 0
            ? "0%"
            : (
                high / total * 100
            ).toFixed(1) +
            "%";


    updateRiskBars();

}


/* =========================================================
   RISK BARS
========================================================= */

function updateRiskBars() {


    const total =
        patients.length;


    const counts = {

        Low: 0,

        Moderate: 0,

        High: 0,

        Critical: 0

    };


    patients.forEach(
        function(patient) {

            if(
                counts[
                    patient.risk
                ] !== undefined
            ) {

                counts[
                    patient.risk
                ]++;

            }

        }
    );


    const low =
        percentage(
            counts.Low,
            total
        );


    const moderate =
        percentage(
            counts.Moderate,
            total
        );


    const high =
        percentage(
            counts.High,
            total
        );


    const critical =
        percentage(
            counts.Critical,
            total
        );


    setBar(
        "lowPercent",
        "lowBar",
        low
    );


    setBar(
        "moderatePercent",
        "moderateBar",
        moderate
    );


    setBar(
        "highPercent",
        "highBar",
        high
    );


    setBar(
        "criticalPercent",
        "criticalBar",
        critical
    );

}


function percentage(
    count,
    total
) {

    if(total === 0) {

        return 0;

    }

    return (
        count / total
    ) * 100;

}


function setBar(
    textId,
    barId,
    value
) {


    document.getElementById(
        textId
    ).textContent =
        value.toFixed(1) +
        "%";


    document.getElementById(
        barId
    ).style.width =
        value + "%";

}


/* =========================================================
   RESET
========================================================= */

clearButton.addEventListener(
    "click",
    function() {

        form.reset();


        initialResult.classList.remove(
            "hidden"
        );


        predictionResult.classList.add(
            "hidden"
        );


        document.getElementById(
            "probability"
        ).textContent =
            "0%";


        document.getElementById(
            "riskLevel"
        ).textContent =
            "-";


        document.getElementById(
            "probabilityText"
        ).textContent =
            "0%";


        document.getElementById(
            "predictionText"
        ).textContent =
            "-";


        document.getElementById(
            "message"
        ).textContent =
            "";


        document.getElementById(
            "riskCircle"
        ).className =
            "risk-circle";

    }
);


/* =========================================================
   GLOBAL SEARCH
========================================================= */

const globalSearch =
    document.getElementById(
        "globalSearch"
    );


globalSearch.addEventListener(
    "keydown",
    function(event) {

        if(
            event.key === "Enter"
        ) {

            navigateTo(
                "patients"
            );


            patientSearch.value =
                globalSearch.value;


            renderPatientTable(
                globalSearch.value
            );

        }

    }
);


/* =========================================================
   NOTIFICATION
========================================================= */

document.getElementById(
    "notificationButton"
).addEventListener(
    "click",
    function() {

        if(
            patients.length === 0
        ) {

            alert(
                "No new clinical alerts."
            );

            return;

        }


        const highRisk =
            patients.filter(
                function(patient) {

                    return (

                        patient.risk === "High"

                        ||

                        patient.risk === "Critical"

                    );

                }
            ).length;


        alert(

            highRisk +

            " high-risk assessment(s) " +

            "require clinical attention."

        );

    }
);


/* =========================================================
   SETTINGS
========================================================= */

document.getElementById(
    "alertToggle"
).addEventListener(
    "change",
    function() {

        console.log(
            "Clinical alerts:",
            this.checked
        );

    }
);


document.getElementById(
    "aiToggle"
).addEventListener(
    "change",
    function() {

        if(!this.checked) {

            alert(
                "AI analysis has been disabled in settings."
            );

        }

    }
);


document.getElementById(
    "notificationToggle"
).addEventListener(
    "change",
    function() {

        console.log(
            "Notifications:",
            this.checked
        );

    }
);


/* =========================================================
   LOAD PATIENTS FROM DATABASE
========================================================= */

async function loadPatients() {

    try {

        const response = await fetch(
            PATIENTS_API_URL
        );

        if (!response.ok) {

            throw new Error(
                "Could not load patient records."
            );

        }

        const data = await response.json();

        /*
           Convert backend patient data
           into the format used by the frontend.
        */

        patients = data.map(function(patient) {

            return {

                id:
                    patient.patient_id,

                name:
                    "Patient " +
                    String(
                        patient.patient_id
                    ).padStart(
                        3,
                        "0"
                    ),

                age:
                    patient.age,

                glucose:
                    patient.glucose,

                bmi:
                    patient.bmi,

                bloodPressure:
                    patient.blood_pressure,

                probability:
                    patient.probability_percentage,

                risk:
                    patient.risk_level,

                prediction:
                    patient.prediction == 1
                        ? "Positive"
                        : "Negative",

                timestamp:
                    patient.created_at

            };

        });


        /*
           Keep assessment number ahead
           of the latest database ID.
        */

        if (patients.length > 0) {

            assessmentNumber =
                Math.max.apply(
                    null,
                    patients.map(function(patient) {

                        return patient.id;

                    })
                );

        }
        else {

            assessmentNumber = 0;

        }


        /*
           Update all frontend sections.
        */

        updateDashboard();

        updateAnalytics();

        renderPatientTable();


        console.log(
            "Patients loaded from database:",
            patients
        );

    }

    catch(error) {

        console.error(
            "Patient loading error:",
            error
        );

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

loadPatients();