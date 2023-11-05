//Create (Add Patient)
// Function to get patient details from form
function resetForm() {
  const form = document.querySelector('#patient-admission-form')
  const patientIDInput = document.querySelector('#patient-ID')

  // Save the patient ID value before resetting the form
  const patientID = patientIDInput.value

  // Reset the form, excluding the patient ID input field
  form.reset()

  // Restore the patient ID value
  patientIDInput.value = patientID
}

//Generates a random ID.
function generateRandomID() {
  const MAX_ID_VALUE = 10000 // Maximum value for the random ID
  const prefix = 'PAT_' // Prefix for the generated ID

  const randomID = prefix + Math.floor(Math.random() * MAX_ID_VALUE)

  return randomID
}

// Retrieves the details of a patient from the input fields.
function getPatientDetails() {
  return {
    patientID: document.getElementById('patient-ID').value,
    name: document.getElementById('patient-name').value,
    gender: document.getElementById('patient-gender').value,
    bloodType: document.getElementById('patient-bloodType').value,
    dob: document.getElementById('patient-DOB').value,
    age: document.getElementById('patient-age').value,
    illness: document.getElementById('patient-illness').value,
    wardCategory: document.getElementById('patient-category').value,
  }
}

// Function to validate patient age
function isValidAge(age) {
  return !(age === 'Invalid DOB' || age === 'Age exceeds valid range')
}

//Handles the processing of a valid patient.
async function handleValidPatient(patient) {
  // Create patient status element
  const { li: patientLi } = createPatientStatus(
    patient.patientID,
    'Awaiting Admission',
    60
  )

  // Delay admission time
  await delay(ADMISSION_TIME)

  // Remove patient status element
  patientLi.remove()

  // Assign bed to patient
  const bedNumber = await assignBedToPatient(patient, patient.wardCategory)

  if (bedNumber) {
    // Update bed occupancy time
    bedOccupancyTime(patient.patientID, bedNumber)

    // Add patient data
    await addData('Patients', patient)

    // Update patient with bed number
    updatePatientWithBedNumber(patient.patientID, bedNumber)

    // Log assigned bed number
    console.log(`Assigned Bed #${bedNumber} to ${patient.name}`)
  } else {
    // if no bed, Add patient to wait list object store
    await addData('WaitList', patient)
    await addToWaitingList(patient)

    // Log and display message for no available bed
    console.log(`No bed available for ${patient.name}. Added to waiting list.`)
    alert(`No bed available for ${patient.name}. Added to waiting list.`)
  }
}

//Check if the given ID is unique in the 'Patients' object store.
async function isUniqueID(id) {
  const transaction = db.transaction(['Patients'], 'readonly')
  const store = transaction.objectStore('Patients')
  const request = store.get(id)

  const result = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)

    request.onerror = (event) => reject(event)
  })

  return result === undefined
}

//Adds a patient to the system.
async function addPatient() {
  // Get patient details
  const patient = getPatientDetails()

  // Check if patient ID is unique, generate random ID until it is unique
  let isUnique = await isUniqueID(patient.patientID)
  while (!isUnique) {
    patient.patientID = generateRandomID()
    isUnique = await isUniqueID(patient.patientID)
  }

  // If the patient age is valid, handle the patient and store it in the local storage
  if (isValidAge(patient.age)) {
    await handleValidPatient(patient)
    const existingPatients = JSON.parse(localStorage.getItem('patients')) || []
    existingPatients.push(patient)
    localStorage.setItem('patients', JSON.stringify(existingPatients))
  } else {
    // Log an error and show an alert if the age or DOB is invalid
    console.error('Cannot add patient with invalid age or DOB')
    alert('Invalid DOB or age. Please check and try again')
  }
}

// Get the patient admission form element
const patientAdmissionForm = document.getElementById('patient-admission-form')

// Check if the patient admission form exists
if (patientAdmissionForm) {
  patientAdmissionForm.addEventListener('submit', async function (event) {
    event.preventDefault()

    // Call the addPatient function
    addPatient()
    this.reset()
    document.getElementById('patient-ID').value = generateRandomID()
  })
}

//Discharge a patient from the system and update the UI
async function dischargePatient(bedNumber) {
  const transaction = db.transaction(['Beds'], 'readonly')
  const bedStore = transaction.objectStore('Beds')
  const bedRequest = bedStore.get(Number(bedNumber))

  await new Promise((resolve, reject) => {
    bedRequest.onsuccess = function (event) {
      const bedRecord = event.target.result

      if (bedRecord) {
        if (bedRecord.patientID) {
          patientID = bedRecord.patientID
        } else if (bedRecord.patient && bedRecord.patient.patientID) {
          patientID = bedRecord.patient.patientID
        }
      }

      resolve()
    }

    bedRequest.onerror = reject
  })

  if (!patientID) {
    console.warn(`No patientID found for bed number ${bedNumber}`)
    return
  }

  const patientTransaction = db.transaction(['Patients'], 'readwrite')
  const patientStore = patientTransaction.objectStore('Patients')
  const patientRequest = patientStore.delete(patientID)

  patientRequest.onsuccess = () => {
    console.log(`Patient with ID ${patientID} has been removed`)
  }

  patientRequest.onerror = () => {
    console.error('Failed to remove patient')
  }
  //Delete the Patient data from the 'Beds' object store
  const bedTransaction = db.transaction(['Beds'], 'readwrite')
  const bedStoreDelete = bedTransaction.objectStore('Beds')
  const bedIndexDelete = bedStoreDelete.index('patientID')
  const bedRequestDelete = bedIndexDelete.getKey(patientID)

  bedRequestDelete.onsuccess = () => {
    const bedKey = bedRequestDelete.result
    if (bedKey != undefined) {
      bedStoreDelete.delete(bedKey)
      console.log(`Bed number ${bedNumber} has been freed`)
    }
  }

  bedRequestDelete.onerror = () => {
    console.error('Failed to free bed')
  }
  console.log(`Patient in bed ${bedNumber} has been discharged`)
  const bed = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )
  const dischargeButton = bed.querySelector('.discharge-btn')

  if (dischargeButton) {
    dischargeButton.style.display = 'none'
  }
  //After discharge, update the UI to pending sanitizing, sanitizing, and available
  //Update the bed UI and simulation UI at the same time
  if (bed) {
    bed.classList.remove('occupied')
    bed.classList.add('pending-sanitizing')
    bed.dataset.occupied = 'true'
  }
  const { li: sanitizingLi } = createBedStatus(
    bedNumber,
    'Pending Sanitizing',
    60
  )
  await delay(PENDING_SANITIZING_TIME)
  sanitizingLi.remove()

  if (bed) {
    bed.classList.remove('pending-sanitizing')
    bed.classList.add('sanitizing')
    bed.dataset.occupied = 'true'
  }
  const { li: sanitizingLi2 } = createBedStatus(
    bedNumber,
    'Bed Sanitizing',
    120
  )

  await delay(SANITIZING_TIME)
  sanitizingLi2.remove()

  if (bed) {
    bed.classList.remove('sanitizing')
    bed.classList.add('available')
    bed.dataset.occupied = 'false'
  }

  const { li: sanitizingLi3 } = createLatestBedStatus(
    bedNumber,
    'Available Now'
  )
  await delay(BED_AVAILABILITY_STATUS)
  sanitizingLi3.remove()
}

//Retrieves a patient by their bed number.
async function getPatientByBedNumber(bedNumber) {
  try {
    const transaction = db.transaction('Patients', 'readonly')
    const objectStore = transaction.objectStore('Patients')
    const request = objectStore.index('bedNumber').get(Number(bedNumber))

    const result = await new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        if (event.target.result) {
          console.log('PatientData:', event.target.result)
          resolve(event.target.result)
        } else {
          reject('No patient found with that bedNumber')
        }
      }

      request.onerror = (event) => {
        reject('Error retrieving data: ' + event.target.error)
      }
    })

    return result
  } catch (error) {
    throw new Error('Error retrieving patient by bedNumber: ' + error)
  }
}
