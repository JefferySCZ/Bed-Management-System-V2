document.addEventListener('DOMContentLoaded', function () {
  //Display Age function
  document
    .getElementById('patient-DOB')
    .addEventListener('change', function (event) {
      const dob = new Date(this.value)
      const now = new Date()

      if (dob > now) {
        document.getElementById('patient-age').value = 'Invalid DOB'
        return
      }
      const ageDiff = now - dob
      const ageDate = new Date(ageDiff)
      const age = Math.abs(ageDate.getUTCFullYear() - 1970)

      if (age > 125) {
        document.getElementById('patient-age').value = 'Age exceeds valid range'
        return
      }

      document.getElementById('patient-age').value = age + ' years old'
    })
})

function generateWard(title, numOfBeds, startingBedNumber) {
  let ward = document.createElement('div')
  ward.className = 'ward'

  let h3 = document.createElement('h3')
  h3.textContent = title
  ward.appendChild(h3)

  let bedRow = document.createElement('div')
  bedRow.className = 'bed-row'

  for (let i = 0; i < numOfBeds; i++) {
    let bed = document.createElement('div')
    bed.className = 'bed-icon'

    let pillow = document.createElement('div')
    pillow.className = 'pillow'
    bed.appendChild(pillow)

    let bedSheet = document.createElement('div')
    bedSheet.className = 'bed-sheet'
    bedSheet.dataset.occupied = 'false'
    bedSheet.dataset.bedNumber = startingBedNumber + i
    bedSheet.classList.add(
      bedSheet.dataset.occupied === 'true' ? 'occupied' : 'available'
    )

    bed.appendChild(bedSheet)

    let bedNumberSpan = document.createElement('span')
    bedNumberSpan.className = 'bed-number'
    bedNumberSpan.textContent = startingBedNumber + i
    bed.appendChild(bedNumberSpan)

    //Discharge button
    let dischargeButton = document.createElement('button')
    dischargeButton.className = 'discharge-btn'
    dischargeButton.textContent = 'Discharge'
    // Hidden button when the bed is unoccupied
    dischargeButton.addEventListener('click', function () {
      dischargePatient(bedSheet.dataset.bedNumber)
    })
    bedSheet.appendChild(dischargeButton)

    // let tooltipContainer = document.createElement('div')
    // tooltipContainer.className = 'tooltip-container'
    // tooltipContainer.dataset.bedNumber = startingBedNumber + i // Add this line

    // bedSheet.appendChild(tooltipContainer)

    let tooltipContent = document.createElement('div')
    tooltipContent.className = 'tooltip-content'
    // tooltipContainer.appendChild(tooltipContent)
    bedSheet.appendChild(tooltipContent)

    bedRow.appendChild(bed)
  }

  ward.appendChild(bedRow)

  return ward
}

let bedSection = document.querySelector('.bed-ward-section')
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

wardConfigurations.forEach((config) => {
  bedSection.appendChild(
    generateWard(config.title, config.beds, config.startNumber)
  )
})

let timerValue = 0
const maxTime = 100 // assuming 100 seconds for full progress
const progressBar = document.getElementById('timer-progress')
const timerSpan = document.querySelector('.timer')

// Update every second (1000 milliseconds)
const intervalId = setInterval(() => {
  if (timerValue < maxTime) {
    timerValue++
    progressBar.value = timerValue
    timerSpan.textContent = timerValue
  } else {
    clearInterval(intervalId)
  }
}, 1000)

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
