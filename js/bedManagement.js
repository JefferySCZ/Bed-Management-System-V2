function findAvailableBed() {
  const allBeds = document.querySelectorAll('.bed-sheet')
  for (let bed of allBeds) {
    if (bed.dataset.occupied === 'false') {
      return bed.dataset.bedNumber
    }
  }
  return null
}

async function assignBedToPatient(patient, wardCategory) {
  const BED_CONFIG = {
    'Intensive Care': { startNum: 101, count: 2 },
    'Infectious Disease': { startNum: 201, count: 10 },
    'General Care': { startNum: 301, count: 20 },
  }
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
        await markBedAsOccupied(i, patient.patientID, wardCategory)
        return i
      }
    }
  } catch (error) {
    console.error('Error checking occupancy for:', error)
    throw error
  }

  return null
}

async function markBedAsOccupied(bedNumber, patientID, wardCategory) {
  console.log('Inside markBedAsOccupied: ', patientID, wardCategory)

  if (!db) {
    console.error('Database not initialized')
    return
  }

  if (!bedNumber || !patientID || !wardCategory) {
    console.error('Invalid input')
    return
  }
  const bedElement = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )

  if (bedElement) {
    bedElement.classList.remove('available')
    bedElement.classList.add('occupied')
    bedElement.dataset.occupied = 'true'

    const dischargeButton = bedElement.querySelector('.discharge-btn')
    if (dischargeButton) {
      dischargeButton.style.display = 'none'
    }
  }
  console.log('Bed successfully marked as occupied')

  const transaction = db.transaction(['Beds'], 'readwrite')
  const bedStore = transaction.objectStore('Beds')
  try {
    const bedData = {
      bedNumber,
      occupied: true,
      patientID,
      wardCategory,
    }
    await bedStore.put(bedData)
    console.log('Data to be saved:', bedData)

    return true
  } catch (error) {
    console.error('Error updating bed status in the database', error)
    return false
  }
}

async function bedOccupancyTime(patientID, bedNumber) {
  const { li: patientLi } = createPatientStatus(patientID, 'Occupied', 120)
  await delay(BED_OCCUPANCY_TIME)
  patientLi.remove()

  const bedElement = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )

  if (bedElement) {
    const dischargeButton = bedElement.querySelector('.discharge-btn')
    if (dischargeButton) {
      dischargeButton.style.display = 'block'
    }
    alert(`Patient in Bed #${bedNumber} can now be discharged`)
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
