// Constants for simulation time
const ADMISSION_TIME = 10000
const BED_OCCUPANCY_TIME = 15000
const PENDING_SANITIZING_TIME = 10000
const SANITIZING_TIME = 15000
const BED_AVAILABILITY_STATUS = 5000

// Utility function to introduce delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createSpanElement(className, textContent) {
  const span = document.createElement('span')
  span.className = className
  span.textContent = textContent
  return span
}
function createPatientStatus(patientID, status, duration) {
  const li = document.createElement('li')
  const patientElement = createSpanElement('patientID', `${patientID}`)
  const statusElement = createSpanElement('patient-status-text', `${status}`)
  const timerElement = createSpanElement('patient-timer', `Timer:${duration}`)

  li.appendChild(patientElement)
  li.appendChild(statusElement)
  li.appendChild(timerElement)

  document.querySelector('.simulation-waiting-list ul').appendChild(li)
  // Initialize countdown timer
  let remainingTime = duration // 1000  Assuming duration is in milliseconds, convert to seconds
  const intervalId = setInterval(() => {
    timerElement.textContent = `Timer: ${remainingTime}`
    remainingTime--

    if (remainingTime < 0) {
      clearInterval(intervalId)
      timerElement.textContent = 'Timer: Done'
    }
  }, 1000)
  return { li, statusElement, timerElement }
}

//Creates a bed status element and adds it to the waiting list.

function createBedStatus(bedNumber, status, duration) {
  const li = document.createElement('li')

  const bedElement = createSpanElement('bedNumber', `Bed: ${bedNumber}`)

  const statusElement = createSpanElement('bed-status-text', `${status}`)

  const timerElement = createSpanElement('bed-timer', `Timer:${duration}`)

  // Append the elements to the list item
  li.appendChild(bedElement)
  li.appendChild(statusElement)
  li.appendChild(timerElement)

  // Append the list item to the waiting list
  document.querySelector('.simulation-waiting-list ul').appendChild(li)

  // Initialize countdown timer
  let remainingTime = duration
  const intervalId = setInterval(() => {
    timerElement.textContent = `Timer: ${remainingTime}`
    remainingTime--

    if (remainingTime < 0) {
      clearInterval(intervalId)
      timerElement.textContent = 'Timer: Done'
    }
  }, 1000)

  // Return the created elements
  return { li, statusElement, timerElement }
}

//Creates the latest bed status element and adds it to the waiting list.
function createLatestBedStatus(bedNumber, status) {
  const li = document.createElement('li')
  const bedElement = createSpanElement('bedNumber', `Bed: ${bedNumber}`)
  const statusElement = createSpanElement('bed-status-text', `${status}`)

  // Append the bed number and status elements to the list item
  li.appendChild(bedElement)
  li.appendChild(statusElement)

  const ul = document.querySelector('.simulation-waiting-list ul')
  ul.appendChild(li)

  // Return the created list item and status element
  return { li, statusElement }
}

//Starts a countdown timer and updates the display element with the remaining time.
function startCountdown(durationInSeconds, displayElement) {
  let timer = durationInSeconds

  // Update the display element with the remaining time every second
  const intervalId = setInterval(() => {
    displayElement.textContent = `Timer: ${timer}`
    timer--

    // Stop the countdown when the timer reaches 0 and update the display with "Timer: Done"
    if (timer < 0) {
      clearInterval(intervalId)
      displayElement.textContent = 'Timer: Done'
    }
  }, 1000)
}
