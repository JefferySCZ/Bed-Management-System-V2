//Adds data to a specified store in the database. Returns the key of the added data.
async function addData(storeName, data) {
  return new Promise((resolve, reject) => {
    // Start a new transaction with the specified store
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Add the data to the store
    const request = store.add(data)

    // Resolve the Promise with the result of adding the data
    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    // Reject the Promise with an error if there was an issue adding the data
    request.onerror = function (event) {
      reject(
        new Error(`Error adding data to ${storeName}: ${event.target.error}`)
      )
    }
  })
}

//Retrieve all data from a specified store in the database.
function getData(storeName) {
  return new Promise((resolve, reject) => {
    // Start a transaction with the specified store in read-only mode
    const transaction = db.transaction([storeName], 'readonly')

    // Get the object store from the transaction
    const store = transaction.objectStore(storeName)

    // Create a request to retrieve all data from the store
    const request = store.getAll()

    // Handle successful retrieval of data
    request.onsuccess = function (event) {
      // Resolve the promise with the retrieved data
      resolve(event.target.result)
    }

    // Handle error while fetching data
    request.onerror = function (event) {
      reject('Error fetching data from ' + storeName)
    }
  })
}

//Updates the bed number of a patient in the database.
async function updatePatientWithBedNumber(patientID, bedNumber) {
  try {
    // Start a transaction
    const transaction = db.transaction(['Patients'], 'readwrite')
    const patientStore = transaction.objectStore('Patients')

    // Get the patient with the given ID
    const getPatientRequest = patientStore.get(patientID)
    const storedPatient = await new Promise((resolve, reject) => {
      getPatientRequest.onsuccess = () => resolve(getPatientRequest.result)
      getPatientRequest.onerror = (event) => reject(event)
    })

    // Update the bed number of the patient
    storedPatient.bedNumber = bedNumber

    // Update the patient in the database
    await new Promise((resolve, reject) => {
      const updateRequest = patientStore.put(storedPatient)
      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = (event) => reject(event)
    })
  } catch (error) {
    throw error
  }
}

//Retrieves data from the wait list store.
function getWaitListData(storeName, key) {
  return new Promise((resolve, reject) => {
    // Open a readonly transaction on the specified store
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)

    // Retrieve the data with the specified key
    const request = store.get(key)

    // Resolve the promise with the retrieved data
    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    // Reject the promise with an error message
    request.onerror = function (event) {
      reject('Error fetching data from ' + storeName)
    }
  })
}
