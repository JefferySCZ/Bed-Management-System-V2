//Create (Add Patient)
// Function to get patient details from form
const MAX_ID_VALUE = 1000
function generateRandomID() {
  return 'PAT_' + Math.floor(Math.random() * MAX_ID_VALUE)
}

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

// Function to handle valid patient
async function handleValidPatient(patient) {
  const bedNumber = await assignBedToPatient(patient.wardCategory)

  if (bedNumber) {
    const patientID = await addData('Patients', patient)
    updatePatientWithBedNumber(patientID, bedNumber)
    markBedAsOccupied(bedNumber, patientID, patient.wardCategory)
    console.log(`Assigned Bed #${bedNumber} to ${patient.name}`)
  } else {
    await addData('WaitList', patient)
    await addToWaitingList(patient)
    console.log(`No bed available for ${patient.name}. Added to waiting list.`)
  }
}

async function isUniqueID(id) {
  const transaction = db.transaction(['Patients'], 'readonly')
  const store = transaction.objectStore('Patients')
  const request = store.get(id)

  const result = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = (event) => reject(event)
  })

  return result === undefined // returns true if ID is unique
}

// Main function to add patient
async function addPatient() {
  const patient = getPatientDetails()

  let isUnique = await isUniqueID(patient.patientID)
  while (!isUnique) {
    patient.patientID = generateRandomID()
    isUnique = await isUniqueID(patient.patientID)
  }

  if (isValidAge(patient.age)) {
    await handleValidPatient(patient)
  } else {
    console.error('Cannot add patient with invalid age or DOB')
    alert('Invalid DOB or age. Please check and try again')
  }
}

document
  .getElementById('patient-admission-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault()
    addPatient()
    this.reset()
    document.getElementById('patient-ID').value = generateRandomID()
  })

async function dischargePatient(bedNumber) {
  const bed = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )

  if (!bed) {
    console.warn(`No bed found with bed number ${bedNumber}`)
    return
  }

  bed.classList.remove('occupied')
  bed.classList.add('available')

  const dischargeButton = bed.querySelector('.discharge-btn')

  if (dischargeButton) {
    dischargeButton.style.display = 'none'
  }

  console.log(`Patient in bed ${bedNumber} has been discharged`)

  const transaction = db.transaction(['Beds'], 'readonly')

  const bedStore = transaction.objectStore('Beds')
  console.log('Bed Store:', bedStore)

  const bedRequest = bedStore.get(Number(bedNumber))
  console.log('Bed Request:', bedRequest)

  let patientID

  await new Promise((resolve, reject) => {
    bedRequest.onsuccess = function (event) {
      const bedRecord = event.target.result // This should be the full record for the bed

      if (bedRecord) {
        if (bedRecord.patientID) {
          patientID = bedRecord.patientID
        } else if (bedRecord.patient && bedRecord.patient.patientID) {
          patientID = bedRecord.patient.patientID // Nested patient object
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
}
