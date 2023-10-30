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

async function updateData(storeName, data) {
  try {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    await store.put(data)
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(
      new Error(`Error adding data to ${storeName}: ${error}`)
    )
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

function getWaitListData(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    request.onerror = function (event) {
      reject('Error fetching data from' + storeName)
    }
  })
}
