//Finds an available bed for a patient.
function findAvailableBed() {
  // Get all bed elements
  const allBeds = document.querySelectorAll('.bed-sheet')

  // Iterate over each bed
  for (let bed of allBeds) {
    // Check if the bed is unoccupied
    if (bed.dataset.occupied === 'false') {
      // Return the bed number
      return bed.dataset.bedNumber
    }
  }

  // Return null if no beds are available
  return null
}

//Assigns a bed to a patient based on the ward category.
async function assignBedToPatient(patient, wardCategory) {
  // Define the configuration for each ward category
  const BED_CONFIG = {
    'Intensive Care': { startNum: 101, count: 2 },
    'Infectious Disease': { startNum: 201, count: 10 },
    'General Care': { startNum: 301, count: 20 },
  }

  console.log('Trying to assign bed for ward category:', wardCategory)

  // Check if the ward category is valid
  if (!wardCategory || !BED_CONFIG[wardCategory]) {
    console.error('Invalid ward category:', wardCategory)
    return null
  }

  // Get the start number and count for the ward category
  const { startNum, count } = BED_CONFIG[wardCategory]
  const endNum = startNum + count - 1

  try {
    // Loop through the bed numbers within the range
    for (let i = startNum; i <= endNum; i++) {
      // Check if the bed is occupied
      const isOccupied = await isBedOccupied(i)
      console.log(`Is bed ${i} occupied?`, isOccupied)

      // If the bed is not occupied, mark it as occupied and assign it to the patient
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

// Marks a bed as occupied in the database and updates the UI.
async function markBedAsOccupied(bedNumber, patientID, wardCategory) {
  // Check if the database is initialized
  if (!db) {
    console.error('Database not initialized')
    return
  }

  // Check for invalid input
  if (!bedNumber || !patientID || !wardCategory) {
    console.error('Invalid input')
    return
  }

  // Update the UI to mark the bed as occupied
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

  // Update the bed status in the database
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
// Show Occupancy Time and show Discharge Status after it, then update the UI.
async function bedOccupancyTime(patientID, bedNumber) {
  // Create patient status element and get the list item
  const { li: patientLi } = createPatientStatus(patientID, 'Occupied', 120)

  // Wait for the specified bed occupancy time
  await delay(BED_OCCUPANCY_TIME)
  patientLi.remove()

  // Find the bed element with the specified bed number
  const bedElement = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )

  if (bedElement) {
    // Find the discharge button within the bed element
    const dischargeButton = bedElement.querySelector('.discharge-btn')

    // If the discharge button exists, display it
    if (dischargeButton) {
      dischargeButton.style.display = 'block'
    }

    // Alert that the patient in the bed can now be discharged
    alert(`Patient in Bed #${bedNumber} can now be discharged`)
  }
}
//show the discharge status if refresh the page
async function domBedOccupancyTime(bedNumber) {
  const bedElement = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )

  if (bedElement) {
    const dischargeButton = bedElement.querySelector('.discharge-btn')
    if (dischargeButton) {
      dischargeButton.style.display = 'block'
    }
  }
}
// Check if the bed is occupied in the database.
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
      return false
    } else {
      return true
    }
  } catch (error) {
    console.error('Error checking bed occupancy:', error)
    throw error
  }
}
