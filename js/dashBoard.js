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
          patients.createIndex('bedNumber', 'bedNumber', {
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
    const patients = await getData('Beds')
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

      if (currentPatient.bedNumber && currentPatient.occupied) {
        markBedAsOccupied(
          currentPatient.bedNumber,
          currentPatient.patientID,
          currentPatient.wardCategory
        )
      } else {
        const bedNumber = findAvailableBed()
        console.log(bedNumber)
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

      li.classList.add('patient-name-list')
      const idSpan = document.createElement('span')
      idSpan.textContent = `ID: ${patient.patientID}`
      idSpan.classList.add('patient-id')

      const nameSpan = document.createElement('span')
      nameSpan.textContent = `Name: ${patient.name}`
      nameSpan.classList.add('patient-name')

      const categorySpan = document.createElement('span')
      categorySpan.textContent = `Category: ${patient.wardCategory}`
      categorySpan.classList.add('patient-category')

      li.appendChild(idSpan)
      li.appendChild(nameSpan)
      li.appendChild(categorySpan)
      waitingList.appendChild(li)
    })
  } catch (error) {
    console.error('Error refreshing the database:', error)
  }
}
