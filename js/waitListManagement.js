// Adds a patient to the waiting list.

async function addToWaitingList(patient) {
  // Find the waiting list element
  const waitingList = document.querySelector('.waiting-list ul')

  if (!waitingList) {
    throw new Error('Cannot find the element with class "waiting-list ul"')
  }

  if (!patient) {
    console.error('Patient object is undefined')
    return
  }

  // Create a list item element
  const li = document.createElement('li')
  li.classList.add('patient-name-list')

  // Create a span element for the patient ID,name and wardCategory set its text content
  const idSpan = document.createElement('span')
  idSpan.textContent = `ID: ${patient.patientID}`
  idSpan.classList.add('patient-id')

  const nameSpan = document.createElement('span')
  nameSpan.textContent = `Name: ${patient.name}`
  nameSpan.classList.add('patient-name')

  const categorySpan = document.createElement('span')
  categorySpan.textContent = `Category: ${patient.wardCategory}`
  categorySpan.classList.add('patient-category')

  // Append the span elements to the list item element
  li.appendChild(idSpan)
  li.appendChild(nameSpan)
  li.appendChild(categorySpan)

  // Append the list item element to the waiting list
  waitingList.appendChild(li)
}

//Admits a patient from the waiting list to a bed.

async function admitPatient(patient) {
  try {
    // Get patient data from the 'WaitList' Object Store
    const patientDataArray = await getData('WaitList', patient)
    console.log('patientData:', patientDataArray)
    const patientData = patientDataArray[0]
    console.log('Selected patientData:', patientData)

    // If there are no patients in the waiting list, return
    if (!patientDataArray || patientDataArray.length === 0) {
      console.log('No patients in the waiting list.')
      return
    }
    // Assign a bed to the patient
    const bedNumber = await assignBedToPatient(
      patientData,
      patientData.wardCategory
    )
    if (!bedNumber) {
      alert(`No bed available for ${patientData.name} for now.`)
      console.log('No available Bed')
      return
    }
    bedOccupancyTime(patientData.patientID, bedNumber)

    // Get the first patient in the waiting list
    const waitingList = document.querySelector('.waiting-list ul')
    const admittedPatientLi = waitingList.firstChild

    // If there are no patients in the waiting list, return
    if (!admittedPatientLi) {
      console.log('No patients in the waiting list.')
      return
    }

    // Remove the first patient from the waiting list
    waitingList.firstChild.remove()

    // Get the patient ID from the admitted patient text
    const admittedPatientText = admittedPatientLi.textContent
    const waitListPatientID = admittedPatientText.split(', ')[0].split(': ')[1]
    console.log(waitListPatientID)

    if (!patientData) {
      console.log('No Patient in the wait list')
      return
    }

    // Add the patient to the 'Patients' database
    const patientTransaction = db.transaction(['Patients'], 'readwrite')
    const patientStore = patientTransaction.objectStore('Patients')
    const patientRequest = await patientStore.put({
      bedNumber,
      ...patientData,
    })

    patientRequest.onsuccess = () => {
      console.log(
        'Patient added to database successfully',
        patientRequest.result
      )
    }

    patientRequest.onerror = () => {
      console.log('Failed to add patient to database', patientRequest.error)
    }

    // Delete patient from 'WaitList'
    const waitListTransaction = db.transaction(['WaitList'], 'readwrite')
    const waitListStoreDelete = waitListTransaction.objectStore('WaitList')
    const waitListIndexDelete = waitListStoreDelete.index('patientID')
    const waitListRequestDelete = waitListIndexDelete.getKey(
      patientData.patientID
    )

    waitListRequestDelete.onsuccess = () => {
      const waitListKey = waitListRequestDelete.result
      if (waitListKey != undefined) {
        waitListStoreDelete.delete(waitListKey)
        console.log('Patient has been removed from the waiting list')
      }
    }
    waitListRequestDelete.onerror = () => {
      console.log(
        'Error deleting patient from WaitList database:',
        waitListRequestDelete.error
      )
    }

    console.log('Patient has been removed from the waiting list')
  } catch (error) {
    console.error('Occurred an error:', error)
  }
}
