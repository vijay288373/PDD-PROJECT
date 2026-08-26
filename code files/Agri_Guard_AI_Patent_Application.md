# DRAFT PATENT APPLICATION DOCUMENTS
**PROJECT TITLE: AGRI GUARD AI**

---

## FORM 1
**THE PATENTS ACT 1970 (39 of 1970) and THE PATENTS RULES, 2003**
### APPLICATION FOR GRANT OF PATENT
*[See section 7, 54 and 135 and sub-rule (1) of rule 20]*

*(FOR OFFICE USE ONLY)*
*   **Application No:** 
*   **Filing Date:** 
*   **Amount of Fee Paid:** 
*   **CBR No:** 
*   **Signature:** 

---

### 1. APPLICANT’S REFERENCE / IDENTIFICATION NO. (AS ALLOTTED BY OFFICE)
**Ref:** SIMATS/CSE/2026/AG-01

---

### 2. TYPE OF APPLICATION
*   **Ordinary Application:** [ ✓ ]
*   **Convention Application:** [ ]
*   **PCT-NP (National Phase):** [ ]
*   **PPH (Patent Prosecution Highway):** [ ]
*   **Divisional Application:** [ ]
*   **Patent of Addition:** [ ]

---

### 3A. APPLICANT(S)
| Name in Full | Nationality | Country of Residence | Address of the Applicant |
|---|---|---|---|
| **SAVEETHA INSTITUTE OF MEDICAL AND TECHNICAL SCIENCES** | Indian | India | Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India<br>Email: patents.sdc@saveetha.com<br>Contact: 9884293869 / 04426801580 |

### 3B. CATEGORY OF APPLICANT
*   **Educational Institution:** [ ✓ ]
*   **Natural Person / Other than Natural Person / Small Entity / Startup:** [ ]

---

### 4. INVENTOR(S)
*Are all the inventor(s) same as the applicant(s) named above?*
*   **No:** [ ✓ ]

#### Details of the Inventor(s):
| Name in Full | Nationality | Country of Residence | Address |
|---|---|---|---|
| **Dr. Jaya Mebal Rani** | Indian | India | Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India |
| **B Vijay Kumar (Reg. No.192324210)** | Indian | India | Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India |

---

### 5. TITLE OF THE INVENTION
**"SYSTEM AND METHOD FOR OFFLINE-FIRST MOBILE PLATFORM FOR REAL-TIME COMPUTER VISION-BASED PLANT DISEASE DIAGNOSIS AND METEOROLOGICAL-INTEGRATED AGRICULTURAL ADVISORY"**

---

### 6. AUTHORISED REGISTERED PATENT AGENT(S)
*   **IN/PA No / Name / Mobile No:** —

---

### 7. ADDRESS FOR SERVICE OF APPLICANT IN INDIA
*   **Name:** Saveetha Institute of Medical and Technical Sciences
*   **Postal Address:** Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India
*   **Telephone No:** 04426801580
*   **Mobile No:** 9884293869
*   **E-mail ID:** patents.sdc@saveetha.com

---

### 8. PARTICULARS OF CONVENTION APPLICATION (if any)
*   *Not Applicable.*

---

### 9. PARTICULARS OF INTERNATIONAL APPLICATION FILED UNDER PCT (if any)
*   *Not Applicable.*

---

### 10. PARTICULARS OF DIVISIONAL APPLICATION FILED UNDER SECTION 16 (if any)
*   *Not Applicable.*

---

### 11. PARTICULARS OF PATENT OF ADDITION FILED UNDER SECTION 54 (if any)
*   *Not Applicable.*

---

### 12. DECLARATIONS

#### Declaration by the applicant(s) – We the applicant(s) hereby declare(s) that:
*   [ ✓ ] We are in possession of the above-mentioned invention.
*   [ ✓ ] The complete specification relating to the invention is filed with this application.
*   [ – ] The invention as disclosed in the specification does not use any biological material from India requiring prior permission.
*   [ ✓ ] There is no lawful ground of objection(s) to the grant of the Patent to us.
*   [ ✓ ] We are the true & first inventor(s) / We are the assignee of the true & first inventor(s).
*   [ – ] Not based on a convention application, PCT national phase application, or divisional application.

---

### 13. FOLLOWING ARE THE ATTACHMENTS WITH THE APPLICATION
| Item | Details |
|---|---|
| **(a) Form 2 – Complete Specification** | No. of pages: as attached |
| **Claims** | No. of claims: 8, No. of pages: 1 |
| **Abstract** | No. of pages: 1 |
| **Drawings** | Not applicable |
| **(g) Statement and Undertaking – Form 3** | Attached |
| **(h) Declaration of Inventorship – Form 5** | Attached |
| **(i) Power of Authority** | Not applicable |

We hereby declare that to the best of my/our knowledge, information and belief the fact and matters stated herein are correct and I/We request that a patent may be granted to us for the said invention.

*   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
*   **Name:** Saveetha Institute of Medical and Technical Sciences
*   **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

To,
**The Controller of Patents**
The Patent Office, at Chennai, India.

---

## FORM 2
**THE PATENTS ACT, 1970 (39 OF 1970) & THE PATENTS RULES, 2003**
### COMPLETE SPECIFICATION
*[See Section 10 & rule 13]*

#### 1. TITLE OF THE INVENTION
**"SYSTEM AND METHOD FOR OFFLINE-FIRST MOBILE PLATFORM FOR REAL-TIME COMPUTER VISION-BASED PLANT DISEASE DIAGNOSIS AND METEOROLOGICAL-INTEGRATED AGRICULTURAL ADVISORY"**

#### 2. APPLICANT
| S.No | NAME | NATIONALITY | ADDRESS |
|---|---|---|---|
| 1 | Saveetha Institute of Medical and Technical Sciences | Indian | Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India |

#### 3. PREAMBLE TO THE DESCRIPTION
*The following specification describes the invention and the manner in which it is to be performed:*

---

### DESCRIPTION

#### FIELD OF THE INVENTION
The present invention relates generally to agricultural technology and mobile computing. More particularly, the invention relates to an offline-first system and method executed on mobile devices using React Native that utilizes client-side caching, local agronomical fallback engines, and cloud database synchronization to diagnose plant leaf diseases in real-time, generate localized meteorological advisories, and track grounded mandi prices.

#### BACKGROUND OF THE INVENTION
Smallholder farmers in rural regions face major obstacles when using digital agricultural tools. Standard crop disease diagnostic apps utilize machine learning and computer vision models hosted on remote servers. In agricultural zones with limited internet bandwidth or frequent network failures, these applications time out, leaving the farmer without diagnostic aid during critical inspection routines. 

A second limitation of existing tools is their lack of functional integration. Weather portals present raw physical metrics (e.g., humidity percentages or rainfall sums) without translating them into concrete agronomical advice, such as irrigation recommendations tailored to specific crops. Similarly, wholesale mandi price information portals list raw regional rates without providing predictive forecasts or sell/hold recommendations based on seasonal factors. 

Lastly, language barriers and literacy limitations block smallholders from reading long technical crop reports. There is a critical need for an integrated system that functions offline, provides automated agronomical translations, generates local market intelligence, and reads diagnostic instructions aloud using localized speech synthesis.

#### SUMMARY OF THE INVENTION
The present invention addresses these problems by providing an offline-resilient, geolocated, and search-grounded React Native mobile agricultural platform. The system operates on a hybrid data client that caches all remote transactions.

1.  **Offline Plant Scan & Caching:** The device camera captures leaf images. If online, the app converts the image to base64 and invokes a remote LLM API (Gemini 1.5 Flash) with computer vision to output a structured JSON containing disease name, severity, and treatments. If offline, the client accesses client storage and loads the last cached scan matching that crop, preventing application failure.
2.  **Meteorological advisory:** The system translates GPS parameters into town locations. It queries physical parameters from Open-Meteo and prompts Gemini to produce localized agronomist reports recommending specific irrigation volumes.
3.  **Search-Grounded Mandi Pricing:** Uses a search grounding tool to fetch real-time market commodity prices and produce AI-driven "SELL/HOLD" alerts.
4.  **Speech synthesis:** Narrates complex agronomical steps aloud in regional dialects.

---

### DETAILED DESCRIPTION OF THE PREFERRED EMBODIMENTS

The system architecture comprises a React Native Mobile Interface, a Local Client API Adapter, a Geolocation Module, a Web Speech Text-to-Speech Engine, and a write-ahead AsyncStorage/SQLite Cache.

```
       +------------------------------------------------------+
       |             React Native Mobile Interface            |
       +------------------------------------------------------+
           |                        |                       |
           v                        v                       v
+--------------------+   +--------------------+   +-------------------+
| Camera (Leaf Scan) |   | Geolocation GPS    |   | Mobile Speech TTS |
+--------------------+   +--------------------+   +-------------------+
           |                        |                       |
           +------------------------+-----------------------+
                                    |
                                    v
                       +-------------------------+
                       |    localClient.js       |
                       | (Hybrid Database Switch)|
                       +-------------------------+
                        /                       \
        (If Online)    /                         \ (If Offline)
                      v                           v
         +-------------------------+      +-----------------------+
         | Supabase PostgreSQL API |      | local database        |
         | & Google Gemini LLM     |      | Sandbox (AsyncStorage)|
         +-------------------------+      +-----------------------+
```

#### 1. Hybrid Client database Synchronization (`localClient.js`)
The local client acts as a query router. The write-ahead cache ensures that every user transaction (e.g. creating farmer profile, recording a leaf scan, setting price alert) is committed to client memory storage first. The client checks for an active internet connection. If online and Supabase database credentials exist, it performs REST actions to sync the data to remote PostgreSQL tables (`FarmerProfile`, `ScanHistory`, `Alert`, `PriceAlert`). If offline, the client marks the data as unsynced, queueing it for automatic upload upon reconnection.

#### 2. Visual Diagnosis Engine
The visual diagnosis module processes leaf captures:
1.  **Image Serialization:** Converts captured images to high-density base64 data.
2.  **Payload Dispatch:** Wraps the base64 string and a formatted agronomist prompt into a REST request to the Gemini API.
3.  **JSON Parser:** Demands the API return output in a precise JSON schema containing keys for `is_healthy`, `disease_name`, `severity`, `treatment_steps`, and `prevention_tips`.
4.  **Fallback Engine:** If the endpoint is unreachable, it initiates a local agronomical lookup table matching the crop to predefined common disease profiles.

#### 3. Geolocation & Meteorological localization
The app captures the mobile device's physical coordinates. It queries the Open-Meteo API using coordinates. The physical metrics are compiled with coordinates into an agronomist prompt, geocoding coordinates into town names, and translating metrics into a localized 7-day crop care guide.

#### 4. Grounded Mandi Prices
For market price feeds, the client sets `add_context_from_internet: true` which activates search grounding. The LLM conducts real-time web searches to match Indian commodity rates. It returns modal rates alongside an analysis recommending optimal sell windows.

---

### CLAIMS

**We Claim:**

1.  A system for offline-first agricultural diagnostics and crop advisory, comprising:
    *   an image capturing module on a mobile device configured to photograph plant leaves;
    *   a geolocation module configured to retrieve physical latitude and longitude coordinates;
    *   a hybrid client database module configured to route read and write queries;
    *   a local sandbox database store (AsyncStorage/SQLite) configured to cache user profiles, scan histories, alerts, and commodity price records; and
    *   a remote API module hosting a computer vision large language model (LLM) and database backend.
2.  The system as claimed in claim 1, wherein the hybrid client database module executes a write-ahead strategy that commits all crop scans and profile edits to the local sandbox database store prior to initiating a remote network transaction.
3.  The system as claimed in claim 2, wherein the hybrid client database module detects a loss of network connectivity and continues to operate fully offline by reading cached scan reports and queueing newly logged items as unsynced entities.
4.  The system as claimed in claim 1, wherein the visual diagnosis is processed online by converting the leaf image into a base64 string, dispatching the string to the remote LLM API, and enforcing a structured JSON response schema containing diagnostic metrics and sequential treatment steps.
5.  The system as claimed in claim 4, wherein the hybrid database module includes an agronomical fallback engine configured to intercept API failures and return simulated diagnostic profiles from local memory.
6.  The system as claimed in claim 1, wherein the geolocation module geocodes raw latitude and longitude coordinates into town names and localizes weather metrics by running meteorological prompts through the remote LLM API.
7.  The system as claimed in claim 1, wherein the market intelligence module activates search grounding tools inside the remote LLM API to query external search engines for live wholesale mandi rates, outputting a predictive commodity alert.
8.  The system as claimed in claim 1, wherein the device interface includes a text-to-speech module linked to a speech synthesis engine that reads agronomical treatments aloud in a dialect selected in the farmer's profile settings.

---

### ABSTRACT
**"SYSTEM AND METHOD FOR OFFLINE-FIRST MOBILE PLATFORM FOR REAL-TIME COMPUTER VISION-BASED PLANT DISEASE DIAGNOSIS AND METEOROLOGICAL-INTEGRATED AGRICULTURAL ADVISORY"**

The invention provides an offline-first system and method for plant disease diagnosis and agricultural crop advisory. The system runs on a React Native mobile client utilizing a hybrid data client that caches transactions locally inside a local client storage sandbox (AsyncStorage/SQLite). When online, the system processes captured leaf photos using a remote computer-vision LLM API (Gemini 1.5 Flash) to generate detailed organic treatment steps, and integrates physical location inputs with weather forecasts to suggest crop-specific irrigation adjustments. When offline, the system falls back onto local cached data and predefined agronomical lookup engines. The system further utilizes search-grounded LLM prompts to extract real-time regional mandi wholesale rates and provides text-to-speech audio narration in 24 regional languages to assist farmers with reading limitations.

---

## FORM 5
**THE PATENTS ACT, 1970 (39 of 1970) & THE PATENTS RULES, 2003**
### DECLARATION AS TO INVENTORSHIP
*[See Section 10 (6); rule 13(6)]*

We, **Saveetha Institute of Medical and Technical Sciences**, hereby declare that the true and first inventors of the invention disclosed in the complete specification filed in pursuance of our application are:

1.  **Dr. Jaya Mebal Rani** (Indian)
    *   Address: Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India.
2.  **B Vijay Kumar (Reg. No.192324210)** (Indian)
    *   Address: Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India.

*   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
*   **Name:** Saveetha Institute of Medical and Technical Sciences
*   **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

To,
**The Controller of Patents**
The Patent Office, at Chennai, India.

---

## FORM 9
**THE PATENTS ACT, 1970 (39 of 1970) & THE PATENTS RULES, 2003**
### REQUEST FOR PUBLICATION
*[See Section 11A (2); rule 24A]*

1.  **Name, Address and Nationality of the Applicant(s):**
    *   Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India. Indian.
2.  **Request:**
    *   We hereby request for early publication of our application for Patent under Sec 11A (2) of the Act.

*   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
*   **Name:** Saveetha Institute of Medical and Technical Sciences
*   **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

To,
**The Controller of Patents**
The Patent Office, at Chennai, India.

---

## FORM 18
**THE PATENTS ACT, 1970 (39 of 1970) & THE PATENTS RULES, 2003**
### REQUEST FOR EXAMINATION OF APPLICATION FOR PATENT
*[See SECTION 11B and rule 20(4) (ii), 24B(1)(i)]*

1.  **Application No / Filing Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2.  **Title of the Invention:**
    *   "SYSTEM AND METHOD FOR OFFLINE-FIRST MOBILE PLATFORM FOR REAL-TIME COMPUTER VISION-BASED PLANT DISEASE DIAGNOSIS AND METEOROLOGICAL-INTEGRATED AGRICULTURAL ADVISORY"
3.  **Name, Address and Nationality of the Applicant(s):**
    *   Saveetha Institute of Medical and Technical Sciences, Saveetha Nagar, Thandalam, Chennai - 602 105, Tamil Nadu, India. Indian.
4.  **Request:** 
    *   We hereby request that our application for patent for the invention shall be examined under sections 12 and 13 of the Act.

*   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
*   **Name:** Saveetha Institute of Medical and Technical Sciences
*   **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

To,
**The Controller of Patents**
The Patent Office, at Chennai, India.
