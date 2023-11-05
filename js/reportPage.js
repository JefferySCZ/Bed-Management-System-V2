document.addEventListener('DOMContentLoaded', (event) => {
  const patientData = JSON.parse(localStorage.getItem('patients')) || []
  patientData.forEach((patient) => {
    insertPatientDataIntoTable(patient)
  })
})
function deletePatientFromLocalStorage(patientID) {
  // Retrieve the patients data from localStorage and parse it
  const patientsData = localStorage.getItem('patients')
  // Check if patientsData is not null
  if (patientsData) {
    // Parse the string to an array
    const patientsArray = JSON.parse(patientsData)
    // Check if patientsArray is an array
    if (Array.isArray(patientsArray)) {
      // Filter out the patient with the matching patientID
      const filteredPatients = patientsArray.filter(
        (patient) => patient.patientID !== patientID
      )
      // Save the filtered list back to localStorage
      localStorage.setItem('patients', JSON.stringify(filteredPatients))
    } else {
      console.error('Patients data is not an array')
    }
  } else {
    console.error('No patients data in localStorage')
  }
}

//Inserts patient data into the table.
function insertPatientDataIntoTable(patient) {
  // Find the table body element
  const tableBody = document.querySelector('#patientTable tbody')

  // Insert a new row into the table
  const row = tableBody.insertRow()

  // Create a checkbox element for selecting the patient
  const selectCell = row.insertCell()
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.className = 'patient-select'
  checkbox.value = patient.patientID
  selectCell.appendChild(checkbox)

  // Insert the patient data into cells
  const cellData = [
    patient.patientID,
    patient.name,
    patient.gender,
    patient.bloodType,
    patient.dob,
    patient.age,
    patient.illness,
    patient.wardCategory,
  ]
  cellData.forEach((text) => {
    let cell = row.insertCell()
    cell.textContent = text
  })

  // Create a delete button and add an event listener
  const deleteCell = row.insertCell()
  const deleteButton = document.createElement('button')
  deleteButton.textContent = 'Delete'
  deleteButton.addEventListener('click', function () {
    // Check if the checkbox is checked before deleting the row
    if (checkbox.checked) {
      row.remove()
      deletePatientFromLocalStorage(patient.patientID)
    } else {
      alert('Please check the box to confirm deletion.')
    }
  })
  deleteCell.appendChild(deleteButton)
}

// Add event listener to the 'deleteSelected' button
document
  .getElementById('deleteSelected')
  .addEventListener('click', function () {
    // Get all selected checkboxes
    const selectedCheckboxes = document.querySelectorAll('.patient-select')

    // Iterate over each selected checkbox
    selectedCheckboxes.forEach((checkbox) => {
      // Get the parent row of the checkbox
      const row = checkbox.closest('tr')

      // Get the patient ID from the first cell of the row
      const patientID = row.cells[0].textContent

      // Remove the row from the table
      row.remove()

      // Delete the patient from local storage
      deletePatientFromLocalStorage(patientID)
    })
  })

//Export table data to CSV

function exportTable() {
  // Get the table element
  var table = document.getElementById('patientTable')

  // Get all the rows in the table
  var rows = table.rows

  // Create the CSV content with UTF-8 encoding
  var csvContent = 'data:text/csv;charset=utf-8,'

  // Iterate over each row in the table
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName('td')

    var row = []

    // Iterate over each cell in the row
    for (var j = 1; j < cells.length - 1; j++) {
      // Add the inner HTML of the cell to the row array
      row.push(cells[j].innerHTML)
    }

    // Add the row to the CSV content, separated by commas
    csvContent += row.join(',') + '\n'
  }

  // Encode the CSV content URI
  var encodedUri = encodeURI(csvContent)
  var link = document.createElement('a')

  // Set the link attributes
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'patientData.csv')

  // Append the link to the document body
  document.body.appendChild(link)

  // Trigger a click event on the link to download the CSV file
  link.click()
}

/**
 * Filters the table based on the value entered in the search input.
 */
function filterTable() {
  let input = document.getElementById('searchInput')
  let filter = input.value.toUpperCase()
  let table = document.getElementById('patientTable')
  let rows = table.getElementsByTagName('tr')

  // Iterate over each row starting from the second row (first row is the header)
  for (let i = 1; i < rows.length; i++) {
    // Get all the cells in the current row
    let cells = rows[i].getElementsByTagName('td')

    // Flag to track whether the row matches the filter value
    let isRowMatch = false

    // Iterate over each cell in the current row
    for (let j = 0; j < cells.length; j++) {
      // Get the text content of the current cell
      let cellText = cells[j].textContent || cells[j].innerText

      // Check if the cell text contains the filter value
      if (cellText.toUpperCase().indexOf(filter) > -1) {
        isRowMatch = true
        break
      }
    }

    // Show or hide the row based on whether it matches the filter value
    if (isRowMatch) {
      rows[i].style.display = ''
    } else {
      rows[i].style.display = 'none'
    }
  }
}
function sortTable(n) {
  let table,
    rows,
    switching,
    i,
    x,
    y,
    shouldSwitch,
    dir,
    switchCount = 0
  table = document.getElementById('patientTable')
  switching = true
  // Set the sorting direction to ascending:
  dir = 'asc'
  /* Make a loop that will continue until no switching has been done: */
  while (switching) {
    switching = false
    rows = table.rows
    /* Loop through all rows, except the first (which contains table headers): */
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false
      /* Get the elements to compare, one from current row and one from the next: */
      x = rows[i].getElementsByTagName('td')[n]
      y = rows[i + 1].getElementsByTagName('td')[n]
      /* Check if the two rows should switch place, based on the direction, asc or desc: */
      if (dir == 'asc') {
        if (x.textContent.toLowerCase() > y.textContent.toLowerCase()) {
          shouldSwitch = true
          break
        }
      } else if (dir == 'desc') {
        if (x.textContent.toLowerCase() < y.textContent.toLowerCase()) {
          shouldSwitch = true
          break
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
      switchCount++
    } else {
      /* If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again. */
      if (switchCount == 0 && dir == 'asc') {
        dir = 'desc'
        switching = true
      }
    }
  }
}

function refreshPage() {
  window.location.reload()
}
