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
}

async function admitPatient(patient) {
  try {
    const patientDataArray = await getData('WaitList', patient)
    console.log('patientData:', patientDataArray)
    const patientData = patientDataArray[0]
    console.log('Selected patientData:', patientData)

    if (!patientDataArray || patientDataArray.length === 0) {
      console.log('No patients in the waiting list.')
      return
    }

    const waitingList = document.querySelector('.waiting-list ul')
    const admittedPatientLi = waitingList.firstChild

    if (!admittedPatientLi) {
      console.log('No patients in the waiting list.')
      return
    }

    const bedNumber = await assignBedToPatient(patientData.wardCategory)

    if (!bedNumber) {
      alert(`No bed available for ${patientData.name}for now.`)
      console.log('No available Bed')
      return
    }

    waitingList.firstChild.remove()

    const admittedPatientText = admittedPatientLi.textContent
    const waitListPatientID = admittedPatientText.split(', ')[0].split(': ')[1]
    console.log(waitListPatientID)

    if (!patientData) {
      console.log('No Patient in the wait list')
      return
    }

    const patientID = await addData('Patients', patientData)
    await markBedAsOccupied(bedNumber, patientID, patientData.wardCategory)

    //Delete Patient from 'WaitList'
    const waitListTransaction = db.transaction(['WaitList'], 'readwrite')
    const waitListStoreDelete = waitListTransaction.objectStore('WaitList')
    const waitListIndexDelete = waitListStoreDelete.index('patientID')
    const waitListRequestDelete = waitListIndexDelete.getKey(patientID)

    waitListRequestDelete.onsuccess = () => {
      const waitListKey = waitListRequestDelete.result
      if (waitListKey != undefined) {
        waitListStoreDelete.delete(waitListKey)
        console.log('Patient deleted from database successfully')
      }
    }

    console.log(
      `Patient ID ${patientID} has been admitted， and assigned to bed #${bedNumber}`
    )
  } catch (error) {
    console.error('Occurred an error:', error)
  }
}
