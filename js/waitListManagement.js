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

async function admitPatient(patient) {
  try {
    const patientDataArray = await getData('WaitList', patient)
    console.log('patientData:', patientDataArray)

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

    waitingList.firstChild.remove()

    const admittedPatientText = admittedPatientLi.textContent
    const waitListPatientID = admittedPatientText.split(', ')[0].split(': ')[1]
    console.log(waitListPatientID)

    const patientData = patientDataArray[0]
    console.log('Selected patientData:', patientData)

    if (!patientData) {
      console.log('No Patient in the wait list')
      return
    }

    const bedNumber = await assignBedToPatient(patientData.wardCategory)

    if (!bedNumber) {
      console.log('No available Bed')
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
