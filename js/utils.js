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
