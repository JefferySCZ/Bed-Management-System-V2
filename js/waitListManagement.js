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
  const waitList_patient = getData('WaitList', patient)
  console.log('PatientLA :', waitList_patient)

  const waitingList = document.querySelector('.waiting-list ul')
  const admittedPatientLi = waitingList.firstChild

  if (!admittedPatientLi) {
    console.log('No patients in the waiting list.')
    return
  }
  isWardFull()
  findAvailableBed()
  const BED_CONFIG = {
    'Intensive Care': { startNum: 101, count: 2 },
    'Infectious Disease': { startNum: 201, count: 10 },
    'General Care': { startNum: 301, count: 20 },
  }
  assignBedToPatient(BED_CONFIG, waitList_patient)
  markBedAsOccupied(waitList_patient.wardCategory, waitList_patient.patientID)
  Í
  // Remove the patient from the UI waiting list
  waitingList.firstChild.remove()

  // Extract patientID from the list item, assuming it starts with "ID: "
  const admittedPatientText = admittedPatientLi.textContent
  const patientID = admittedPatientText.split(',')[0].split(': ')[1]
  console.log(patientID)

  // Remove the patient from the WaitList object store
  const waitListTransaction = db.transaction(['WaitList'], 'readwrite')
  const waitListStore = waitListTransaction.objectStore('WaitList')
  const waitListIndex = waitListStore.index('patientID')

  try {
    const waitListKey = await new Promise((resolve, reject) => {
      const request = waitListIndex.getKey(patientID)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () =>
        reject(new Error('Failed to get key from WaitList'))
    })

    if (waitListKey != undefined) {
      await new Promise((resolve, reject) => {
        const deleteRequest = waitListStore.delete(waitListKey)

        deleteRequest.onsuccess = () => {
          console.log('Patient deleted from database successfully')
          resolve()
        }
        deleteRequest.onerror = () => {
          console.error('Failed to delete patient from database')
          reject(new Error('Failed to delete patient'))
        }
      })
    }

    const bedElement = document.querySelector('.bed-sheet[data-bed-number]')
    const bedNumber = bedElement
      ? bedElement.getAttribute('data-bed-number')
      : null

    // const bedNumber = bedElement.getAttribute('data-bed-number')

    if (bedNumber !== null) {
      console.log(
        `Patient with ID ${patientID} has been admitted and assigned to bed #${bedNumber}`
      )
    } else {
      console.log('Could not admit patient, no available beds.')
    }
  } catch (error) {
    console.error('Error in admitPatient:', error)
  }
}
