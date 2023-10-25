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
  console.log(patientID)

  // Remove the patient from the WaitList object store
  const waitListTransaction = db.transaction(['WaitList'], 'readwrite')
  const waitListStore = waitListTransaction.objectStore('WaitList')
  await waitListStore.delete(patientID)
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
}
