//Create the database
let db
function initDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('BedManagementDB', 1)

    // Create the schema
    request.onupgradeneeded = function (event) {
      try {
        db = event.target.result

        // Create Patient object store
        if (!db.objectStoreNames.contains('Patients')) {
          const patients = db.createObjectStore('Patients', {
            keyPath: 'patientID',
          })
          patients.createIndex('name', 'name', { unique: false })
          patients.createIndex('gender', 'gender', { unique: false })
          patients.createIndex('bloodType', 'bloodType', { unique: false })
          patients.createIndex('dob', 'dob', { unique: false })
          patients.createIndex('age', 'age', { unique: false })
          patients.createIndex('illness', 'illness', { unique: false })
          patients.createIndex('wardCategory', 'wardCategory', {
            unique: false,
          })
        }

        // Create Beds object store
        if (!db.objectStoreNames.contains('Beds')) {
          const beds = db.createObjectStore('Beds', {
            keyPath: 'bedNumber',
          })
          beds.createIndex('patientID', 'patientID', { unique: true })
          beds.createIndex('wardCategory', 'wardCategory', { unique: false })
        }

        if (!db.objectStoreNames.contains('WaitList')) {
          const waitList = db.createObjectStore('WaitList', {
            keyPath: 'waitListID',
            autoIncrement: true,
          })
          waitList.createIndex('patientID', 'patientID', { unique: true })
        }
      } catch (error) {
        console.log('An error occurred during database upgrade:', error)
        reject('There was an error during database upgrade')
      }
    }

    request.onsuccess = function (event) {
      try {
        console.log('Database opened successfully')
        db = event.target.result
        resolve()
      } catch (error) {
        console.log('An error occurred while opening the database:', error)
        reject('There was an error while opening the database')
      }
    }

    request.onerror = function (event) {
      console.log(
        'There was an error opening the database:',
        event.target.error
      )
      reject('There was an error opening the database')
    }
  })
}

//DOM
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM is ready')

  initDB()
    .then(() => {
      const initialPatientID = generateRandomID()
      document.getElementById('patient-ID').value = initialPatientID
      return refreshDatabase()
    })
    .then(() => {
      console.log('Database refreshed successfully')
    })
    .catch((error) => {
      console.error('Error refreshing the database:', error)
    })
})

async function refreshDatabase() {
  try {
    // Fetch data from Patients and WaitList object stores
    const patients = await getData('Patients')
    const waitingPatients = await getData('WaitList')

    // Check if the fetched data is valid
    if (!patients) {
      throw new Error('Failed to fetch patients')
    }
    if (!waitingPatients) {
      throw new Error('Failed to fetch waiting patients')
    }

    console.log('Patients:', patients)
    console.log('Waiting Patients:', waitingPatients)

    // Handle patients with bed numbers or assign available beds
    for (const currentPatient of patients) {
      if (!currentPatient) {
        console.warn('Invalid patient record:', currentPatient)
        continue // Skip to next iteration
      }

      if (currentPatient.bedNumber) {
        markBedAsOccupied(currentPatient.bedNumber)
      } else {
        const bedNumber = findAvailableBed()
        if (bedNumber) {
          assignBedToPatient(
            currentPatient,
            bedNumber,
            currentPatient.wardCategory
          )
        } else {
          console.log('No available beds, adding patient to waiting list')
          addToWaitingList(currentPatient)
        }
      }
    }

    // Populate the waiting list
    const waitingList = document.querySelector('.waiting-list ul')
    if (!waitingList) {
      throw new Error('Failed to find waiting list element')
    }

    waitingPatients.forEach((patientData) => {
      if (!patientData) {
        console.warn('Invalid patient data:', patientData)
        return // Skip to next iteration
      }
      const patient = patientData
      const li = document.createElement('li')
      li.textContent = `ID: ${patient.patientID}, Name: ${patient.name} (Category: ${patient.wardCategory})`

      if (patient.bedNumber) {
        const bedInfo = document.createElement('span')
        bedInfo.textContent = `(Assigned Bed #${patient.bedNumber})`
        bedInfo.classList.add('bed-info')
        li.appendChild(bedInfo)
      }

      waitingList.appendChild(li)
    })
  } catch (error) {
    console.error('Error refreshing the database:', error)
  }
}

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
    const patientID = await addData('WaitList', patient)
    await addToWaitingList(patientID, patient)
    console.log(`No bed available for ${patient.name}. Added to waiting list.`)
  }
}

async function updatePatientWithBedNumber(patientID, bedNumber) {
  try {
    const transaction = db.transaction(['Patients'], 'readwrite')
    const patientStore = transaction.objectStore('Patients')
    const getPatientRequest = patientStore.get(patientID)

    const storedPatient = await new Promise((resolve, reject) => {
      getPatientRequest.onsuccess = () => resolve(getPatientRequest.result)
      getPatientRequest.onerror = (event) => reject(event)
    })

    storedPatient.bedNumber = bedNumber

    await new Promise((resolve, reject) => {
      const updateRequest = patientStore.put(storedPatient)

      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = (event) => reject(event)
    })
  } catch (error) {
    throw error
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
function isWardFull() {
  const allBeds = document.querySelectorAll('.bed-sheet')
  for (let bed of allBeds) {
    if (bed.dataset.occupied === 'false') {
      console.log('Ward is full')
      return false
    }
  }
  return true
}

function findAvailableBed() {
  const allBeds = document.querySelectorAll('.bed-sheet')
  for (let bed of allBeds) {
    if (bed.dataset.occupied === 'false') {
      return bed.dataset.bedNumber
    }
  }
  return null
}

const BED_CONFIG = {
  'Intensive Care': { startNum: 101, count: 2 },
  'Infectious Disease': { startNum: 201, count: 10 },
  'General Care': { startNum: 301, count: 20 },
}

async function assignBedToPatient(wardCategory) {
  console.log('Trying to assign bed for ward category:', wardCategory)

  if (!wardCategory || !BED_CONFIG[wardCategory]) {
    console.error('Invalid ward category:', wardCategory)
    return null
  }

  const { startNum, count } = BED_CONFIG[wardCategory]
  const endNum = startNum + count - 1

  try {
    for (let i = startNum; i <= endNum; i++) {
      const isOccupied = await isBedOccupied(i)
      console.log(`Is bed ${i} occupied?`, isOccupied)
      if (!isOccupied) {
        await markBedAsOccupied(i)
        return i
      }
    }
  } catch (error) {
    console.error('Error checking occupancy for:', error)
    throw error
  }

  return null
}

// Mark the bed status as occupied
async function markBedAsOccupied(bedNumber, patientID, wardCategory) {
  const bedElement = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )
  const patientIDElement = document.querySelector('#patient-ID')
  const wardCategoryElement = document.querySelector('#patient-wardCategory')
  if (bedElement) {
    bedElement.classList.remove('available')
    bedElement.classList.add('occupied')
    bedElement.dataset.occupied = 'true'

    const dischargeButton = bedElement.querySelector('.discharge-btn')
    if (dischargeButton) {
      dischargeButton.style.display = 'block'
    }
  }

  const transaction = db.transaction(['Beds'], 'readwrite')
  const bedStore = transaction.objectStore('Beds')

  const bedData = {
    bedNumber,
    occupied: true,
    patientID,
    wardCategory: wardCategory,
  }

  try {
    const bedUpdateRequest = bedStore.put(bedData)
    bedUpdateRequest.addEventListener('success', () => {
      console.log('Bed successfully marked as occupied')
    })
    bedUpdateRequest.onerror = (event) => {
      console.error('Error marking bed as occupied', event)
    }
  } catch (error) {
    console.error('Error updating bed status in the database', error)
  }
}

async function isBedOccupied(bedNumber) {
  try {
    const transaction = db.transaction(['Beds'], 'readonly')
    const store = transaction.objectStore('Beds')
    const request = store.get(bedNumber)

    const event = await new Promise((resolve, reject) => {
      request.onsuccess = resolve
      request.onerror = reject
    })

    if (!event.target.result) {
      // Bed is not occupied
      return false
    } else {
      // Bed is occupied
      return true
    }
  } catch (error) {
    console.error('Error checking bed occupancy:', error)
    throw error
  }
}

async function addToWaitingList(patient) {
  const waitingList = document.querySelector('.waiting-list ul')
  if (!waitingList) {
    throw new Error('Cannot find the element with class "waiting-list ul"')
  }
  if (!patient) {
    console.error('Patient object is undefined')
    return
  }
  const li = document.createElement('li')
  li.textContent = `ID: ${patient.patientID}, Name: ${patient.name} (Category: ${patient.wardCategory})`

  if (patient.bedNumber) {
    const bedInfo = document.createElement('span')
    bedInfo.textContent = `(Assigned Bed #${patient.bedNumber})`
    bedInfo.classList.add('bed-info')
    li.appendChild(bedInfo)
  }
  waitingList.appendChild(li)
}

async function admitPatient() {
  const waitingList = document.querySelector('.waiting-list ul')
  const admittedPatientLi = waitingList.firstChild

  if (!admittedPatientLi) {
    console.log('No patients in the waiting list.')
    return
  }

  // Remove the patient from the UI waiting list
  waitingList.firstChild.remove()

  // Extract patientID from the list item, assuming it starts with "ID: "
  const admittedPatientText = admittedPatientLi.textContent
  const patientID = admittedPatientText.split(',')[0].split(': ')[1]

  // Remove the patient from the WaitList object store
  const waitListTransaction = db.transaction(['WaitList'], 'readwrite')
  const waitListStore = waitListTransaction.objectStore('WaitList')
  await waitListStore.delete('waitListID')
  const bedElement = document.querySelector('.bed-sheet.occupied')
  const bedNumber = bedElement.getAttribute('data-bed-number')

  if (bedNumber !== null) {
    console.log(
      `Patient with ID ${patientID} has been admitted and assigned to bed #${bedNumber}`
    )
  } else {
    console.log('Could not admit patient, no available beds.')
  }
}

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
// Refactored version of the addData function

async function addData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(data)

    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    request.onerror = function (event) {
      reject(
        new Error(`Error adding data to ${storeName}: ${event.target.error}`)
      )
    }
  })
}

function getData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    request.onerror = function (event) {
      reject('Error fetching data from' + storeName)
    }
  })
}
