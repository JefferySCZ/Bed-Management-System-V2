// Constants
const ADMISSION_TIME = 600
const BED_OCCUPANCY_TIME = 1200
const SANITIZING_TIME = 1200
const WAITING_TIME = 600

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
  const patientElement = createSpanElement(
    `status-${patientID} patientID`,
    `${patientID}`
  )
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
