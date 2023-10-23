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
    wardCategory,
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
