document.addEventListener('DOMContentLoaded', function () {
  //Display Age function
  document
    .getElementById('patient-DOB')
    .addEventListener('change', function (event) {
      // Get the date of birth from the input value
      const dob = new Date(this.value)
      const now = new Date()
      // Check if the date of birth is in the future

      if (dob > now) {
        document.getElementById('patient-age').value = 'Invalid DOB'
        return
      }
      // Calculate the age difference in milliseconds
      const ageDiff = now - dob
      // Convert the age difference to a Date object
      const ageDate = new Date(ageDiff)
      // Get the year component of the age difference
      const age = Math.abs(ageDate.getUTCFullYear() - 1970)

      // Check if the calculated age exceeds the valid range
      if (age > 125) {
        document.getElementById('patient-age').value = 'Age exceeds valid range'
        return
      }
      // Display the calculated age in years
      document.getElementById('patient-age').value = age + ' years old'
    })
})

//Generates a ward element with beds.

function generateWard(title, numOfBeds, startingBedNumber) {
  // Create the ward element
  let ward = document.createElement('div')
  ward.className = 'ward'

  let h3 = document.createElement('h3')
  h3.textContent = title
  ward.appendChild(h3)

  // Create the container for the bed rows
  let bedRow = document.createElement('div')
  bedRow.className = 'bed-row'

  // Generate each bed element
  for (let i = 0; i < numOfBeds; i++) {
    // Create the bed element
    let bed = document.createElement('div')
    bed.className = 'bed-icon'

    // Create the pillow element
    let pillow = document.createElement('div')
    pillow.className = 'pillow'
    bed.appendChild(pillow)

    // Create the bed sheet element
    let bedSheet = document.createElement('div')
    bedSheet.className = 'bed-sheet'
    bedSheet.dataset.occupied = 'false'
    bedSheet.dataset.bedNumber = startingBedNumber + i
    bedSheet.classList.add(
      bedSheet.dataset.occupied === 'true' ? 'occupied' : 'available'
    )
    bed.appendChild(bedSheet)

    // Create the bed number element
    let bedNumberSpan = document.createElement('span')
    bedNumberSpan.className = 'bed-number'
    bedNumberSpan.textContent = startingBedNumber + i
    bed.appendChild(bedNumberSpan)

    // Create the discharge button
    let dischargeButton = document.createElement('button')
    dischargeButton.className = 'discharge-btn'
    dischargeButton.textContent = 'Discharge'
    // Add event listener for discharge button click
    dischargeButton.addEventListener('click', function () {
      dischargePatient(bedSheet.dataset.bedNumber)
    })
    bedSheet.appendChild(dischargeButton)

    // Create the tooltip content element
    let tooltipContent = document.createElement('div')
    tooltipContent.className = 'tooltip-content'
    bedSheet.appendChild(tooltipContent)

    bedRow.appendChild(bed)
  }

  ward.appendChild(bedRow)

  // Return the generated ward element
  return ward
}

let bedSection = document.querySelector('.bed-ward-section')
// Define an array of ward configurations
const wardConfigurations = [
  {
    title: 'Intensive Care Ward (10 beds) - Level 1',
    beds: 2,
    startNumber: 101,
  },
  {
    title: 'Infectious Disease Ward (10 beds) - Level 2',
    beds: 10,
    startNumber: 201,
  },
  { title: 'General Ward (20 beds) - Level 3', beds: 20, startNumber: 301 },
]
// Iterate over the ward configurations
wardConfigurations.forEach((config) => {
  // Append a ward element generated using the configuration to the bed section
  bedSection.appendChild(
    generateWard(config.title, config.beds, config.startNumber)
  )
})

//Tooltip part
const tooltipContainer = document.querySelector('.tooltip-container')
const tooltipContent = tooltipContainer.querySelector('.tooltip-content')

function showTooltip(event, content) {
  tooltipContent.innerHTML = content

  tooltipContainer.classList.add('show')
}

function hideTooltip() {
  tooltipContainer.classList.remove('show')
}

const beds = document.querySelectorAll('.bed-sheet')
beds.forEach((bed) => {
  bed.addEventListener('mouseover', (event) => {
    const bedNumber = bed.dataset.bedNumber
    const patientData = `Patient Data for Bed ${bedNumber}`
    showTooltip(event, patientData)
  })
  bed.addEventListener('mouseout', () => {
    hideTooltip()
  })
})

document.addEventListener('DOMContentLoaded', function () {
  // Listen for hover events on beds
  document.querySelectorAll('.bed-sheet').forEach(function (bed) {
    bed.addEventListener('mouseenter', async function () {
      const bedNumber = bed.dataset.bedNumber

      try {
        const patient = await getPatientByBedNumber(bedNumber)
        console.log('Retrieved patient:', patient)
        if (patient) {
          // Update tooltip content
          const tooltip = bed.querySelector('.tooltip-content')
          tooltip.innerHTML = `
            <strong>Patient ID:</strong> ${patient.patientID}<br>
            <strong>Name:</strong> ${patient.name}<br>
            <strong>Age:</strong> ${patient.age}<br>
            <strong>Blood Type:</strong> ${patient.bloodType}<br>
            <strong>Illness:</strong> ${patient.illness}<br>
            <!-- Add more fields as needed -->
          `
          tooltip.classList.add('show')
        }
      } catch (err) {
        console.error('Could not retrieve patient:', err)
      }
    })
    bed.addEventListener('mouseleave', function () {
      const tooltipContainer = bed.querySelector('.tooltip-content')
      tooltipContainer.classList.remove('show')
    })
  })
})
