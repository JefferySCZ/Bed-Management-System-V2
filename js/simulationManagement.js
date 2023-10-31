// Constants
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

function createBedStatus(bedNumber, status, duration) {
  const li = document.createElement('li')
  const bedElement = createSpanElement('bedNumber', `Bed: ${bedNumber}`)

  const statusElement = createSpanElement('bed-status-text', `${status}`)
  const timerElement = createSpanElement('bed-timer', `Timer:${duration}`)

  li.appendChild(bedElement)
  li.appendChild(statusElement)
  li.appendChild(timerElement)

  document.querySelector('.simulation-waiting-list ul').appendChild(li)

  // Initialize countdown timer
  let remainingTime = duration // Assuming duration is in seconds
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

function createLatestBedStatus(bedNumber, status) {
  const li = document.createElement('li')
  const bedElement = createSpanElement('bedNumber', `Bed: ${bedNumber}`)
  const statusElement = createSpanElement('bed-status-text', `${status}`)

  li.appendChild(bedElement)
  li.appendChild(statusElement)

  const ul = document.querySelector('.simulation-waiting-list ul')
  ul.appendChild(li)
  return { li, statusElement }
}

function startCountdown(durationInSeconds, displayElement) {
  let timer = durationInSeconds
  const intervalId = setInterval(() => {
    displayElement.textContent = `Timer: ${timer}`
    timer--

    if (timer < 0) {
      clearInterval(intervalId)
      displayElement.textContent = 'Timer: Done'
    }
  }, 1000)
}
